import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Upload, AlertCircle, FileSpreadsheet, Check, Trash2, Download, RefreshCw, XCircle, Edit2, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { useTheme } from '../../context/ThemeContext';
import { useCycles } from '../../context/CycleContext';
import CSVEditor from '../../components/admin/CSVEditor';
import { parseFile, exportToFile, validateData } from '../../utils/fileParser';
import { uploadDataFile, saveImportedData } from '../../lib/db';
import type { DataField, ImportedFile } from '../../types';

const DEFAULT_STRUCTURE: DataField[] = [
  { id: '1', name: 'Student ID', type: 'text', required: true, order: 0 },
  { id: '2', name: 'First Name', type: 'text', required: true, order: 1 },
  { id: '3', name: 'Last Name', type: 'text', required: true, order: 2 },
];

const PERIOD_TYPES = [
  { id: 'monthly', name: 'Monthly Results' },
  { id: 'quarterly', name: 'Quarterly Results' },
  { id: 'yearly', name: 'Yearly Results' },
];

const PERIODS = {
  monthly: Array.from({ length: 12 }, (_, i) => ({
    id: `M${i + 1}`,
    name: new Date(0, i).toLocaleString('default', { month: 'long' })
  })),
  quarterly: Array.from({ length: 4 }, (_, i) => ({
    id: `Q${i + 1}`,
    name: `Quarter ${i + 1}`
  })),
  yearly: [{ id: 'Y1', name: 'Full Year' }]
};

export default function ImportData() {
  const { cycleId, classId } = useParams();
  const { theme } = useTheme();
  const { getCycle, updateClass } = useCycles();
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const dropZoneRef = React.useRef<HTMLDivElement>(null);
  const [periodType, setPeriodType] = React.useState('');
  const [period, setPeriod] = React.useState('');
  const [file, setFile] = React.useState<File | null>(null);
  const [isUploading, setIsUploading] = React.useState(false);
  const [importedFiles, setImportedFiles] = React.useState<ImportedFile[]>([]);
  const [isEditing, setIsEditing] = React.useState(false);
  const [editingFile, setEditingFile] = React.useState<ImportedFile | null>(null);
  const [isDragging, setIsDragging] = React.useState(false);

  const cycle = getCycle(cycleId || '');
  const currentClass = cycle?.classes.find(c => c.id === classId);

  React.useEffect(() => {
    if (currentClass?.importedData) {
      setImportedFiles(currentClass.importedData);
    }
  }, [currentClass]);

  React.useEffect(() => {
    const dropZone = dropZoneRef.current;
    if (!dropZone) return;

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      setIsDragging(true);
    };

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
    };

    const handleDrop = async (e: DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const droppedFile = e.dataTransfer?.files[0];
      if (droppedFile) {
        handleFileSelection(droppedFile);
      }
    };

    dropZone.addEventListener('dragover', handleDragOver);
    dropZone.addEventListener('dragleave', handleDragLeave);
    dropZone.addEventListener('drop', handleDrop);

    return () => {
      dropZone.removeEventListener('dragover', handleDragOver);
      dropZone.removeEventListener('dragleave', handleDragLeave);
      dropZone.removeEventListener('drop', handleDrop);
    };
  }, []);

  const handlePeriodTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPeriodType(e.target.value);
    setPeriod('');
  };

  const handleFileSelection = (selectedFile: File) => {
    const validTypes = [
      'text/csv',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel'
    ];

    if (validTypes.includes(selectedFile.type)) {
      setFile(selectedFile);
      toast.success('File selected', {
        description: `"${selectedFile.name}" is ready to be uploaded.`
      });
    } else {
      toast.error('Invalid file type', {
        description: 'Please select a CSV or Excel file.'
      });
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFileSelection(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file || !period || !currentClass) {
      toast.error('Missing information', {
        description: 'Please select both a file and a period.'
      });
      return;
    }

    setIsUploading(true);
    try {
      const parsedData = await parseFile(file);
      const validationResult = validateData(parsedData, currentClass.dataStructure.length > 0 
        ? currentClass.dataStructure 
        : DEFAULT_STRUCTURE
      );

      if (!validationResult.isValid) {
        throw new Error(validationResult.error);
      }

      // Upload le fichier dans Firebase Storage
      const fileUrl = await uploadDataFile(
        file,
        `classes/${currentClass.id}/imports/${period}_${Date.now()}_${file.name}`
      );

      const newFile: ImportedFile = {
        id: Date.now().toString(),
        fileName: file.name,
        period,
        uploadDate: new Date().toISOString(),
        status: 'completed',
        recordCount: parsedData.length,
        content: parsedData,
        fileUrl
      };

      // Sauvegarde les données dans Firestore
      await saveImportedData(currentClass.id, newFile);

      // Mettre à jour la classe avec les nouvelles données importées
      const updatedClass = {
        ...currentClass,
        importedData: [...(currentClass.importedData || []), newFile]
      };
      
      updateClass(cycleId!, updatedClass);
      setImportedFiles(prev => [...prev, newFile]);
      
      toast.success('Upload successful', {
        description: `${parsedData.length} records have been imported successfully.`
      });

      // Reset form
      setFile(null);
      setPeriod('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      toast.error('Upload failed', {
        description: error instanceof Error ? error.message : 'An error occurred while importing the file.'
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleEdit = (fileId: string) => {
    const file = importedFiles.find(f => f.id === fileId);
    if (file && file.content) {
      setEditingFile(file);
      setIsEditing(true);
    }
  };

  const handleSaveEdit = (data: Array<Record<string, any>>) => {
    if (editingFile && currentClass) {
      try {
        const validationResult = validateData(data, currentClass.dataStructure.length > 0 
          ? currentClass.dataStructure 
          : DEFAULT_STRUCTURE
        );
        
        if (!validationResult.isValid) {
          throw new Error(validationResult.error);
        }

        const updatedFiles = importedFiles.map(f => 
          f.id === editingFile.id 
            ? { ...f, content: data, recordCount: data.length }
            : f
        );

        const updatedClass = {
          ...currentClass,
          importedData: updatedFiles
        };

        updateClass(cycleId!, updatedClass);
        setImportedFiles(updatedFiles);

        toast.success('Changes saved', {
          description: 'The file has been updated successfully.'
        });
        setIsEditing(false);
        setEditingFile(null);
      } catch (error) {
        toast.error('Validation failed', {
          description: error instanceof Error ? error.message : 'Invalid data format'
        });
      }
    }
  };

  const handleDownload = (fileId: string) => {
    const file = importedFiles.find(f => f.id === fileId);
    if (file?.content) {
      exportToFile(file.content, 'csv', `${file.fileName.split('.')[0]}_exported`);
    }
  };

  const handleDelete = (fileId: string) => {
    if (currentClass) {
      const updatedFiles = importedFiles.filter(f => f.id !== fileId);
      const updatedClass = {
        ...currentClass,
        importedData: updatedFiles
      };

      updateClass(cycleId!, updatedClass);
      setImportedFiles(updatedFiles);

      toast.success('File deleted', {
        description: 'The file has been removed successfully.'
      });
    }
  };

  if (!cycle || !currentClass) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Class not found
        </h2>
        <Link
          to="/admin"
          className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-${theme.primaryColor}-600 hover:bg-${theme.primaryColor}-700`}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Return to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Import Class Data</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Import student data and results for this class
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Result Type
            </label>
            <div className="relative">
              <select
                value={periodType}
                onChange={handlePeriodTypeChange}
                className="block w-full px-4 py-3 text-base border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 shadow-sm hover:border-gray-400 transition-colors appearance-none text-gray-900 dark:text-white"
              >
                <option value="" className="text-gray-500">Choose a result type...</option>
                {PERIOD_TYPES.map(type => (
                  <option key={type.id} value={type.id} className="text-gray-900 dark:text-white">
                    {type.name}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                </svg>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Select Period
            </label>
            <div className="relative">
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                disabled={!periodType}
                className="block w-full px-4 py-3 text-base border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 shadow-sm hover:border-gray-400 transition-colors appearance-none text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:text-gray-500 dark:disabled:text-gray-400 disabled:border-gray-200 dark:disabled:border-gray-700 disabled:cursor-not-allowed"
              >
                <option value="" className="text-gray-500">Choose a period...</option>
                {periodType && PERIODS[periodType as keyof typeof PERIODS].map(p => (
                  <option key={p.id} value={p.id} className="text-gray-900 dark:text-white">
                    {p.name}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                </svg>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Upload File
            </label>
            <div
              ref={dropZoneRef}
              className={`
                relative border-2 border-dashed rounded-lg p-6 transition-colors cursor-pointer
                ${isDragging
                  ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                  : 'border-gray-300 dark:border-gray-600 hover:border-indigo-500 bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800'
                }
              `}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="text-center">
                <FileSpreadsheet className={`
                  mx-auto h-12 w-12 transition-colors
                  ${isDragging
                    ? 'text-indigo-500'
                    : 'text-gray-400 group-hover:text-indigo-500'
                  }
                `} />
                <div className="mt-4">
                  <label className="relative cursor-pointer rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                    <span>Upload a file</span>
                    <input
                      ref={fileInputRef}
                      type="file"
                      className="sr-only"
                      accept=".csv,.xlsx,.xls"
                      onChange={handleFileSelect}
                    />
                  </label>
                  <p className="pl-1 text-gray-600 dark:text-gray-400">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">CSV or Excel files only</p>
              </div>
            </div>
          </div>
        </div>

        {file && (
          <div className="flex items-center space-x-2 text-sm bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 p-4 rounded-lg border border-green-200 dark:border-green-800">
            <Check className="h-5 w-5 text-green-500 dark:text-green-400 flex-shrink-0" />
            <span className="font-medium">{file.name}</span>
          </div>
        )}

        <div className="flex justify-end pt-4">
          <button
            onClick={handleUpload}
            disabled={!file || !period || isUploading}
            className={`
              inline-flex items-center px-6 py-3 border border-transparent rounded-lg shadow-sm text-base font-medium text-white
              transition-colors duration-200
              ${isUploading || !file || !period
                ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed opacity-60'
                : `bg-${theme.primaryColor}-600 hover:bg-${theme.primaryColor}-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-${theme.primaryColor}-500`
              }
            `}
          >
            {isUploading ? (
              <>
                <RefreshCw className="h-5 w-5 mr-3 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-5 w-5 mr-3" />
                Upload Data
              </>
            )}
          </button>
        </div>
      </div>

      {importedFiles.length > 0 && (
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Imported Files</h3>
          </div>
          <div>
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {importedFiles.map((importedFile) => (
                <li key={importedFile.id} className="px-6 py-5 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <FileSpreadsheet className="h-8 w-8 text-indigo-500 dark:text-indigo-400" />
                      <div>
                        <p className="text-base font-medium text-gray-900 dark:text-white">{importedFile.fileName}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          Period: <span className="font-medium text-gray-700 dark:text-gray-300">{importedFile.period}</span> • 
                          Records: <span className="font-medium text-gray-700 dark:text-gray-300">{importedFile.recordCount}</span> • 
                          Uploaded: <span className="font-medium text-gray-700 dark:text-gray-300">
                            {new Date(importedFile.uploadDate).toLocaleDateString()}
                          </span>
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() => handleEdit(importedFile.id)}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 p-2 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                        title="Edit"
                      >
                        <Edit2 className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDownload(importedFile.id)}
                        className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        title="Download"
                      >
                        <Download className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(importedFile.id)}
                        className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {isEditing && editingFile && (
        <CSVEditor
          isOpen={isEditing}
          onClose={() => {
            setIsEditing(false);
            setEditingFile(null);
          }}
          onSave={handleSaveEdit}
          data={editingFile.content || []}
          structure={currentClass.dataStructure.length > 0 
            ? currentClass.dataStructure 
            : DEFAULT_STRUCTURE}
        />
      )}

      <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-400 dark:border-blue-500 p-4 rounded-md">
        <div className="flex">
          <div className="flex-shrink-0">
            <AlertCircle className="h-5 w-5 text-blue-400" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              For number fields that represent grades, you can use formats like "12-15-13.5" (separated by dashes),
              "12/15/13.5" (separated by slashes), or "121513.5" (concatenated). The first number is the class grade,
              the second is the departmental grade, and the third is the average.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
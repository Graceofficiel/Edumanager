import React from 'react';
import { X, Save, Plus, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import type { DataField } from '../../types';

interface CSVEditorProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Array<Record<string, any>>) => void;
  data: Array<Record<string, any>>;
  structure: DataField[];
}

export default function CSVEditor({ isOpen, onClose, onSave, data, structure }: CSVEditorProps) {
  const { theme } = useTheme();
  const [editableData, setEditableData] = React.useState<Array<Record<string, any>>>(data);
  const [scrollPosition, setScrollPosition] = React.useState(0);
  const [newRows, setNewRows] = React.useState<Set<number>>(new Set());
  const tableRef = React.useRef<HTMLDivElement>(null);

  // Get all unique fields from the data
  const allFields = React.useMemo(() => {
    const fieldSet = new Set<string>();
    // Ensure Student ID is always first
    fieldSet.add('Student ID');
    // Add fields from structure
    structure.forEach(field => fieldSet.add(field.name));
    // Add remaining fields from data
    editableData.forEach(row => {
      Object.keys(row).forEach(key => fieldSet.add(key));
    });
    return Array.from(fieldSet);
  }, [editableData, structure]);

  const handleScroll = (direction: 'left' | 'right') => {
    if (tableRef.current) {
      const scrollAmount = 200;
      const newPosition = direction === 'left' 
        ? Math.max(0, scrollPosition - scrollAmount)
        : scrollPosition + scrollAmount;
      
      tableRef.current.scrollTo({
        left: newPosition,
        behavior: 'smooth'
      });
      setScrollPosition(newPosition);
    }
  };

  if (!isOpen) return null;

  const handleValueChange = (rowIndex: number, field: string, value: string) => {
    const newData = [...editableData];
    newData[rowIndex] = { ...newData[rowIndex], [field]: value };
    setEditableData(newData);
  };

  const handleAddRow = () => {
    const newRowIndex = editableData.length;
    const newRow = allFields.reduce((acc, field) => ({
      ...acc,
      [field]: field === 'Student ID' ? '' : '',
    }), {});
    setEditableData([...editableData, newRow]);
    setNewRows(new Set([...newRows, newRowIndex]));
  };

  const handleDeleteRow = (index: number) => {
    setEditableData(editableData.filter((_, i) => i !== index));
    // Update newRows indices after deletion
    const updatedNewRows = new Set<number>();
    newRows.forEach(rowIndex => {
      if (rowIndex < index) {
        updatedNewRows.add(rowIndex);
      } else if (rowIndex > index) {
        updatedNewRows.add(rowIndex - 1);
      }
    });
    setNewRows(updatedNewRows);
  };

  const handleSave = () => {
    // Validate that all new rows have an ID
    const invalidRows = Array.from(newRows).filter(index => 
      !editableData[index]['Student ID']?.trim()
    );

    if (invalidRows.length > 0) {
      alert('Please provide a Student ID for all new rows before saving.');
      return;
    }

    onSave(editableData);
    onClose();
  };

  const getInputType = (field: string) => {
    const structureField = structure.find(f => f.name === field);
    if (!structureField) return 'text';

    switch (structureField.type) {
      case 'number':
        return 'number';
      case 'date':
        return 'date';
      case 'photo':
        return 'text'; // URL input for photos
      default:
        return 'text';
    }
  };

  const isRequired = (field: string) => {
    const structureField = structure.find(f => f.name === field);
    return structureField?.required || false;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="fixed inset-0 bg-black opacity-30"></div>
        
        <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-[95vw] max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Edit Data</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="relative flex-1 overflow-hidden">
            {/* Scroll Buttons */}
            <div className="absolute left-0 top-1/2 -translate-y-1/2 z-10">
              <button
                onClick={() => handleScroll('left')}
                className="p-1 bg-white dark:bg-gray-800 rounded-r-md shadow-md hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <ChevronLeft className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              </button>
            </div>
            <div className="absolute right-0 top-1/2 -translate-y-1/2 z-10">
              <button
                onClick={() => handleScroll('right')}
                className="p-1 bg-white dark:bg-gray-800 rounded-l-md shadow-md hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <ChevronRight className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              </button>
            </div>

            {/* Table Container */}
            <div 
              ref={tableRef}
              className="overflow-x-auto overflow-y-auto max-h-[calc(90vh-8rem)]"
              style={{ scrollBehavior: 'smooth' }}
            >
              <table className="min-w-full border-separate border-spacing-0">
                <thead className="sticky top-0 z-10 bg-gray-50 dark:bg-gray-700">
                  <tr>
                    {allFields.map((field) => (
                      <th
                        key={field}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider whitespace-nowrap border-b border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700"
                        style={{ minWidth: field === 'Student ID' ? '150px' : '200px' }}
                      >
                        <div className="flex items-center space-x-1">
                          <span>{field}</span>
                          {isRequired(field) && (
                            <span className="text-red-500">*</span>
                          )}
                        </div>
                      </th>
                    ))}
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider whitespace-nowrap border-b border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 sticky right-0">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800">
                  {editableData.map((row, rowIndex) => (
                    <tr key={rowIndex} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      {allFields.map((field) => (
                        <td 
                          key={field} 
                          className="px-6 py-4 whitespace-nowrap border-b border-gray-200 dark:border-gray-700"
                          style={{ minWidth: field === 'Student ID' ? '150px' : '200px' }}
                        >
                          {field === 'Student ID' && !newRows.has(rowIndex) ? (
                            <span className="text-gray-500 dark:text-gray-400">{row[field]}</span>
                          ) : (
                            <input
                              type={getInputType(field)}
                              value={row[field] || ''}
                              onChange={(e) => handleValueChange(rowIndex, field, e.target.value)}
                              className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                                ${field === 'Student ID' && newRows.has(rowIndex) 
                                  ? 'border-yellow-300 dark:border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20' 
                                  : 'border-gray-300 dark:border-gray-600'
                                }`}
                              required={isRequired(field)}
                              min={getInputType(field) === 'number' ? '0' : undefined}
                              placeholder={field === 'Student ID' && newRows.has(rowIndex) ? 'Enter new Student ID' : ''}
                            />
                          )}
                        </td>
                      ))}
                      <td className="px-6 py-4 whitespace-nowrap border-b border-gray-200 dark:border-gray-700 text-right sticky right-0 bg-white dark:bg-gray-800">
                        <button
                          onClick={() => handleDeleteRow(rowIndex)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <button
              onClick={handleAddRow}
              className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-${theme.primaryColor}-600 hover:bg-${theme.primaryColor}-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-${theme.primaryColor}-500`}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Row
            </button>
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-${theme.primaryColor}-600 hover:bg-${theme.primaryColor}-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-${theme.primaryColor}-500`}
              >
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
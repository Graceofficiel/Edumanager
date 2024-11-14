import React from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Plus, FileSpreadsheet, AlertCircle, X, Trash2, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { Switch } from '../../components/ui/Switch';
import { useCycles } from '../../context/CycleContext';
import type { Class } from '../../types';
import { useTheme } from '../../context/ThemeContext';

interface AddClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (className: string) => void;
}

function AddClassModal({ isOpen, onClose, onAdd }: AddClassModalProps) {
  const [className, setClassName] = React.useState('');
  const { theme } = useTheme();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (className.trim()) {
      onAdd(className.trim());
      setClassName('');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="fixed inset-0 bg-black opacity-30"></div>
        
        <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Add New Class
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="className" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Class Name
              </label>
              <input
                type="text"
                id="className"
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter class name"
                required
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-${theme.primaryColor}-600 hover:bg-${theme.primaryColor}-700`}
              >
                Add Class
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function CycleManagement() {
  const navigate = useNavigate();
  const { cycleId } = useParams();
  const { cycles, addClass, removeClass, updateClass, getCycle } = useCycles();
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
  const [deleteConfirm, setDeleteConfirm] = React.useState<string | null>(null);
  const { theme } = useTheme();

  const cycle = getCycle(cycleId || '');
  const classes = cycle?.classes || [];

  if (!cycle) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Cycle not found
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

  const handleClassToggle = (classId: string, enabled: boolean) => {
    const classToUpdate = classes.find(c => c.id === classId);
    if (classToUpdate) {
      updateClass(cycleId!, { ...classToUpdate, enabled });
      toast.success(`Class ${enabled ? 'enabled' : 'disabled'}`, {
        description: `The class has been successfully ${enabled ? 'enabled' : 'disabled'}.`
      });
    }
  };

  const handleDeleteClass = (classId: string) => {
    setDeleteConfirm(classId);
  };

  const confirmDeleteClass = (classId: string) => {
    removeClass(cycleId!, classId);
    toast.success('Class deleted', {
      description: 'The class has been deleted successfully.'
    });
    setDeleteConfirm(null);
  };

  const handleStructureClick = (classId: string) => {
    navigate(`/admin/class/${cycleId}/${classId}/structure`);
  };

  const handleImportClick = (classId: string) => {
    navigate(`/admin/class/${cycleId}/${classId}/import`);
  };

  const handleAddClass = (className: string) => {
    const newClass: Class = {
      id: Date.now().toString(),
      name: className,
      enabled: true,
      dataStructure: []
    };
    addClass(cycleId!, newClass);
    toast.success('Class added', {
      description: 'The new class has been created successfully.'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-4 mb-2">
            <Link
              to="/admin"
              className={`inline-flex items-center text-gray-600 dark:text-gray-300 hover:text-${theme.primaryColor}-600 dark:hover:text-${theme.primaryColor}-400`}
            >
              <ArrowLeft className="h-5 w-5 mr-1" />
              Back to Dashboard
            </Link>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {cycle.name} - Class Management
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage classes and their data structure
          </p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-${theme.primaryColor}-600 hover:bg-${theme.primaryColor}-700`}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add New Class
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Class Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Data Structure
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Import Data
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {classes.map((cls) => (
              <tr key={cls.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">{cls.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Switch 
                    checked={cls.enabled} 
                    onCheckedChange={(enabled) => handleClassToggle(cls.id, enabled)}
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => handleStructureClick(cls.id)}
                    className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                  >
                    Configure Structure
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => handleImportClick(cls.id)}
                    className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                  >
                    <FileSpreadsheet className="h-4 w-4 mr-1" />
                    Import Data
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <button
                    onClick={() => handleDeleteClass(cls.id)}
                    className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black opacity-30"></div>
            
            <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Delete Class
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                Are you sure you want to delete this class? This action cannot be undone and will remove all associated data.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  onClick={() => confirmDeleteClass(deleteConfirm)}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Class Modal */}
      <AddClassModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddClass}
      />

      <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-400 dark:border-blue-500 p-4 rounded-md">
        <div className="flex">
          <div className="flex-shrink-0">
            <AlertCircle className="h-5 w-5 text-blue-400" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Make sure to configure the data structure before importing data. This will ensure proper data validation and organization.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
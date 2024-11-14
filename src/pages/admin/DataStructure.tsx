import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { GripVertical, Plus, Save, Trash2, ArrowLeft, Image } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { toast } from 'sonner';
import { useTheme } from '../../context/ThemeContext';
import { useCycles } from '../../context/CycleContext';
import type { DataField } from '../../types';

const DEFAULT_FIELDS: DataField[] = [
  { id: '1', name: 'First Name', type: 'text', required: true, order: 0, hasPhoto: false },
  { id: '2', name: 'Last Name', type: 'text', required: true, order: 1, hasPhoto: false },
  { id: '3', name: 'Birth Date', type: 'date', required: true, order: 2, hasPhoto: false },
  { id: '4', name: 'Student Photo', type: 'photo', required: false, order: 3 },
];

export default function DataStructure() {
  const { cycleId, classId } = useParams();
  const { theme } = useTheme();
  const { getCycle, updateClass } = useCycles();
  const [fields, setFields] = React.useState<DataField[]>([]);
  const [saving, setSaving] = React.useState(false);

  const cycle = getCycle(cycleId || '');
  const currentClass = cycle?.classes.find(c => c.id === classId);

  React.useEffect(() => {
    if (currentClass) {
      setFields(currentClass.dataStructure.length > 0 
        ? [...currentClass.dataStructure].sort((a, b) => a.order - b.order)
        : DEFAULT_FIELDS
      );
    }
  }, [currentClass]);

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

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(fields);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    const reorderedFields = items.map((item, index) => ({
      ...item,
      order: index,
    }));

    setFields(reorderedFields);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateClass(cycleId!, {
        ...currentClass,
        dataStructure: fields
      });
      toast.success('Structure saved', {
        description: 'The data structure has been updated successfully.'
      });
    } catch (error) {
      toast.error('Failed to save', {
        description: 'An error occurred while saving the structure.'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleAddField = () => {
    const newField: DataField = {
      id: String(Date.now()),
      name: 'New Field',
      type: 'text',
      required: false,
      order: fields.length,
      hasPhoto: false,
    };
    setFields([...fields, newField]);
  };

  const handleDeleteField = (id: string) => {
    setFields(fields.filter(field => field.id !== id));
    toast.success('Field removed', {
      description: 'The field has been removed from the structure.'
    });
  };

  const handleFieldChange = (id: string, updates: Partial<DataField>) => {
    setFields(prevFields => 
      prevFields.map(field => 
        field.id === id ? { ...field, ...updates } : field
      )
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-4 mb-2">
            <Link
              to={`/admin/cycle/${cycleId}`}
              className={`inline-flex items-center text-gray-600 dark:text-gray-300 hover:text-${theme.primaryColor}-600 dark:hover:text-${theme.primaryColor}-400`}
            >
              <ArrowLeft className="h-5 w-5 mr-1" />
              Back to Class Management
            </Link>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {currentClass.name} - Data Structure
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Configure the data fields for student information
          </p>
        </div>
        <div className="space-x-4">
          <button
            onClick={handleAddField}
            className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-${theme.primaryColor}-600 hover:bg-${theme.primaryColor}-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-${theme.primaryColor}-500`}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Field
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-${theme.primaryColor}-600 hover:bg-${theme.primaryColor}-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-${theme.primaryColor}-500 disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="fields">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="space-y-2"
            >
              {fields.map((field, index) => (
                <Draggable key={field.id} draggableId={field.id} index={index}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 flex items-center space-x-4"
                    >
                      <div
                        {...provided.dragHandleProps}
                        className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 cursor-grab active:cursor-grabbing"
                      >
                        <GripVertical className="h-5 w-5" />
                      </div>
                      
                      <input
                        type="text"
                        value={field.name}
                        onChange={(e) => handleFieldChange(field.id, { name: e.target.value })}
                        className={`flex-1 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm focus:ring-2 focus:ring-${theme.primaryColor}-500 focus:border-${theme.primaryColor}-500 px-3 py-2`}
                        placeholder="Field name"
                      />

                      <select
                        value={field.type}
                        onChange={(e) => handleFieldChange(field.id, { 
                          type: e.target.value as 'text' | 'number' | 'date' | 'photo',
                          hasPhoto: false // Reset hasPhoto when changing type
                        })}
                        className={`border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm focus:ring-2 focus:ring-${theme.primaryColor}-500 focus:border-${theme.primaryColor}-500 px-3 py-2`}
                      >
                        <option value="text">Text</option>
                        <option value="number">Number</option>
                        <option value="date">Date</option>
                        <option value="photo">Photo</option>
                      </select>

                      {field.type !== 'photo' && (
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={field.hasPhoto}
                            onChange={(e) => handleFieldChange(field.id, { hasPhoto: e.target.checked })}
                            className={`rounded border-gray-300 dark:border-gray-600 text-${theme.primaryColor}-600 shadow-sm focus:ring-${theme.primaryColor}-500`}
                          />
                          <span className="text-sm text-gray-600 dark:text-gray-300 flex items-center">
                            <Image className="h-4 w-4 mr-1" />
                            Has Photo
                          </span>
                        </label>
                      )}

                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={field.required}
                          onChange={(e) => handleFieldChange(field.id, { required: e.target.checked })}
                          className={`rounded border-gray-300 dark:border-gray-600 text-${theme.primaryColor}-600 shadow-sm focus:ring-${theme.primaryColor}-500`}
                        />
                        <span className="text-sm text-gray-600 dark:text-gray-300">Required</span>
                      </label>

                      <button
                        onClick={() => handleDeleteField(field.id)}
                        className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-400 dark:border-blue-500 p-4 rounded-md">
        <p className="text-sm text-blue-700 dark:text-blue-300">
          Drag and drop fields to reorder them. The order will be preserved when displaying and importing data.
          Fields with photos will allow uploading an image alongside the main value.
        </p>
      </div>
    </div>
  );
}
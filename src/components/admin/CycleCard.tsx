import React from 'react';
import { Switch } from '../ui/Switch';
import { ChevronRight, Trash2, Edit2, Check, X } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import type { Cycle } from '../../types';

interface CycleCardProps {
  cycle: Cycle;
  onToggle: (enabled: boolean) => void;
  onClick: () => void;
  onDelete: () => void;
  onNameChange: (name: string) => void;
}

export default function CycleCard({ cycle, onToggle, onClick, onDelete, onNameChange }: CycleCardProps) {
  const { theme } = useTheme();
  const [isEditing, setIsEditing] = React.useState(false);
  const [editedName, setEditedName] = React.useState(cycle.name);
  const inputRef = React.useRef<HTMLInputElement>(null);
  
  const handleToggle = (checked: boolean) => {
    onToggle(checked);
  };

  const startEditing = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
    setEditedName(cycle.name);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (editedName.trim()) {
      onNameChange(editedName.trim());
      setIsEditing(false);
    }
  };

  const handleCancel = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(false);
    setEditedName(cycle.name);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && editedName.trim()) {
      onNameChange(editedName.trim());
      setIsEditing(false);
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setEditedName(cycle.name);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition hover:shadow-lg">
      <div className="flex items-center justify-between mb-4">
        {isEditing ? (
          <div className="flex items-center space-x-2 flex-1">
            <input
              ref={inputRef}
              type="text"
              value={editedName}
              onChange={(e) => setEditedName(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 px-3 py-2 text-lg font-semibold bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-2 border-indigo-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              onClick={(e) => e.stopPropagation()}
              placeholder="Enter cycle name"
            />
            <button
              onClick={handleSave}
              className="p-2 text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-full"
            >
              <Check className="h-5 w-5" />
            </button>
            <button
              onClick={handleCancel}
              className="p-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{cycle.name}</h3>
            <button
              onClick={startEditing}
              className="p-1 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300"
            >
              <Edit2 className="h-4 w-4" />
            </button>
          </div>
        )}
        <div className="flex items-center space-x-2">
          <Switch checked={cycle.enabled} onCheckedChange={handleToggle} />
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="p-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </div>
      </div>
      
      <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
        <span>{cycle.classes.length} Classes</span>
        <button
          onClick={onClick}
          className={`inline-flex items-center px-3 py-1 text-${theme.primaryColor}-600 dark:text-${theme.primaryColor}-400 hover:text-${theme.primaryColor}-800 dark:hover:text-${theme.primaryColor}-300 focus:outline-none focus:underline`}
        >
          Manage Classes
          <ChevronRight className="h-4 w-4 ml-1" />
        </button>
      </div>
    </div>
  );
}
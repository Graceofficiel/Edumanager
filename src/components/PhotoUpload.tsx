import React from 'react';
import { Upload, X } from 'lucide-react';

interface PhotoUploadProps {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}

export default function PhotoUpload({ value, onChange, required }: PhotoUploadProps) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onChange(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-2">
      {value ? (
        <div className="relative w-32 h-32">
          <img
            src={value}
            alt="Uploaded photo"
            className="w-full h-full object-cover rounded-lg"
          />
          <button
            onClick={() => onChange('')}
            className="absolute -top-2 -right-2 p-1 bg-red-100 dark:bg-red-900 rounded-full text-red-600 dark:text-red-200 hover:bg-red-200 dark:hover:bg-red-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center w-32 h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-gray-400 dark:hover:border-gray-500">
          <Upload className="h-8 w-8 text-gray-400 dark:text-gray-500" />
          <span className="mt-2 text-sm text-gray-500 dark:text-gray-400">Upload Photo</span>
          <input
            type="file"
            className="hidden"
            accept="image/*"
            onChange={handleFileChange}
            required={required}
          />
        </label>
      )}
    </div>
  );
}
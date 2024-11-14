import React from 'react';
import { Save } from 'lucide-react';
import { toast } from 'sonner';
import { useTheme } from '../../context/ThemeContext';
import { useSchool } from '../../context/SchoolContext';
import PhotoUpload from '../../components/PhotoUpload';

export default function SchoolSettings() {
  const { theme } = useTheme();
  const { settings, updateSettings } = useSchool();
  const [name, setName] = React.useState(settings.name);
  const [logo, setLogo] = React.useState(settings.logo);

  const handleSave = () => {
    if (!name.trim()) {
      toast.error('School name is required');
      return;
    }

    updateSettings({
      name: name.trim(),
      logo
    });

    toast.success('Settings saved', {
      description: 'School settings have been updated successfully.'
    });
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">School Settings</h1>

      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            School Logo
          </label>
          <PhotoUpload
            value={logo}
            onChange={setLogo}
          />
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Recommended: Square image, at least 128x128 pixels
          </p>
        </div>

        <div>
          <label htmlFor="schoolName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            School Name
          </label>
          <input
            type="text"
            id="schoolName"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Enter school name"
            required
          />
        </div>

        <div className="pt-4">
          <button
            onClick={handleSave}
            className={`w-full inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-${theme.primaryColor}-600 hover:bg-${theme.primaryColor}-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-${theme.primaryColor}-500`}
          >
            <Save className="h-4 w-4 mr-2" />
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}
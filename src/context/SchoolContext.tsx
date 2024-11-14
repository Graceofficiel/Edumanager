import React, { createContext, useContext, useState, useEffect } from 'react';
import { getSchoolSettings, updateSchoolSettings } from '../lib/db';
import type { SchoolSettings } from '../types';

const defaultSettings: SchoolSettings = {
  name: 'EduManager',
  logo: '',
};

const SchoolContext = createContext<{
  settings: SchoolSettings;
  updateSettings: (settings: SchoolSettings) => Promise<void>;
  loading: boolean;
}>({
  settings: defaultSettings,
  updateSettings: async () => {},
  loading: true,
});

export function SchoolProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<SchoolSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const data = await getSchoolSettings();
      setSettings(data);
    } catch (error) {
      console.error('Error loading school settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (newSettings: SchoolSettings) => {
    try {
      await updateSchoolSettings(newSettings);
      setSettings(newSettings);
    } catch (error) {
      console.error('Error updating school settings:', error);
      throw error;
    }
  };

  return (
    <SchoolContext.Provider value={{ settings, updateSettings, loading }}>
      {children}
    </SchoolContext.Provider>
  );
}

export const useSchool = () => useContext(SchoolContext);
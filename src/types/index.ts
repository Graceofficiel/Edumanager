export interface Cycle {
  id: string;
  name: string;
  enabled: boolean;
  classes: Class[];
}

export interface Class {
  id: string;
  name: string;
  enabled: boolean;
  dataStructure: DataField[];
  importedData?: ImportedFile[];
}

export interface DataField {
  id: string;
  name: string;
  type: 'text' | 'number' | 'date' | 'photo';
  required: boolean;
  order: number;
  hasPhoto?: boolean;
}

export interface Student {
  id: string;
  cycleId: string;
  classId: string;
  data: Record<string, any>;
  results: Result[];
}

export interface Result {
  period: string;
  date: string;
  grades: Record<string, number>;
}

export interface ImportPeriod {
  id: string;
  name: string;
  type: 'monthly' | 'quarterly';
  order: number;
}

export interface ThemeConfig {
  primaryColor: string;
  secondaryColor: string;
  isDark: boolean;
}

export interface ImportedFile {
  id: string;
  fileName: string;
  period: string;
  uploadDate: string;
  status: 'processing' | 'completed' | 'error';
  recordCount?: number;
  errorMessage?: string;
  content: Array<Record<string, any>> | null;
}

export interface SchoolSettings {
  name: string;
  logo: string;
}
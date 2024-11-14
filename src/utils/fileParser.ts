import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import type { DataField } from '../types';

interface ValidationResult {
  isValid: boolean;
  error?: string;
}

// Fonction pour valider et parser les notes multiples
function validateGrades(value: string | number): boolean {
  if (typeof value === 'number') return true;
  
  // Accepte les formats: "12-15-13.5" ou "12/15/13.5" ou "121513.5"
  const formats = [
    /^\d{2}-\d{2}-\d{2}(\.\d+)?$/, // 12-15-13.5
    /^\d{2}\/\d{2}\/\d{2}(\.\d+)?$/, // 12/15/13.5
    /^\d{6}(\.\d+)?$/ // 121513.5
  ];

  return formats.some(format => format.test(value));
}

// Fonction pour normaliser les notes
function normalizeGrades(value: string | number): string {
  if (typeof value === 'number') return value.toString();
  
  // Si le format est déjà 12-15-13.5, retourner tel quel
  if (value.includes('-')) return value;
  
  // Si le format est 12/15/13.5, convertir en 12-15-13.5
  if (value.includes('/')) return value.replace(/\//g, '-');
  
  // Si le format est 121513.5, convertir en 12-15-13.5
  if (/^\d{6}(\.\d+)?$/.test(value)) {
    const grades = value.match(/(\d{2})(\d{2})(\d{2}(?:\.\d+)?)/);
    if (grades) {
      return `${grades[1]}-${grades[2]}-${grades[3]}`;
    }
  }
  
  return value;
}

export async function parseFile(file: File): Promise<Array<Record<string, any>>> {
  if (file.type === 'text/csv') {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => resolve(results.data),
        error: (error) => reject(error)
      });
    });
  } else {
    // Excel file
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    return XLSX.utils.sheet_to_json(worksheet);
  }
}

export function validateData(data: Array<Record<string, any>>, structure: DataField[]): ValidationResult {
  if (!Array.isArray(data) || data.length === 0) {
    return {
      isValid: false,
      error: 'No data found in the file'
    };
  }

  // Vérifier uniquement les champs requis
  const requiredFields = structure.filter(field => field.required).map(field => field.name);
  const firstRow = data[0];
  const missingFields = requiredFields.filter(field => !(field in firstRow));

  if (missingFields.length > 0) {
    return {
      isValid: false,
      error: `Missing required fields: ${missingFields.join(', ')}`
    };
  }

  // Valider les types de données pour les champs présents
  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    for (const field of structure) {
      const value = row[field.name];
      
      // Ignorer les champs non requis s'ils sont vides
      if (!field.required && (value === undefined || value === '')) {
        continue;
      }

      // Valider les champs requis ou les champs non requis avec des valeurs
      if (value !== undefined && value !== '') {
        if (field.type === 'number') {
          if (!validateGrades(value)) {
            return {
              isValid: false,
              error: `Row ${i + 1}: Invalid grade format for ${field.name}. Use format: 12-15-13.5 or 121513.5`
            };
          }
          // Normaliser le format des notes
          row[field.name] = normalizeGrades(value);
        }

        if (field.type === 'date') {
          if (!isValidDate(value)) {
            return {
              isValid: false,
              error: `Row ${i + 1}: Invalid date format for ${field.name}. Use DD/MM/YYYY or YYYY-MM-DD`
            };
          }
          // Standardiser le format de date
          row[field.name] = standardizeDate(value);
        }
      } else if (field.required) {
        return {
          isValid: false,
          error: `Row ${i + 1}: Missing required value for ${field.name}`
        };
      }
    }
  }

  return { isValid: true };
}

// Fonction pour normaliser les formats de date
function isValidDate(dateStr: string): boolean {
  // Accepte les formats: DD/MM/YYYY, DD-MM-YYYY, YYYY/MM/DD, YYYY-MM-DD
  const dateFormats = [
    /^(\d{2})[/-](\d{2})[/-](\d{4})$/, // DD/MM/YYYY ou DD-MM-YYYY
    /^(\d{4})[/-](\d{2})[/-](\d{2})$/, // YYYY/MM/DD ou YYYY-MM-DD
  ];

  for (const format of dateFormats) {
    if (format.test(dateStr)) {
      const parts = dateStr.split(/[/-]/);
      let year, month, day;

      if (parts[0].length === 4) {
        // Format YYYY/MM/DD
        [year, month, day] = parts;
      } else {
        // Format DD/MM/YYYY
        [day, month, year] = parts;
      }

      // Convertir en nombres
      const y = parseInt(year, 10);
      const m = parseInt(month, 10) - 1; // Les mois commencent à 0
      const d = parseInt(day, 10);

      // Créer et vérifier la date
      const date = new Date(y, m, d);
      return date.getFullYear() === y &&
             date.getMonth() === m &&
             date.getDate() === d;
    }
  }

  return false;
}

// Fonction pour standardiser le format de date
function standardizeDate(dateStr: string): string {
  const parts = dateStr.split(/[/-]/);
  
  if (parts[0].length === 4) {
    // YYYY/MM/DD -> DD/MM/YYYY
    const [year, month, day] = parts;
    return `${day}/${month}/${year}`;
  } else {
    // Déjà en format DD/MM/YYYY
    return dateStr.replace(/-/g, '/');
  }
}

export function exportToFile(data: Array<Record<string, any>>, type: 'csv' | 'xlsx', filename: string): void {
  if (type === 'csv') {
    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    downloadFile(blob, `${filename}.csv`);
  } else {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    downloadFile(blob, `${filename}.xlsx`);
  }
}

function downloadFile(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.parentNode?.removeChild(link);
}
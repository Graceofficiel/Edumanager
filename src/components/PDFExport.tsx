import React from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Download } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { toast } from 'sonner';

interface PDFExportProps {
  contentRef: React.RefObject<HTMLDivElement>;
  fileName: string;
}

export default function PDFExport({ contentRef, fileName }: PDFExportProps) {
  const { theme } = useTheme();
  const [exporting, setExporting] = React.useState(false);

  const handleExport = async () => {
    if (!contentRef.current) return;

    setExporting(true);
    try {
      const canvas = await html2canvas(contentRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: theme.isDark ? '#111827' : '#f9fafb'
      });

      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      const pdf = new jsPDF({
        orientation: imgHeight > imgWidth ? 'portrait' : 'landscape',
        unit: 'mm'
      });

      pdf.addImage(
        canvas.toDataURL('image/jpeg', 1.0),
        'JPEG',
        0,
        0,
        imgWidth,
        imgHeight
      );

      pdf.save(`${fileName}.pdf`);
      toast.success('Export réussi', {
        description: 'Le bulletin a été exporté en PDF avec succès.'
      });
    } catch (error) {
      console.error('Erreur lors de l\'export PDF:', error);
      toast.error('Erreur d\'export', {
        description: 'Une erreur est survenue lors de l\'export du PDF.'
      });
    } finally {
      setExporting(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={exporting}
      className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-${theme.primaryColor}-600 hover:bg-${theme.primaryColor}-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-${theme.primaryColor}-500 disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      <Download className="h-4 w-4 mr-2" />
      {exporting ? 'Export en cours...' : 'Télécharger PDF'}
    </button>
  );
}
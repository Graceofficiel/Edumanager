import React, { useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { User, ArrowLeft, Camera, ChevronLeft, ChevronRight } from 'lucide-react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { useTheme } from '../../context/ThemeContext';
import { useCycles } from '../../context/CycleContext';
import { getStudentPhoto } from '../../utils/photoStorage';
import PhotoUploadModal from '../../components/PhotoUploadModal';
import PDFExport from '../../components/PDFExport';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function Results() {
  const { cycleId, classId, studentId } = useParams();
  const { theme } = useTheme();
  const { getCycle } = useCycles();
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [studentPhoto, setStudentPhoto] = useState<string | null>(() => {
    return getStudentPhoto(studentId || '');
  });
  const [selectedPeriod, setSelectedPeriod] = useState<string>('');
  const contentRef = useRef<HTMLDivElement>(null);

  const cycle = getCycle(cycleId || '');
  const currentClass = cycle?.classes.find(c => c.id === classId);

  // Trier les imports par date
  const sortedImports = currentClass?.importedData?.sort((a, b) => 
    new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime()
  ) || [];

  // Sélectionner la période actuelle ou la plus récente
  React.useEffect(() => {
    if (sortedImports.length > 0) {
      setSelectedPeriod(selectedPeriod || sortedImports[0].period);
    }
  }, [sortedImports.length]);

  // Obtenir l'index de la période actuelle
  const currentPeriodIndex = sortedImports.findIndex(imp => imp.period === selectedPeriod);

  // Navigation entre les périodes
  const navigatePeriod = (direction: 'prev' | 'next') => {
    if (currentPeriodIndex === -1) return;
    
    const newIndex = direction === 'prev' 
      ? Math.min(sortedImports.length - 1, currentPeriodIndex + 1)
      : Math.max(0, currentPeriodIndex - 1);
    
    setSelectedPeriod(sortedImports[newIndex].period);
  };

  const currentImport = sortedImports.find(imp => imp.period === selectedPeriod);
  const studentData = currentImport?.content?.find(row => 
    String(row['Student ID']).trim() === studentId
  );

  if (!cycle || !currentClass || !currentClass.importedData || !studentData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Données non disponibles
            </h2>
            <Link
              to="/login"
              className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-${theme.primaryColor}-600 hover:bg-${theme.primaryColor}-700`}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour à la connexion
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Extraire les champs de notes (type number)
  const gradeFields = currentClass.dataStructure
    .filter(field => field.type === 'number')
    .map(field => field.name);

  // Préparer les données pour le graphique
  const chartData = {
    labels: sortedImports.map(imp => imp.period),
    datasets: gradeFields.map((subject, index) => ({
      label: subject,
      data: sortedImports.map(imp => {
        const periodData = imp.content?.find(row => String(row['Student ID']) === studentId);
        if (!periodData) return null;
        const grades = String(periodData[subject]).split('-').map(Number);
        return grades[2] || ((grades[0] || 0) + (grades[1] || 0)) / 2; // Moyenne
      }),
      borderColor: `hsl(${(index * 360) / gradeFields.length}, 70%, 50%)`,
      backgroundColor: `hsla(${(index * 360) / gradeFields.length}, 70%, 50%, 0.5)`,
      tension: 0.3
    }))
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Évolution des moyennes'
      }
    },
    scales: {
      y: {
        min: 0,
        max: 20
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" ref={contentRef}>
        {/* Header avec photo et informations */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-6">
              <div className="relative">
                {studentPhoto ? (
                  <img
                    src={studentPhoto}
                    alt={`${studentData['First Name']} ${studentData['Last Name']}`}
                    className="h-24 w-24 rounded-full object-cover ring-2 ring-gray-200 dark:ring-gray-700"
                  />
                ) : (
                  <div className="h-24 w-24 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center ring-2 ring-gray-200 dark:ring-gray-700">
                    <User className="h-12 w-12 text-gray-400 dark:text-gray-500" />
                  </div>
                )}
                <button
                  onClick={() => setIsPhotoModalOpen(true)}
                  className="absolute bottom-0 right-0 p-1 bg-white dark:bg-gray-700 rounded-full shadow-lg hover:bg-gray-50 dark:hover:bg-gray-600"
                >
                  <Camera className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                </button>
              </div>
              
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {studentData['First Name']} {studentData['Last Name']}
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Classe: {currentClass.name} • ID: {studentId}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => navigatePeriod('prev')}
                  disabled={currentPeriodIndex === sortedImports.length - 1}
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                </button>
                <select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md dark:bg-gray-700 dark:text-white"
                >
                  {sortedImports.map((imp) => (
                    <option key={imp.period} value={imp.period}>
                      {imp.period}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => navigatePeriod('next')}
                  disabled={currentPeriodIndex === 0}
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                </button>
              </div>

              <PDFExport
                contentRef={contentRef}
                fileName={`bulletin_${studentData['First Name']}_${studentData['Last Name']}_${selectedPeriod}`}
              />
            </div>
          </div>
        </div>

        {/* Tableau des notes */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden mb-6">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
              Résultats - {selectedPeriod}
            </h3>
          </div>
          <div className="px-4 py-5 sm:p-6">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead>
                  <tr>
                    <th className="px-6 py-3 bg-gray-50 dark:bg-gray-700 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Matière
                    </th>
                    <th className="px-6 py-3 bg-gray-50 dark:bg-gray-700 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Devoir de Classe
                    </th>
                    <th className="px-6 py-3 bg-gray-50 dark:bg-gray-700 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Devoir Départemental
                    </th>
                    <th className="px-6 py-3 bg-gray-50 dark:bg-gray-700 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Moyenne
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {gradeFields.map((subject) => {
                    const grades = String(studentData[subject]).split('-').map(Number);
                    const average = grades[2] || ((grades[0] || 0) + (grades[1] || 0)) / 2;
                    
                    return (
                      <tr key={subject}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          {subject}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500 dark:text-gray-400">
                          {grades[0]?.toFixed(1) || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500 dark:text-gray-400">
                          {grades[1]?.toFixed(1) || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-medium text-gray-900 dark:text-white">
                          {average.toFixed(1)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Graphique d'évolution */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <Line data={chartData} options={chartOptions} />
        </div>
      </div>

      {/* Modal de photo */}
      <PhotoUploadModal
        isOpen={isPhotoModalOpen}
        onClose={() => setIsPhotoModalOpen(false)}
        onPhotoUploaded={(photoUrl) => {
          setStudentPhoto(photoUrl);
          setIsPhotoModalOpen(false);
        }}
        studentId={studentId || ''}
      />
    </div>
  );
}
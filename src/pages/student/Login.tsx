import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, GraduationCap } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useCycles } from '../../context/CycleContext';
import { toast } from 'sonner';

export default function Login() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { cycles } = useCycles();
  const [cycleId, setCycleId] = React.useState('');
  const [classId, setClassId] = React.useState('');
  const [studentId, setStudentId] = React.useState('');
  const [error, setError] = React.useState('');

  const selectedCycle = cycles.find(c => c.id === cycleId);
  const selectedClass = selectedCycle?.classes.find(c => c.id === classId);
  const enabledCycles = cycles.filter(c => c.enabled);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!cycleId || !classId || !studentId.trim()) {
      setError('Veuillez remplir tous les champs');
      return;
    }

    if (!selectedClass?.importedData || selectedClass.importedData.length === 0) {
      setError('Aucune donnée disponible pour cette classe');
      return;
    }

    // Récupérer le dernier fichier importé (trié par date)
    const latestImport = [...selectedClass.importedData]
      .sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime())[0];

    if (!latestImport.content) {
      setError('Données de classe non disponibles');
      return;
    }

    // Trouver l'étudiant dans les données importées
    const studentIdField = selectedClass.dataStructure.find(field => field.name === 'Student ID')?.name || 'Student ID';
    const student = latestImport.content.find(row => {
      const rowStudentId = String(row[studentIdField]).trim();
      const searchStudentId = studentId.trim();
      return rowStudentId === searchStudentId;
    });

    if (!student) {
      setError('Identifiant étudiant non trouvé dans cette classe');
      toast.error('Accès refusé', {
        description: 'L\'identifiant fourni n\'existe pas dans cette classe'
      });
      return;
    }

    // Si l'étudiant est trouvé, naviguer vers la page des résultats
    navigate(`/results/${cycleId}/${classId}/${studentId}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className={`bg-${theme.primaryColor}-600 dark:bg-gray-800 text-white py-4 px-6 shadow-lg`}>
        <div className="max-w-7xl mx-auto flex items-center">
          <GraduationCap className="h-8 w-8" />
          <span className="ml-2 text-xl font-bold">Portail Élève</span>
        </div>
      </header>

      {/* Login Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <LogIn className={`mx-auto h-12 w-12 text-${theme.primaryColor}-600 dark:text-${theme.primaryColor}-400`} />
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
              Accès aux Notes
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Entrez vos informations pour consulter vos résultats
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow-xl rounded-lg sm:px-10">
            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* Cycle Selection */}
              <div>
                <label htmlFor="cycle" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Cycle
                </label>
                <select
                  id="cycle"
                  value={cycleId}
                  onChange={(e) => {
                    setCycleId(e.target.value);
                    setClassId('');
                    setError('');
                  }}
                  required
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Sélectionnez votre cycle</option>
                  {enabledCycles.map((cycle) => (
                    <option key={cycle.id} value={cycle.id}>
                      {cycle.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Class Selection */}
              <div>
                <label htmlFor="class" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Classe
                </label>
                <select
                  id="class"
                  value={classId}
                  onChange={(e) => {
                    setClassId(e.target.value);
                    setError('');
                  }}
                  required
                  disabled={!cycleId}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md dark:bg-gray-700 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed"
                >
                  <option value="">Sélectionnez votre classe</option>
                  {selectedCycle?.classes.filter(c => c.enabled).map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Student ID */}
              <div>
                <label htmlFor="studentId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Identifiant Élève
                </label>
                <div className="mt-1">
                  <input
                    id="studentId"
                    type="text"
                    value={studentId}
                    onChange={(e) => {
                      setStudentId(e.target.value);
                      setError('');
                    }}
                    required
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Entrez votre identifiant"
                  />
                </div>
              </div>

              {error && (
                <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded-md">
                  {error}
                </div>
              )}

              <button
                type="submit"
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-${theme.primaryColor}-600 hover:bg-${theme.primaryColor}-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-${theme.primaryColor}-500 transition-colors`}
              >
                Voir mes Notes
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-4 text-center text-sm text-gray-500 dark:text-gray-400">
        <p>Contactez votre administration si vous avez besoin d'aide</p>
      </footer>
    </div>
  );
}
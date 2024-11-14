import React from 'react';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useTheme } from '../../context/ThemeContext';
import { useCycles } from '../../context/CycleContext';
import CycleCard from '../../components/admin/CycleCard';
import type { Cycle } from '../../types';

export default function Dashboard() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { cycles, updateCycles } = useCycles();
  const [isAddingCycle, setIsAddingCycle] = React.useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState<string | null>(null);

  const handleCycleToggle = (cycleId: string, enabled: boolean) => {
    const updatedCycles = cycles.map(cycle => 
      cycle.id === cycleId ? { ...cycle, enabled } : cycle
    );
    updateCycles(updatedCycles);
    toast.success(`Cycle ${enabled ? 'activé' : 'désactivé'}`, {
      description: `Le cycle a été ${enabled ? 'activé' : 'désactivé'} avec succès.`
    });
  };

  const handleCycleNameChange = (cycleId: string, newName: string) => {
    const updatedCycles = cycles.map(cycle =>
      cycle.id === cycleId ? { ...cycle, name: newName } : cycle
    );
    updateCycles(updatedCycles);
    toast.success('Nom du cycle mis à jour', {
      description: 'Le nom du cycle a été modifié avec succès.'
    });
  };

  const handleAddCycle = () => {
    setIsAddingCycle(true);
    const newCycle: Cycle = {
      id: String(Date.now()),
      name: 'Nouveau Cycle',
      enabled: true,
      classes: [],
    };
    updateCycles([...cycles, newCycle]);
    toast.success('Nouveau cycle ajouté', {
      description: 'Le nouveau cycle a été créé avec succès.'
    });
    setIsAddingCycle(false);
  };

  const handleDeleteCycle = (cycleId: string) => {
    setShowDeleteConfirm(cycleId);
  };

  const confirmDelete = (cycleId: string) => {
    const updatedCycles = cycles.filter(cycle => cycle.id !== cycleId);
    updateCycles(updatedCycles);
    toast.success('Cycle supprimé', {
      description: 'Le cycle a été supprimé avec succès.'
    });
    setShowDeleteConfirm(null);
  };

  const handleManageCycle = (cycleId: string) => {
    navigate(`/admin/cycle/${cycleId}`);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Cycles Académiques</h1>
        <button
          onClick={handleAddCycle}
          disabled={isAddingCycle}
          className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-${theme.primaryColor}-600 hover:bg-${theme.primaryColor}-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-${theme.primaryColor}-500 disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          <Plus className="h-4 w-4 mr-2" />
          Ajouter un Cycle
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cycles.map((cycle) => (
          <CycleCard
            key={cycle.id}
            cycle={cycle}
            onToggle={(enabled) => handleCycleToggle(cycle.id, enabled)}
            onClick={() => handleManageCycle(cycle.id)}
            onDelete={() => handleDeleteCycle(cycle.id)}
            onNameChange={(newName) => handleCycleNameChange(cycle.id, newName)}
          />
        ))}
      </div>

      {/* Modal de confirmation de suppression */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black opacity-30"></div>
            
            <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Supprimer le Cycle
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                Êtes-vous sûr de vouloir supprimer ce cycle ? Cette action est irréversible et supprimera toutes les classes et données associées.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                >
                  Annuler
                </button>
                <button
                  onClick={() => confirmDelete(showDeleteConfirm)}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
                >
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
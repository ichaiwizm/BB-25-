import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Download, Upload, FolderOpen, Cpu } from 'lucide-react';
import { MachineEditor } from '../editor/MachineEditor';
import { 
  getCustomMachines, 
  saveCustomMachine, 
  deleteCustomMachine, 
  exportCustomMachines,
  importCustomMachines,
  getCustomMachinesStats,
  type CustomMachine 
} from '../../utils/localStorage';
import type { TuringMachine } from '../../types/turing';
import '../../styles/design-system.css';

interface MachineLibraryProps {
  onSelectMachine: (machine: TuringMachine) => void;
  onClose: () => void;
}

export const MachineLibrary: React.FC<MachineLibraryProps> = ({ 
  onSelectMachine, 
  onClose 
}) => {
  const [customMachines, setCustomMachines] = useState<CustomMachine[]>([]);
  const [showEditor, setShowEditor] = useState(false);
  const [editingMachine, setEditingMachine] = useState<CustomMachine | null>(null);
  const [stats, setStats] = useState(getCustomMachinesStats());

  // Charger les machines personnalisées
  const loadCustomMachines = () => {
    const machines = getCustomMachines();
    setCustomMachines(machines);
    setStats(getCustomMachinesStats());
  };

  useEffect(() => {
    loadCustomMachines();
  }, []);

  // Sauvegarder une machine
  const handleSaveMachine = (machine: TuringMachine) => {
    try {
      saveCustomMachine(machine);
      loadCustomMachines();
      setShowEditor(false);
      setEditingMachine(null);
    } catch (error) {
      alert('Erreur lors de la sauvegarde: ' + (error as Error).message);
    }
  };

  // Supprimer une machine
  const handleDeleteMachine = (machine: CustomMachine) => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer "${machine.name}" ?`)) {
      deleteCustomMachine(machine.id);
      loadCustomMachines();
    }
  };

  // Éditer une machine
  const handleEditMachine = (machine: CustomMachine) => {
    setEditingMachine(machine);
    setShowEditor(true);
  };

  // Importer des machines
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    importCustomMachines(file)
      .then(count => {
        alert(`${count} machine(s) importée(s) avec succès`);
        loadCustomMachines();
      })
      .catch(error => {
        alert('Erreur lors de l\'importation: ' + error.message);
      });

    // Reset l'input
    e.target.value = '';
  };

  // Formater la date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (showEditor) {
    return (
      <MachineEditor
        onSave={handleSaveMachine}
        onClose={() => {
          setShowEditor(false);
          setEditingMachine(null);
        }}
        initialMachine={editingMachine?.machine}
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b pb-3">
        <div>
          <h2 className="text-lg font-semibold text-primary">Mes Machines</h2>
          <p className="text-xs text-secondary">
            {stats.total} machine{stats.total !== 1 ? 's' : ''} personnalisée{stats.total !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowEditor(true)} className="btn btn-primary text-xs" style={{ padding: '6px 12px' }}>
            <Plus className="w-3 h-3" />
            Nouvelle
          </button>
          <button onClick={onClose} className="btn btn-secondary text-xs" style={{ padding: '6px 12px' }}>Fermer</button>
        </div>
      </div>


      {/* Liste des machines */}
      {customMachines.length === 0 ? (
        <div className="text-center py-8 border border-dashed border-gray-300 rounded-lg">
          <Cpu className="w-8 h-8 text-gray-400 mx-auto mb-3" />
          <h3 className="text-sm font-medium text-primary mb-1">Aucune machine personnalisée</h3>
          <p className="text-xs text-secondary mb-3">
            Créez votre première machine
          </p>
          <button onClick={() => setShowEditor(true)} className="btn btn-primary text-xs" style={{ padding: '6px 12px' }}>
            <Plus className="w-3 h-3" />
            Créer
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {customMachines.map(machine => {
            const uniqueStates = new Set(machine.machine.rules.map(r => r.currentState));
            
            return (
              <div key={machine.id} className="border border-border rounded p-3 hover:border-primary/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-primary truncate" title={machine.name}>
                      {machine.name}
                    </h4>
                    <div className="flex gap-4 text-xs text-secondary mt-1">
                      <span>{uniqueStates.size} états</span>
                      <span>{machine.machine.rules.length} règles</span>
                      <span>{formatDate(machine.lastModified)}</span>
                    </div>
                  </div>
                  <div className="flex gap-1 ml-3">
                    <button
                      onClick={() => {
                        onSelectMachine(machine.machine);
                        onClose();
                      }}
                      className="btn btn-primary text-xs"
                      style={{ padding: '4px 8px' }}
                    >
                      Charger
                    </button>
                    <button
                      onClick={() => handleEditMachine(machine)}
                      className="btn btn-ghost text-xs"
                      style={{ padding: '4px' }}
                      title="Éditer"
                    >
                      <Edit className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => handleDeleteMachine(machine)}
                      className="btn btn-ghost text-xs"
                      style={{ padding: '4px' }}
                      title="Supprimer"
                    >
                      <Trash2 className="w-3 h-3 text-red-500" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
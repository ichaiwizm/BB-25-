import type { TuringMachine } from '../types/turing';

const CUSTOM_MACHINES_KEY = 'busy-beaver-custom-machines';

export interface CustomMachine {
  id: string;
  name: string;
  description: string;
  machine: TuringMachine;
  createdAt: string;
  lastModified: string;
}

interface StoredMachineData {
  id?: string;
  name?: string;
  description?: string;
  machine?: {
    name?: string;
    description?: string;
    rules?: unknown[];
    initialState?: string;
    haltStates?: unknown[];
    alphabet?: unknown[];
  };
  createdAt?: string;
  lastModified?: string;
}

// Sauvegarder une machine personnalisée
export const saveCustomMachine = (machine: TuringMachine): CustomMachine => {
  const customMachines = getCustomMachines();
  const now = new Date().toISOString();
  
  // Vérifier si une machine avec ce nom existe déjà
  const existingIndex = customMachines.findIndex(m => m.name === machine.name);
  
  const customMachine: CustomMachine = {
    id: existingIndex >= 0 ? customMachines[existingIndex].id : generateId(),
    name: machine.name,
    description: machine.description || '',
    machine,
    createdAt: existingIndex >= 0 ? customMachines[existingIndex].createdAt : now,
    lastModified: now
  };

  if (existingIndex >= 0) {
    // Mettre à jour la machine existante
    customMachines[existingIndex] = customMachine;
  } else {
    // Ajouter une nouvelle machine
    customMachines.push(customMachine);
  }

  // Convertir les Sets en Arrays pour le stockage
  const machineToStore = customMachines.map(m => ({
    ...m,
    machine: {
      ...m.machine,
      haltStates: Array.from(m.machine.haltStates),
      alphabet: Array.from(m.machine.alphabet)
    }
  }));
  
  localStorage.setItem(CUSTOM_MACHINES_KEY, JSON.stringify(machineToStore));
  return customMachine;
};

// Récupérer toutes les machines personnalisées
export const getCustomMachines = (): CustomMachine[] => {
  try {
    const stored = localStorage.getItem(CUSTOM_MACHINES_KEY);
    if (!stored) return [];
    
    const machines = JSON.parse(stored);
    if (!Array.isArray(machines)) return [];
    
    // Validation et conversion des données
    return machines.map((m: unknown) => {
      // Validation de base
      const machineData = m as StoredMachineData;
      if (!machineData || !machineData.machine || !machineData.id || !machineData.name) {
        throw new Error('Format de machine invalide');
      }
      
      return {
        id: machineData.id,
        name: machineData.name,
        description: machineData.description || '',
        createdAt: machineData.createdAt || new Date().toISOString(),
        lastModified: machineData.lastModified || new Date().toISOString(),
        machine: {
          name: machineData.machine.name || machineData.name,
          description: machineData.machine.description || machineData.description || '',
          initialState: machineData.machine.initialState || 'A',
          haltStates: new Set(Array.isArray(machineData.machine.haltStates) ? machineData.machine.haltStates : ['halt']),
          alphabet: new Set(Array.isArray(machineData.machine.alphabet) ? machineData.machine.alphabet : [0, 1]),
          rules: Array.isArray(machineData.machine.rules) ? machineData.machine.rules : []
        }
      } as CustomMachine;
    });
  } catch (error) {
    console.error('Erreur lors du chargement des machines personnalisées:', error);
    // En cas d'erreur, nettoyer le localStorage corrompu
    localStorage.removeItem(CUSTOM_MACHINES_KEY);
    return [];
  }
};

// Supprimer une machine personnalisée
export const deleteCustomMachine = (id: string): void => {
  const customMachines = getCustomMachines();
  const filtered = customMachines.filter(m => m.id !== id);
  localStorage.setItem(CUSTOM_MACHINES_KEY, JSON.stringify(filtered));
};

// Exporter toutes les machines personnalisées
export const exportCustomMachines = (): void => {
  const machines = getCustomMachines();
  const data = {
    exportDate: new Date().toISOString(),
    version: '1.0',
    machines: machines.map(m => ({
      ...m,
      machine: {
        ...m.machine,
        haltStates: Array.from(m.machine.haltStates),
        alphabet: Array.from(m.machine.alphabet)
      }
    }))
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `busy-beaver-machines-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
};

// Importer des machines personnalisées
export const importCustomMachines = (file: File): Promise<number> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        
        if (!data.machines || !Array.isArray(data.machines)) {
          throw new Error('Format de fichier invalide');
        }

        let importedCount = 0;
        const existingMachines = getCustomMachines();

        for (const machineData of data.machines) {
          try {
            // Valider et convertir la machine
            const machine: TuringMachine = {
              name: machineData.machine.name || machineData.name,
              description: machineData.machine.description || machineData.description || '',
              rules: machineData.machine.rules || [],
              initialState: machineData.machine.initialState || 'A',
              haltStates: new Set(machineData.machine.haltStates || ['halt']),
              alphabet: new Set(machineData.machine.alphabet || [0, 1])
            };

            // Vérifier si le nom existe déjà
            let finalName = machine.name;
            let counter = 1;
            while (existingMachines.some(m => m.name === finalName)) {
              finalName = `${machine.name} (${counter})`;
              counter++;
            }
            
            const updatedMachine = { ...machine, name: finalName };

            saveCustomMachine(updatedMachine);
            importedCount++;
          } catch (error) {
            console.warn('Erreur lors de l\'importation d\'une machine:', error);
          }
        }

        resolve(importedCount);
      } catch (error) {
        reject(new Error('Erreur lors de l\'analyse du fichier: ' + (error as Error).message));
      }
    };

    reader.onerror = () => reject(new Error('Erreur lors de la lecture du fichier'));
    reader.readAsText(file);
  });
};

// Générer un ID unique
const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Nettoyer le localStorage (utile pour le debug)
export const clearCustomMachines = (): void => {
  localStorage.removeItem(CUSTOM_MACHINES_KEY);
};

// Obtenir les statistiques des machines personnalisées
export const getCustomMachinesStats = () => {
  const machines = getCustomMachines();
  
  return {
    total: machines.length,
    totalRules: machines.reduce((sum, m) => sum + m.machine.rules.length, 0),
    averageRules: machines.length > 0 ? 
      Math.round(machines.reduce((sum, m) => sum + m.machine.rules.length, 0) / machines.length) : 0,
    oldestMachine: machines.length > 0 ? 
      machines.reduce((oldest, m) => m.createdAt < oldest.createdAt ? m : oldest) : null,
    newestMachine: machines.length > 0 ? 
      machines.reduce((newest, m) => m.createdAt > newest.createdAt ? m : newest) : null
  };
};
import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Save, Shuffle, Download, Upload } from 'lucide-react';
import type { Rule, TuringMachine } from '../../types/turing';
import '../../styles/design-system.css';

interface MachineEditorProps {
  onSave: (machine: TuringMachine) => void;
  onClose: () => void;
  initialMachine?: TuringMachine;
}

export const MachineEditor: React.FC<MachineEditorProps> = ({ 
  onSave, 
  onClose, 
  initialMachine 
}) => {
  const [machineName, setMachineName] = useState(initialMachine?.name || '');
  const [machineDescription, setMachineDescription] = useState(initialMachine?.description || '');
  const [rules, setRules] = useState<Rule[]>(initialMachine?.rules || []);
  const [states, setStates] = useState<string[]>(['A', 'B']);
  const [symbols] = useState<(0 | 1)[]>([0, 1]);
  const [haltStates, setHaltStates] = useState<Set<string>>(new Set(['halt']));

  // Ajouter une règle vide
  const addRule = () => {
    const newRule: Rule = {
      currentState: states[0],
      readSymbol: 0,
      writeSymbol: 1,
      direction: 'R',
      nextState: states[1]
    };
    setRules([...rules, newRule]);
  };

  // Supprimer une règle
  const removeRule = (index: number) => {
    setRules(rules.filter((_, i) => i !== index));
  };

  // Mettre à jour une règle
  const updateRule = (index: number, field: keyof Rule, value: any) => {
    const newRules = [...rules];
    newRules[index] = { ...newRules[index], [field]: value };
    setRules(newRules);
  };

  // Ajouter un nouvel état
  const addState = () => {
    const nextLetter = String.fromCharCode(65 + states.length); // A, B, C, D...
    if (nextLetter <= 'Z') {
      const newStates = [...states, nextLetter];
      setStates(newStates);
    }
  };

  // Générer une machine aléatoire avec logique
  const generateRandomMachine = () => {
    // Utiliser les états actuels au lieu d'en créer de nouveaux
    const currentStates = states.length >= 2 ? states : ['A', 'B'];
    if (states.length < 2) {
      setStates(currentStates);
    }

    const newRules: Rule[] = [];
    
    // Règles logiques pour éviter les machines triviales
    for (const state of currentStates) {
      for (const symbol of symbols) {
        // Éviter que tous les états mènent immédiatement à halt
        const shouldHalt = Math.random() < 0.1; // 10% chance de halt
        
        let nextState: string;
        if (shouldHalt) {
          nextState = 'halt';
        } else {
          // Favoriser les transitions vers d'autres états pour créer des cycles intéressants
          const otherStates = currentStates.filter(s => s !== state);
          nextState = Math.random() < 0.7 && otherStates.length > 0 
            ? otherStates[Math.floor(Math.random() * otherStates.length)]
            : state;
        }

        // Logique pour les symboles et directions
        const writeSymbol = Math.random() < 0.6 ? 1 : 0; // Favoriser l'écriture de 1
        const direction = Math.random() < 0.8 ? (Math.random() < 0.5 ? 'R' : 'L') : 'N';

        newRules.push({
          currentState: state,
          readSymbol: symbol,
          writeSymbol: writeSymbol as 0 | 1,
          direction: direction as 'L' | 'R' | 'N',
          nextState
        });
      }
    }

    setRules(newRules);
    setMachineName(`Machine Aléatoire ${currentStates.length} états`);
    setMachineDescription(`Machine générée aléatoirement avec ${currentStates.length} états et ${newRules.length} règles`);
  };

  // Sauvegarder la machine
  const handleSave = () => {
    if (!machineName.trim()) {
      alert('Veuillez donner un nom à votre machine');
      return;
    }

    if (rules.length === 0) {
      alert('Veuillez ajouter au moins une règle');
      return;
    }

    const machine: TuringMachine = {
      name: machineName,
      description: machineDescription,
      rules,
      initialState: states[0],
      haltStates,
      alphabet: new Set([0, 1])
    };

    onSave(machine);
  };

  // Export JSON
  const exportMachine = () => {
    const machine = {
      name: machineName,
      description: machineDescription,
      rules,
      initialState: states[0],
      haltStates: Array.from(haltStates),
      alphabet: [0, 1]
    };
    
    const blob = new Blob([JSON.stringify(machine, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${machineName || 'machine'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h2 className="text-lg font-semibold text-primary">Éditeur de Machine</h2>
          <p className="text-xs text-secondary">Créez votre propre machine de Turing</p>
        </div>
        <div className="flex gap-2">
          <button onClick={onClose} className="btn btn-secondary" style={{ padding: '6px 12px' }}>Annuler</button>
          <button onClick={handleSave} className="btn btn-primary" style={{ padding: '6px 12px' }}>
            <Save className="w-3 h-3" />
            Sauvegarder
          </button>
        </div>
      </div>

      {/* Configuration simple */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="form-label text-xs">Nom de la machine</label>
          <input
            type="text"
            value={machineName}
            onChange={(e) => setMachineName(e.target.value)}
            className="form-control text-sm"
            placeholder="Ma Machine Personnalisée"
          />
        </div>
        <div>
          <label className="form-label text-xs">Description</label>
          <input
            type="text"
            value={machineDescription}
            onChange={(e) => setMachineDescription(e.target.value)}
            className="form-control text-sm"
            placeholder="Description..."
          />
        </div>
      </div>

      {/* États et génération */}
      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
        <div className="flex items-center gap-3">
          <span className="text-xs text-secondary">États:</span>
          <div className="flex gap-1">
            {states.map(state => (
              <span key={state} className="px-2 py-1 bg-primary text-white rounded text-xs font-mono">
                {state}
              </span>
            ))}
            <span className="px-2 py-1 bg-red-500 text-white rounded text-xs font-mono">halt</span>
          </div>
          <button onClick={addState} className="btn btn-ghost text-xs" style={{ padding: '2px 6px' }}>
            <Plus className="w-3 h-3" />
          </button>
        </div>
        <button onClick={generateRandomMachine} className="btn btn-secondary text-xs" style={{ padding: '4px 8px' }}>
          <Shuffle className="w-3 h-3" />
          Générer
        </button>
      </div>

      {/* Éditeur de règles */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-primary">Règles de Transition ({rules.length})</h3>
          <button onClick={addRule} className="btn btn-primary text-xs" style={{ padding: '4px 8px' }}>
            <Plus className="w-3 h-3" />
            Ajouter
          </button>
        </div>

        {/* Header de table */}
        <div className="grid grid-cols-6 gap-2 mb-2 text-xs font-medium text-secondary p-2 bg-gray-100 rounded">
          <div>État</div>
          <div>Lit</div>
          <div>Écrit</div>
          <div>Direction</div>
          <div>Nouvel état</div>
          <div></div>
        </div>

        {/* Règles */}
        <div className="space-y-1 max-h-64 overflow-y-auto border rounded p-2">
          {rules.map((rule, index) => (
            <div key={index} className="grid grid-cols-6 gap-2 p-2 bg-white rounded border hover:bg-gray-50">
              <select
                value={rule.currentState}
                onChange={(e) => updateRule(index, 'currentState', e.target.value)}
                className="form-control text-xs"
              >
                {states.map(state => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>

              <select
                value={rule.readSymbol}
                onChange={(e) => updateRule(index, 'readSymbol', parseInt(e.target.value))}
                className="form-control text-xs"
              >
                <option value={0}>0</option>
                <option value={1}>1</option>
              </select>

              <select
                value={rule.writeSymbol}
                onChange={(e) => updateRule(index, 'writeSymbol', parseInt(e.target.value))}
                className="form-control text-xs"
              >
                <option value={0}>0</option>
                <option value={1}>1</option>
              </select>

              <select
                value={rule.direction}
                onChange={(e) => updateRule(index, 'direction', e.target.value)}
                className="form-control text-xs"
              >
                <option value="L">←</option>
                <option value="R">→</option>
                <option value="N">•</option>
              </select>

              <select
                value={rule.nextState}
                onChange={(e) => updateRule(index, 'nextState', e.target.value)}
                className="form-control text-xs"
              >
                {states.map(state => (
                  <option key={state} value={state}>{state}</option>
                ))}
                <option value="halt">halt</option>
              </select>

              <button
                onClick={() => removeRule(index)}
                className="btn btn-ghost text-xs"
                style={{ padding: '2px' }}
                title="Supprimer"
              >
                <Trash2 className="w-3 h-3 text-red-500" />
              </button>
            </div>
          ))}

          {rules.length === 0 && (
            <div className="text-center text-secondary py-6">
              <p className="text-xs">Aucune règle définie</p>
              <p className="text-xs text-gray-400">Cliquez sur "Ajouter" ou "Générer"</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
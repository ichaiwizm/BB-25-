import React, { useState } from 'react';
import { Plus, Trash2, Save, Shuffle } from 'lucide-react';
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
  
  // Extraire les états des règles existantes si c'est une machine existante
  const extractStatesFromRules = (rules: Rule[]): string[] => {
    if (!rules || rules.length === 0) return ['A', 'B'];
    
    const stateSet = new Set<string>();
    rules.forEach(rule => {
      stateSet.add(rule.currentState.toString());
      if (rule.nextState !== 'halt') {
        stateSet.add(rule.nextState.toString());
      }
    });
    
    // Convertir en array et trier par ordre alphabétique
    const statesArray = Array.from(stateSet).sort();
    return statesArray.length > 0 ? statesArray : ['A', 'B'];
  };
  
  const [states, setStates] = useState<string[]>(
    initialMachine ? extractStatesFromRules(initialMachine.rules) : ['A', 'B']
  );
  const [symbols] = useState<(0 | 1)[]>([0, 1]);
  const [haltStates] = useState<Set<string>>(new Set(['halt']));

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
  const updateRule = (index: number, field: keyof Rule, value: string | number) => {
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

    let newRules: Rule[] = [];
    
    // Générateur intelligent par stratégies Busy Beaver
    
    // 1. Définir les rôles des états selon leur position
    const stateRoles = currentStates.map((_, i) => {
      const position = i / (currentStates.length - 1); // 0 à 1
      if (position < 0.4) return 'expander';      // États initiaux : expansion
      else if (position < 0.8) return 'processor'; // États milieu : traitement  
      else return 'terminator';                    // États finaux : terminaison
    });

    // 2. Définir une séquence d'états pour éviter les boucles directes
    const createTransitionPlan = (fromStateIndex: number, role: string) => {
      const maxStates = currentStates.length;
      
      if (role === 'expander') {
        // Expanders : avancent vers les processors ou sautent
        return {
          primary: Math.min(fromStateIndex + 1, maxStates - 1),
          secondary: Math.min(fromStateIndex + 2, maxStates - 1),
          haltProbability: 0.1
        };
      } else if (role === 'processor') {
        // Processors : peuvent revenir en arrière pour consolider ou avancer
        return {
          primary: Math.min(fromStateIndex + 1, maxStates - 1),
          secondary: Math.max(0, fromStateIndex - 1), // Retour possible
          haltProbability: 0.2
        };
      } else { // terminator
        // Terminators : halt fréquemment ou reviennent au début pour un dernier cycle
        return {
          primary: 0, // Retour au début
          secondary: 0,
          haltProbability: 0.7
        };
      }
    };

    // 3. Générer les règles avec stratégie par rôle
    for (let i = 0; i < currentStates.length; i++) {
      const state = currentStates[i];
      const role = stateRoles[i];
      const plan = createTransitionPlan(i, role);
      
      for (const symbol of symbols) {
        let nextState: string;
        let writeSymbol: 0 | 1;
        let direction: 'L' | 'R' | 'N';

        // Décision de halt basée sur le rôle
        if (Math.random() < plan.haltProbability) {
          nextState = 'halt';
          writeSymbol = 1; // Toujours écrire 1 avant halt pour maximiser
          direction = Math.random() < 0.6 ? 'R' : 'L';
        } else {
          // Stratégies spécifiques par rôle et symbole
          if (role === 'expander') {
            if (symbol === 0) {
              // Expander sur 0 : écrire 1 et continuer expansion
              writeSymbol = 1;
              direction = Math.random() < 0.8 ? 'R' : 'L'; // Favoriser expansion droite
              nextState = Math.random() < 0.7 ? 
                currentStates[plan.primary] : currentStates[plan.secondary];
            } else {
              // Expander sur 1 : passer au traitement
              writeSymbol = Math.random() < 0.3 ? 0 : 1; // Parfois effacer pour créer patterns
              direction = Math.random() < 0.5 ? 'R' : 'L';
              nextState = currentStates[plan.primary]; // Avancer vers processor
            }
          } else if (role === 'processor') {
            if (symbol === 0) {
              // Processor sur 0 : analyser et écrire stratégiquement  
              writeSymbol = Math.random() < 0.6 ? 1 : 0;
              direction = Math.random() < 0.4 ? 'L' : 'R'; // Plus de retours
              nextState = Math.random() < 0.6 ? 
                currentStates[plan.primary] : currentStates[plan.secondary];
            } else {
              // Processor sur 1 : consolidation, peut revenir en arrière
              writeSymbol = Math.random() < 0.7 ? 1 : 0; // Garder les 1 généralement
              direction = Math.random() < 0.6 ? 'L' : 'R'; // Favoriser retours
              nextState = Math.random() < 0.4 ? 
                currentStates[plan.secondary] : currentStates[plan.primary]; // Plus de retours
            }
          } else { // terminator
            if (symbol === 0) {
              // Terminator sur 0 : dernière chance d'écrire
              writeSymbol = 1;
              direction = 'R';
              nextState = currentStates[plan.primary]; // Retour au début pour cycle final
            } else {
              // Terminator sur 1 : décision finale
              writeSymbol = 1; // Conserver le score
              direction = Math.random() < 0.7 ? 'R' : 'L';
              nextState = Math.random() < 0.5 ? 'halt' : currentStates[0]; // Halt ou cycle final
            }
          }
        }

        newRules.push({
          currentState: state,
          readSymbol: symbol,
          writeSymbol,
          direction,
          nextState
        });
      }
    }

    // 4. Analyse des chemins pour éviter les machines triviales
    const analyzePathsFromStart = (rules: Rule[]) => {
      const startState = currentStates[0];
      
      // Simuler les chemins possibles depuis l'état initial avec symbole 0
      const findPaths = (state: string, symbol: 0 | 1, depth: number, visited: Set<string>): Array<{length: number, endsWithHalt: boolean, isLoop?: boolean, noRule?: boolean}> => {
        if (depth > 10) return []; // Limite de profondeur
        if (state === 'halt') return [{ length: depth, endsWithHalt: true }];
        
        const stateSymbolKey = `${state}-${symbol}`;
        if (visited.has(stateSymbolKey)) return [{ length: depth, endsWithHalt: false, isLoop: true }];
        
        const newVisited = new Set(visited);
        newVisited.add(stateSymbolKey);
        
        const rule = rules.find(r => r.currentState === state && r.readSymbol === symbol);
        if (!rule) return [{ length: depth, endsWithHalt: false, noRule: true }];
        
        // Pour simplifier, on assume que le nouveau symbole sera ce qu'on écrit
        const nextSymbol = rule.writeSymbol as 0 | 1;
        return findPaths(rule.nextState.toString(), nextSymbol, depth + 1, newVisited);
      };
      
      // Analyser les chemins depuis (A, 0) et (A, 1)
      const pathsFrom0 = findPaths(startState, 0, 0, new Set());
      const pathsFrom1 = findPaths(startState, 1, 0, new Set());
      
      return { pathsFrom0, pathsFrom1 };
    };
    
    // 5. Validation et regeneration si nécessaire
    let attempts = 0;
    let validRules = newRules;
    
    while (attempts < 3) {
      const pathAnalysis = analyzePathsFromStart(validRules);
      
      // Vérifier si les chemins sont trop triviaux
      const hasTrivialPath = 
        pathAnalysis.pathsFrom0.some(p => p.endsWithHalt && p.length < 3) ||
        pathAnalysis.pathsFrom1.some(p => p.endsWithHalt && p.length < 3);
      
      const hasOnlyLoops = 
        pathAnalysis.pathsFrom0.every(p => p.isLoop === true) &&
        pathAnalysis.pathsFrom1.every(p => p.isLoop === true);
      
      if (!hasTrivialPath && !hasOnlyLoops) {
        break; // Machine valide trouvée
      }
      
      // Regenerer avec des paramètres ajustés
      validRules = [];
      for (let i = 0; i < currentStates.length; i++) {
        const state = currentStates[i];
        const role = stateRoles[i];
        
        // Réduire la probabilité de halt pour les premiers états
        const adjustedHaltProb = i < 2 ? 0.05 : (role === 'terminator' ? 0.6 : 0.15);
        
        for (const symbol of symbols) {
          let nextState: string;
          let writeSymbol: 0 | 1;
          let direction: 'L' | 'R' | 'N';
          
          if (Math.random() < adjustedHaltProb) {
            nextState = 'halt';
            writeSymbol = 1;
            direction = Math.random() < 0.6 ? 'R' : 'L';
          } else {
            // Forcer plus de complexité pour les premiers états
            if (i < 2) {
              writeSymbol = symbol === 0 ? 1 : (Math.random() < 0.7 ? 1 : 0);
              direction = Math.random() < 0.7 ? 'R' : 'L';
              // Assurer progression vers états suivants
              const minNextIndex = Math.min(i + 1, currentStates.length - 1);
              const maxNextIndex = Math.min(i + 2, currentStates.length - 1);
              const nextIndex = minNextIndex + Math.floor(Math.random() * (maxNextIndex - minNextIndex + 1));
              nextState = currentStates[nextIndex];
            } else {
              // Utiliser la logique normale pour les autres états
              if (role === 'processor') {
                writeSymbol = Math.random() < 0.6 ? 1 : 0;
                direction = Math.random() < 0.5 ? 'L' : 'R';
                nextState = Math.random() < 0.5 ? 
                  currentStates[Math.min(i + 1, currentStates.length - 1)] :
                  currentStates[Math.max(0, i - 1)];
              } else {
                writeSymbol = 1;
                direction = Math.random() < 0.6 ? 'R' : 'L';
                nextState = Math.random() < 0.4 ? 'halt' : currentStates[0];
              }
            }
          }
          
          validRules.push({
            currentState: state,
            readSymbol: symbol,
            writeSymbol,
            direction,
            nextState
          });
        }
      }
      
      attempts++;
    }
    
    // S'assurer qu'il y a au moins une règle halt
    const hasHaltRule = validRules.some(rule => rule.nextState === 'halt');
    if (!hasHaltRule) {
      const lastStateRules = validRules.filter(rule => rule.currentState === currentStates[currentStates.length - 1]);
      if (lastStateRules.length > 0) {
        lastStateRules[lastStateRules.length - 1].nextState = 'halt';
        lastStateRules[lastStateRules.length - 1].writeSymbol = 1;
      }
    }
    
    newRules = validRules;

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
      <div className="border rounded-md p-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-secondary">États:</span>
            {states.length < 25 && (
              <button 
                onClick={addState} 
                className="btn btn-ghost text-xs"
                style={{ padding: '2px 6px' }}
                title="Ajouter un état"
              >
                <Plus className="w-3 h-3" />
              </button>
            )}
          </div>
          <button onClick={generateRandomMachine} className="btn btn-secondary text-xs" style={{ padding: '4px 8px' }}>
            <Shuffle className="w-3 h-3" />
            Générer
          </button>
        </div>
        
        <div className="flex flex-wrap gap-1">
          {states.map(state => (
            <span key={state} className="px-2 py-1 bg-primary text-white rounded text-xs font-mono">
              {state}
            </span>
          ))}
          <span className="px-2 py-1 bg-red-500 text-white rounded text-xs font-mono">halt</span>
        </div>
        
        {states.length >= 25 && (
          <p className="text-xs text-gray-500 mt-2">Maximum 25 états atteint</p>
        )}
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
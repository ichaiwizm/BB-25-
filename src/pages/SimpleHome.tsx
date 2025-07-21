import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, StepForward, Info, X } from 'lucide-react';
import { useBusyBeaver } from '../hooks/useBusyBeaver';
import { perfectMachinesMap } from '../machines/presets';
import type { Rule } from '../types/turing';

export const SimpleHome: React.FC = () => {
  const { state, step, run, stop, reset, loadPreset, isRunning, setSpeed } = useBusyBeaver();
  const [machineType, setMachineType] = useState<'perfect' | 'custom'>('perfect');
  const [selectedPerfectMachine, setSelectedPerfectMachine] = useState<string>('Σ(2) - 6 pas, 4×"1"');
  const [customMachines, setCustomMachines] = useState<Record<string, any>>({});
  const [selectedCustomMachine, setSelectedCustomMachine] = useState<string>('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [lastExecutedRule, setLastExecutedRule] = useState<Rule | null>(null);
  const [executionLog, setExecutionLog] = useState<string[]>([]);

  // Charger la machine par défaut
  useEffect(() => {
    const currentMachine = machineType === 'perfect' 
      ? perfectMachinesMap[selectedPerfectMachine]
      : customMachines[selectedCustomMachine];
      
    if (currentMachine) {
      const rules = currentMachine.predefinedRules || [];
      
      // L'état initial est souvent le premier état dans les règles
      let initialState = rules.length > 0 ? rules[0].currentState : 0;
      
      // Pour les machines de test simple, utiliser 0
      if (currentMachine.name.includes('Test Simple')) {
        initialState = 0;
      }
      // Pour les Busy Beaver, utiliser 'A' généralement  
      else if (currentMachine.name.includes('Busy Beaver') || currentMachine.name.includes('Σ(')) {
        initialState = 'A';
      }
      
      loadPreset({
        name: currentMachine.name,
        description: currentMachine.description,
        rules: rules,
        initialState: initialState,
        haltStates: new Set(['halt']),
        alphabet: new Set([0, 1])
      });
    }
  }, [machineType, selectedPerfectMachine, selectedCustomMachine, customMachines, loadPreset]);

  // Logger automatiquement pendant l'exécution
  useEffect(() => {
    if (!state.currentState || !state.machine || state.currentState.stepCount === 0) {
      return;
    }

    // Logger de façon intelligente selon la vitesse
    const shouldLog = (
      state.executionState.speed <= 10 || // Toujours logger aux vitesses basses
      state.currentState.stepCount % Math.max(1000, Math.floor(state.executionState.speed * 10)) === 0 // Échantillonner aux hautes vitesses
    );

    if (shouldLog) {
      const logEntry = `Étape ${state.currentState.stepCount.toLocaleString()}: État ${formatState(state.currentState.currentState)} | Position ${state.currentState.tape.headPosition} | Score ${getCurrentScore()}`;
      setExecutionLog(prev => {
        // Ne pas dupliquer les entrées récentes
        if (prev.length === 0 || !prev[0].includes(`Étape ${state.currentState?.stepCount.toLocaleString()}`)) {
          return [logEntry, ...prev.slice(0, 9)];
        }
        return prev;
      });
    }
  }, [state.currentState?.stepCount, state.executionState.speed, isRunning]);


  const handleMachineChange = () => {
    setExecutionLog([]);
    setLastExecutedRule(null);
  };

  const handleCreateCustomMachine = (newMachine: any) => {
    const machineName = `Machine ${Object.keys(customMachines).length + 1}`;
    setCustomMachines(prev => ({
      ...prev,
      [machineName]: newMachine
    }));
    setMachineType('custom');
    setSelectedCustomMachine(machineName);
    setShowCreateModal(false);
    handleMachineChange();
  };

  // Logger une étape
  const logStep = (rule: Rule, stepNumber: number) => {
    const logEntry = `Étape ${stepNumber}: État ${formatState(rule.currentState)}, lit ${rule.readSymbol} → écrit ${rule.writeSymbol}, va ${formatDirection(rule.direction)}, devient ${formatState(rule.nextState)}`;
    setExecutionLog(prev => [logEntry, ...prev.slice(0, 9)]); // Garde les 10 dernières
    setLastExecutedRule(rule);
  };

  // Fonction pour exécuter une étape avec logging
  const handleStep = () => {
    if (!state.currentState || !state.machine || state.currentState.isHalted) {
      return;
    }

    const currentSymbol = state.currentState.tape.positions.get(state.currentState.tape.headPosition) ?? 0;
    
    const rule = state.machine.rules.find(r => 
      r.currentState === state.currentState?.currentState && r.readSymbol === currentSymbol
    );

    if (rule) {
      logStep(rule, (state.currentState.stepCount || 0) + 1);
    }

    step();
  };

  // Reset avec nettoyage des logs
  const handleReset = () => {
    reset();
    setExecutionLog([]);
    setLastExecutedRule(null);
  };

  const formatState = (state: any): string => {
    if (state === 'halt') return 'ARRÊT';
    return state;
  };

  const formatDirection = (direction: string): string => {
    switch (direction) {
      case 'L': return '←';
      case 'R': return '→';
      case 'N': return '•';
      default: return direction;
    }
  };

  const getCurrentScore = (): number => {
    if (!state.currentState?.tape) return 0;
    return Array.from(state.currentState.tape.positions.values()).filter(s => s === 1).length;
  };

  const renderTape = () => {
    if (!state.currentState) return null;

    const headPos = state.currentState.tape.headPosition;
    const positions = [];
    
    // Afficher 15 positions autour de la tête pour plus de clarté
    for (let i = headPos - 7; i <= headPos + 7; i++) {
      positions.push(i);
    }

    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4 text-center">Bande de la machine</h3>
        
        {/* Indicateur de tête */}
        <div className="text-center mb-2">
          <div className="inline-flex items-center space-x-2 text-sm text-red-600 font-medium">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            <span>Tête de lecture/écriture à la position {headPos}</span>
          </div>
        </div>

        <div className="flex items-center justify-center space-x-2 py-4">
          {positions.map((pos) => {
            const symbol = state.currentState!.tape.positions.get(pos) ?? 0;
            const isHead = pos === headPos;
            
            return (
              <div
                key={pos}
                className={`
                  relative flex flex-col items-center justify-center font-bold rounded-lg transition-all duration-300
                  ${symbol === 1 ? 'w-20 h-20' : 'w-16 h-16'} 
                  ${isHead 
                    ? 'border-red-500 bg-red-100 shadow-lg transform scale-110 border-3' 
                    : symbol === 1 
                      ? 'border-green-400 bg-green-100 border-3'
                      : 'border-gray-300 bg-white border-2'
                  }
                  ${symbol === 1 && isHead ? 'bg-gradient-to-br from-red-100 to-green-100' : ''}
                `}
              >
                {/* Flèche indicatrice pour la tête */}
                {isHead && (
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
                    <div className="text-red-500 text-xl animate-bounce">↓</div>
                  </div>
                )}
                
                <div className={`${symbol === 1 ? 'text-2xl text-green-700' : 'text-xl text-gray-600'}`}>
                  {symbol}
                </div>
                <div className={`text-xs text-gray-500 mt-1 ${symbol === 1 ? 'font-medium' : ''}`}>{pos}</div>
              </div>
            );
          })}
        </div>
        
        {/* Statistiques */}
        <div className="flex justify-center space-x-8 mt-4 pt-4 border-t">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 break-words">{headPos.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Position tête</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 break-words">{getCurrentScore().toLocaleString()}</div>
            <div className="text-sm text-gray-600">Symboles "1"</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600 break-words">{state.currentState.stepCount.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Étapes</div>
          </div>
        </div>
      </div>
    );
  };

  const renderRules = () => {
    if (!state.machine?.rules) return null;

    // Trouve la règle qui va s'exécuter
    const nextRule = state.currentState && !state.currentState.isHalted 
      ? state.machine.rules.find(r => 
          r.currentState === state.currentState?.currentState && 
          r.readSymbol === (state.currentState.tape.positions.get(state.currentState.tape.headPosition) ?? 0)
        )
      : null;

    const explainRule = (rule: Rule): string => {
      return `Si la machine est en état ${formatState(rule.currentState)} et lit le symbole ${rule.readSymbol}, alors elle écrit ${rule.writeSymbol}, se déplace ${formatDirection(rule.direction) === '←' ? 'vers la gauche' : formatDirection(rule.direction) === '→' ? 'vers la droite' : 'reste sur place'} et passe à l'état ${formatState(rule.nextState)}`;
    };

    return (
      <div className="bg-white border rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-3">Règles de la machine</h3>
        <div className="space-y-2">
          {state.machine.rules.map((rule: Rule, index: number) => {
            const isNext = nextRule && 
              rule.currentState === nextRule.currentState && 
              rule.readSymbol === nextRule.readSymbol;
            const isLast = lastExecutedRule &&
              rule.currentState === lastExecutedRule.currentState &&
              rule.readSymbol === lastExecutedRule.readSymbol;
            
            return (
              <div 
                key={index}
                className={`
                  group relative p-3 border rounded text-sm cursor-help
                  ${isNext ? 'bg-yellow-100 border-yellow-300' : 
                    isLast ? 'bg-green-100 border-green-300' : 
                    'bg-gray-50 border-gray-200 hover:bg-blue-50'}
                `}
                title={explainRule(rule)}
              >
                <div className="grid grid-cols-5 gap-2 items-center">
                  <div className="text-center font-mono">
                    {formatState(rule.currentState)}
                  </div>
                  <div className="text-center font-mono">
                    {rule.readSymbol}
                  </div>
                  <div className="text-center">→</div>
                  <div className="text-center font-mono">
                    {rule.writeSymbol}
                  </div>
                  <div className="text-center font-mono">
                    {formatDirection(rule.direction)} {formatState(rule.nextState)}
                  </div>
                </div>
                
                {/* Tooltip explicatif */}
                <div className="absolute left-0 bottom-full mb-2 w-64 p-2 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                  {explainRule(rule)}
                </div>
                
                {isNext && (
                  <div className="mt-1 text-xs text-yellow-700 font-medium flex items-center">
                    <Info size={12} className="mr-1" />
                    ▶ Prochaine règle à exécuter
                  </div>
                )}
                {isLast && (
                  <div className="mt-1 text-xs text-green-700 font-medium flex items-center">
                    ✓ Dernière règle exécutée
                  </div>
                )}
              </div>
            );
          })}
        </div>
        
        <div className="mt-3 text-xs text-gray-600">
          <div className="grid grid-cols-5 gap-2 font-semibold border-b pb-1">
            <div className="text-center">État</div>
            <div className="text-center">Lit</div>
            <div className="text-center"></div>
            <div className="text-center">Écrit</div>
            <div className="text-center">Mouv→État</div>
          </div>
          <div className="mt-2 text-xs text-gray-500">
            💡 Survolez une règle pour voir l'explication détaillée
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* En-tête */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-800">
              Simulateur Busy Beaver
            </h1>
            
            {/* Contrôle de vitesse en haut */}
            <div className="flex items-center space-x-4 bg-blue-50 px-4 py-2 rounded-lg">
              <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
                Vitesse: {state.executionState.speed.toLocaleString()}x
              </label>
              <input
                type="range"
                min="0.1"
                max="100000"
                step="0.1"
                value={state.executionState.speed}
                onChange={(e) => setSpeed(parseFloat(e.target.value))}
                className="w-48 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="text-xs text-gray-500">
                100K MAX
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div></div>
            
            {/* Sélecteurs de machine */}
            <div className="flex items-center space-x-4">
              {/* Type de machine */}
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700">Type:</label>
                <select
                  value={machineType}
                  onChange={(e) => {
                    setMachineType(e.target.value as 'perfect' | 'custom');
                    handleMachineChange();
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="perfect">Machines parfaites</option>
                  <option value="custom">Machines personnalisées</option>
                </select>
              </div>

              {/* Sélecteur de machine parfaite */}
              {machineType === 'perfect' && (
                <div className="flex items-center space-x-2">
                  <label className="text-sm font-medium text-gray-700">Machine:</label>
                  <select
                    value={selectedPerfectMachine}
                    onChange={(e) => {
                      setSelectedPerfectMachine(e.target.value);
                      handleMachineChange();
                    }}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {Object.entries(perfectMachinesMap).map(([key]) => (
                      <option key={key} value={key}>
                        {key}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Sélecteur de machine personnalisée */}
              {machineType === 'custom' && (
                <div className="flex items-center space-x-2">
                  <label className="text-sm font-medium text-gray-700">Machine:</label>
                  <select
                    value={selectedCustomMachine}
                    onChange={(e) => {
                      setSelectedCustomMachine(e.target.value);
                      handleMachineChange();
                    }}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={Object.keys(customMachines).length === 0}
                  >
                    {Object.keys(customMachines).length === 0 ? (
                      <option value="">Aucune machine créée</option>
                    ) : (
                      Object.entries(customMachines).map(([key, machine]) => (
                        <option key={key} value={key}>
                          {machine.name || key}
                        </option>
                      ))
                    )}
                  </select>
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm"
                  >
                    + Ajouter
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Interface principale */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Colonne gauche: Règles */}
          <div className="lg:col-span-1">
            {renderRules()}
          </div>

          {/* Colonne centrale: Visualisation et contrôles */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Bande */}
            {renderTape()}

            {/* État de la machine */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">État de la machine</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600 break-words">
                    {formatState(state.currentState?.currentState)}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">État actuel</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600 break-words">
                    {getCurrentScore().toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">Score (symboles "1")</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600 break-words">
                    {(state.currentState?.stepCount ?? 0).toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">Étapes exécutées</div>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className={`text-3xl font-bold ${state.currentState?.isHalted ? 'text-red-600' : 'text-green-600'}`}>
                    {state.currentState?.isHalted ? '⏹️' : '▶️'}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    {state.currentState?.isHalted ? 'ARRÊTÉE' : 'EN COURS'}
                  </div>
                </div>
              </div>
            </div>


            {/* Contrôles */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Contrôles</h3>
              
              
              {/* Debug info */}
              <div className="mb-4 p-3 bg-gray-100 rounded text-sm">
                <strong>Debug:</strong> Machine: {state.machine?.name || 'Aucune'} | 
                État: {state.currentState?.currentState || 'Aucun'} | 
                Arrêtée: {state.currentState?.isHalted ? 'Oui' : 'Non'} |
                Règles: {state.machine?.rules.length || 0}
              </div>
              
              <div className="flex items-center justify-center space-x-4">
                <button
                  onClick={handleStep}
                  disabled={state.currentState?.isHalted}
                  className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  <StepForward size={20} />
                  <span>Étape</span>
                </button>

                <button
                  onClick={isRunning ? stop : run}
                  disabled={state.currentState?.isHalted}
                  className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {isRunning ? <Pause size={20} /> : <Play size={20} />}
                  <span>{isRunning ? 'Pause' : 'Exécuter'}</span>
                </button>

                <button
                  onClick={handleReset}
                  className="flex items-center space-x-2 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                >
                  <RotateCcw size={20} />
                  <span>Reset</span>
                </button>
              </div>
            </div>

            {/* Description de la machine */}
            {state.machine && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-2">{state.machine.name}</h3>
                {state.machine.description && (
                  <p className="text-gray-600">{state.machine.description}</p>
                )}
              </div>
            )}
          </div>

          {/* Colonne droite: Journal d'exécution */}
          <div className="lg:col-span-1">
            {state.executionState.speed <= 10 ? (
              <div className="bg-white rounded-lg shadow p-6 sticky top-6">
                <h3 className="text-lg font-semibold mb-4">Journal d'exécution</h3>
                {executionLog.length > 0 ? (
                  <div className="bg-gray-50 rounded p-4 max-h-96 overflow-y-auto">
                    {executionLog.map((log, index) => (
                      <div key={index} className="text-sm py-1 border-b border-gray-200 last:border-b-0">
                        {log}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded p-4 text-center text-gray-500 text-sm">
                    Aucune étape exécutée
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-6 sticky top-6">
                <h3 className="text-lg font-semibold mb-4">Journal d'exécution</h3>
                <div className="bg-yellow-50 rounded p-4 text-center text-yellow-700 text-sm">
                  ⚡ Journal désactivé à haute vitesse<br/>
                  <span className="text-xs">Réduisez la vitesse ≤ 10x pour voir le détail</span>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Modal de création de machine */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <CreateMachineModal 
                onClose={() => setShowCreateModal(false)}
                onCreate={handleCreateCustomMachine}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Composant modal pour créer une machine
interface CreateMachineModalProps {
  onClose: () => void;
  onCreate: (machine: any) => void;
}

const CreateMachineModal: React.FC<CreateMachineModalProps> = ({ onClose, onCreate }) => {
  const [machineName, setMachineName] = useState('');
  const [description, setDescription] = useState('');
  const [numStates, setNumStates] = useState(2);
  const [rules, setRules] = useState<Rule[]>([]);
  
  // Générer les états automatiquement (A, B, C, etc.)
  const generateStates = (count: number): string[] => {
    return Array.from({ length: count }, (_, i) => String.fromCharCode(65 + i)); // A, B, C...
  };
  
  const states = generateStates(numStates);
  const symbols = [0, 1];
  
  // Initialiser les règles quand le nombre d'états change
  useEffect(() => {
    const newRules: Rule[] = [];
    states.forEach(state => {
      symbols.forEach(symbol => {
        newRules.push({
          currentState: state,
          readSymbol: symbol as 0 | 1,
          writeSymbol: 0,
          direction: 'R',
          nextState: 'halt'
        });
      });
    });
    setRules(newRules);
  }, [numStates]);
  
  const updateRule = (index: number, field: keyof Rule, value: any) => {
    const newRules = [...rules];
    newRules[index] = { ...newRules[index], [field]: value };
    setRules(newRules);
  };
  
  const handleCreate = () => {
    if (!machineName.trim()) {
      alert('Veuillez donner un nom à votre machine');
      return;
    }
    
    const machine = {
      numStates,
      numSymbols: 2,
      name: machineName,
      description: description || 'Machine personnalisée',
      predefinedRules: rules
    };
    
    onCreate(machine);
  };
  
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">Créer une nouvelle machine</h2>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          <X size={24} />
        </button>
      </div>
      
      {/* Informations de base */}
      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nom de la machine
          </label>
          <input
            type="text"
            value={machineName}
            onChange={(e) => setMachineName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ma machine Busy Beaver"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description (optionnelle)
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Description de votre machine"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nombre d'états: {numStates}
          </label>
          <input
            type="range"
            min="2"
            max="6"
            value={numStates}
            onChange={(e) => setNumStates(parseInt(e.target.value))}
            className="w-full"
          />
          <div className="text-sm text-gray-500 mt-1">
            États disponibles: {states.join(', ')}, halt
          </div>
        </div>
      </div>
      
      {/* Table des règles */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">Règles de transition</h3>
        <div className="bg-gray-50 p-4 rounded-lg max-h-64 overflow-y-auto">
          <div className="grid grid-cols-5 gap-2 mb-2 text-sm font-medium text-gray-700">
            <div>État actuel</div>
            <div>Symbole lu</div>
            <div>Symbole écrit</div>
            <div>Direction</div>
            <div>Nouvel état</div>
          </div>
          
          {rules.map((rule, index) => (
            <div key={index} className="grid grid-cols-5 gap-2 mb-2 items-center">
              <div className="text-center font-mono bg-white p-2 rounded border">
                {rule.currentState}
              </div>
              <div className="text-center font-mono bg-white p-2 rounded border">
                {rule.readSymbol}
              </div>
              <select
                value={rule.writeSymbol}
                onChange={(e) => updateRule(index, 'writeSymbol', parseInt(e.target.value))}
                className="px-2 py-1 border border-gray-300 rounded text-center"
              >
                <option value={0}>0</option>
                <option value={1}>1</option>
              </select>
              <select
                value={rule.direction}
                onChange={(e) => updateRule(index, 'direction', e.target.value)}
                className="px-2 py-1 border border-gray-300 rounded text-center"
              >
                <option value="L">←</option>
                <option value="R">→</option>
              </select>
              <select
                value={rule.nextState}
                onChange={(e) => updateRule(index, 'nextState', e.target.value)}
                className="px-2 py-1 border border-gray-300 rounded text-center"
              >
                {states.map(state => (
                  <option key={state} value={state}>{state}</option>
                ))}
                <option value="halt">halt</option>
              </select>
            </div>
          ))}
        </div>
        
        <div className="mt-2 text-xs text-gray-600">
          💡 Astuce: Une machine s'arrête quand elle atteint l'état "halt" ou quand aucune règle ne correspond.
        </div>
      </div>
      
      {/* Boutons */}
      <div className="flex justify-end space-x-3">
        <button
          onClick={onClose}
          className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Annuler
        </button>
        <button
          onClick={handleCreate}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Créer la machine
        </button>
      </div>
    </div>
  );
};
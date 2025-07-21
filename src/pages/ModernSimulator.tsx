import React, { useState, useEffect } from 'react';
import '../styles/design-system.css';
import { 
  Play, Pause, RotateCcw, StepForward, Cpu, HelpCircle, FolderOpen
} from 'lucide-react';
import { useBusyBeaver } from '../hooks/useBusyBeaver';
import { usePerformanceMode } from '../hooks/usePerformanceMode';
import { perfectMachinesMap } from '../machines/presets';
import type { Rule, TuringMachine } from '../types/turing';
import { TapeVisualization } from '../components/tape/TapeVisualization';
import { StatsPanel } from '../components/stats/StatsPanel';
import { HelpModal } from '../components/help/HelpModal';
import { RulesPanel } from '../components/rules/RulesPanel';
import { MachineLibrary } from '../components/library/MachineLibrary';

export const ModernSimulator: React.FC = () => {
  const { state, step, run, stop, reset, loadPreset, isRunning, setSpeed } = useBusyBeaver();
  const [selectedPerfectMachine, setSelectedPerfectMachine] = useState<string>('Σ(2) - 6 pas, 4×"1"');
  const [showStats] = useState(true);
  const [showExplanations] = useState(false);
  const [currentExplanation, setCurrentExplanation] = useState<string>('');
  const [executionStartTime, setExecutionStartTime] = useState<number | null>(null);
  const [stepsPerSecond, setStepsPerSecond] = useState(0);
  const [lastStepCount, setLastStepCount] = useState(0);
  const [lastStepTime, setLastStepTime] = useState(Date.now());
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showMachineLibrary, setShowMachineLibrary] = useState(false);
  const [machineSource, setMachineSource] = useState<'preset' | 'custom'>('preset');
  
  // Performance monitoring avec hook
  const { performanceMode, getModeLabel } = usePerformanceMode(
    state.executionState.speed,
    state.currentState?.stepCount || 0
  );
  // const [realStepsPerSecond] = useState(0);"
  
  // Raccourcis clavier
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Éviter les conflits avec les inputs
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement) {
        return;
      }
      
      switch (e.code) {
        case 'Space':
          e.preventDefault();
          if (state.currentState?.isHalted) return;
          if (isRunning) {
            stop();
          } else {
            run();
          }
          break;
        case 'ArrowRight':
          e.preventDefault();
          if (!state.currentState?.isHalted) {
            step();
          }
          break;
        case 'KeyR':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            reset();
          }
          break;
        case 'Digit1':
          e.preventDefault();
          setSpeed(1);
          break;
        case 'Digit2':
          e.preventDefault();
          setSpeed(10);
          break;
        case 'Digit3':
          e.preventDefault();
          setSpeed(100);
          break;
        case 'Digit4':
          e.preventDefault();
          setSpeed(1000);
          break;
        case 'KeyH':
          e.preventDefault();
          setShowHelpModal(true);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isRunning, step, run, stop, reset, setSpeed, state.currentState?.isHalted]);

  // Chargement de la machine sélectionnée
  useEffect(() => {
    const machineSpec = perfectMachinesMap[selectedPerfectMachine];
    if (machineSpec) {
      loadPreset({
        name: machineSpec.name,
        description: machineSpec.description,
        rules: machineSpec.predefinedRules || [],
        initialState: 'A',
        haltStates: new Set(['halt']),
        alphabet: new Set([0, 1])
      });
    }
  }, [selectedPerfectMachine, loadPreset]);

  // Gestion du temps d'exécution et calcul des performances
  useEffect(() => {
    let interval: number;
    if (isRunning && !state.currentState?.isHalted) {
      if (executionStartTime === null) {
        setExecutionStartTime(Date.now());
        setLastStepTime(Date.now());
        setLastStepCount(state.currentState?.stepCount || 0);
      }
      
      interval = setInterval(() => {
        const now = Date.now();
        const currentSteps = state.currentState?.stepCount || 0;
        
        // Calcul étapes/seconde toutes les 500ms minimum
        if (now - lastStepTime >= 500) {
          const stepsDiff = currentSteps - lastStepCount;
          const timeDiff = (now - lastStepTime) / 1000;
          
          if (stepsDiff > 0 && timeDiff > 0) {
            const currentStepsPerSecond = Math.round(stepsDiff / timeDiff);
            setStepsPerSecond(currentStepsPerSecond);
          }
          
          setLastStepCount(currentSteps);
          setLastStepTime(now);
        }
      }, 200); // Vérification plus fréquente
    } else if (!isRunning) {
      // Reset quand on arrête
      if (executionStartTime !== null && (state.currentState?.stepCount || 0) === 0) {
        setExecutionStartTime(null);
        setStepsPerSecond(0);
      }
    }
    return () => clearInterval(interval);
  }, [isRunning, state.currentState?.isHalted, state.currentState?.stepCount]);

  // Reset des statistiques
  useEffect(() => {
    if (state.currentState?.stepCount === 0) {
      setExecutionStartTime(null);
      setStepsPerSecond(0);
      setLastStepCount(0);
      setLastStepTime(Date.now());
    }
  }, [state.currentState?.stepCount]);

  // Fonctions utilitaires
  const formatState = (state: string | number): string => {
    if (state === 'halt') return 'HALT';
    return state.toString();
  };

  const getCurrentScore = (): number => {
    if (!state.currentState?.tape) return 0;
    return Array.from(state.currentState.tape.positions.values()).filter(s => s === 1).length;
  };

  const getExecutionTime = (): string => {
    if (!executionStartTime) return '00:00';
    const elapsed = Math.floor((Date.now() - executionStartTime) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const getEstimatedSteps = (): number => {
    const name = state.machine?.name || '';
    if (name.includes('Σ(2)')) return 6;
    if (name.includes('Σ(3)')) return 14;
    if (name.includes('Σ(4)')) return 107;
    if (name.includes('Σ(5)')) return 47176870;
    if (name.includes('Σ(6)')) return 10 ** 15; // Approximation TRÈS conservatrice
    return 1000; // fallback
  };

  const getSigma6Warning = (): string | null => {
    const name = state.machine?.name || '';
    if (!name.includes('Σ(6)')) return null;
    
    return `Machine non-prouvée`;
  };

  const getEstimatedTimeRemaining = (): string => {
    // Mode étape ou pas d'exécution : pas de métrique de temps
    if (!isRunning || state.currentState?.isHalted) {
      if (state.currentState?.isHalted) return 'Terminé';
      if (!isRunning && (state.currentState?.stepCount || 0) > 0) return 'Pause';
      return '--';
    }
    
    const currentSteps = state.currentState?.stepCount || 0;
    const totalSteps = getEstimatedSteps();
    const remainingSteps = totalSteps - currentSteps;
    
    if (remainingSteps <= 0) return 'Terminé';
    
    // Calcul alternatif si stepsPerSecond pas encore disponible
    if (stepsPerSecond === 0 && executionStartTime && currentSteps > 0) {
      const elapsedSeconds = (Date.now() - executionStartTime) / 1000;
      const avgStepsPerSecond = currentSteps / elapsedSeconds;
      
      if (avgStepsPerSecond > 0) {
        const secondsRemaining = Math.floor(remainingSteps / avgStepsPerSecond);
        
        if (secondsRemaining > 86400) return '> 1 jour';
        if (secondsRemaining > 3600) {
          const hours = Math.floor(secondsRemaining / 3600);
          const minutes = Math.floor((secondsRemaining % 3600) / 60);
          return `${hours}h ${minutes}m`;
        }
        if (secondsRemaining > 60) {
          const minutes = Math.floor(secondsRemaining / 60);
          const seconds = secondsRemaining % 60;
          return `${minutes}m ${seconds}s`;
        }
        return `${secondsRemaining}s`;
      }
    }
    
    // Utilise stepsPerSecond si disponible
    if (stepsPerSecond > 0) {
      const secondsRemaining = Math.floor(remainingSteps / stepsPerSecond);
      
      if (secondsRemaining > 86400) return '> 1 jour';
      if (secondsRemaining > 3600) {
        const hours = Math.floor(secondsRemaining / 3600);
        const minutes = Math.floor((secondsRemaining % 3600) / 60);
        return `${hours}h ${minutes}m`;
      }
      if (secondsRemaining > 60) {
        const minutes = Math.floor(secondsRemaining / 60);
        const seconds = secondsRemaining % 60;
        return `${minutes}m ${seconds}s`;
      }
      return `${secondsRemaining}s`;
    }
    
    // Fallback pendant les premières secondes
    return 'Calcul...';
  };

  const getSpeedPreset = (speed: number): string => {
    if (speed <= 1) return 'Ultra Lent';
    if (speed <= 10) return 'Lent';
    if (speed <= 100) return 'Normal';
    if (speed <= 1000) return 'Rapide';
    if (speed <= 10000) return 'Très Rapide';
    return 'MAXIMUM';
  };

  const setSpeedPreset = (preset: string) => {
    const presets = {
      'Ultra Lent': 0.5,
      'Lent': 5,
      'Normal': 50,
      'Rapide': 500,
      'Très Rapide': 5000,
      'MAXIMUM': 100000
    };
    setSpeed(presets[preset as keyof typeof presets] || 50);
  };

  const getNextRule = (): Rule | null => {
    if (!state.currentState || !state.machine || state.currentState.isHalted) return null;
    
    const currentSymbol = state.currentState.tape.positions.get(state.currentState.tape.headPosition) ?? 0;
    return state.machine.rules.find(r => 
      r.currentState === state.currentState?.currentState && r.readSymbol === currentSymbol
    ) || null;
  };

  const explainRule = (rule: Rule): string => {
    const currentSymbol = state.currentState?.tape.positions.get(state.currentState?.tape.headPosition) ?? 0;
    const direction = rule.direction === 'L' ? 'vers la gauche' : rule.direction === 'R' ? 'vers la droite' : 'sur place';
    
    return `La machine est en état ${formatState(rule.currentState)} et lit le symbole ${currentSymbol}. ` +
           `Selon la règle, elle va écrire ${rule.writeSymbol}, se déplacer ${direction}, ` +
           `puis passer à l'état ${formatState(rule.nextState)}.`;
  };

  // Charger une machine personnalisée
  const handleLoadCustomMachine = (machine: TuringMachine) => {
    loadPreset(machine);
    setMachineSource('custom');
  };

  // Gérer le retour aux machines prédéfinies
  const handleBackToPresets = () => {
    setMachineSource('preset');
    const machineSpec = perfectMachinesMap[selectedPerfectMachine];
    if (machineSpec) {
      loadPreset({
        name: machineSpec.name,
        description: machineSpec.description,
        rules: machineSpec.predefinedRules || [],
        initialState: 'A',
        haltStates: new Set(['halt']),
        alphabet: new Set([0, 1])
      });
    }
  };

  // Gestion des explications automatiques
  useEffect(() => {
    const nextRule = getNextRule();
    if (nextRule && showExplanations) {
      setCurrentExplanation(explainRule(nextRule));
    } else {
      setCurrentExplanation('');
    }
  }, [state.currentState?.currentState, state.currentState?.tape.headPosition, showExplanations]);

  return (
    <div className="min-h-screen bg-surface">
      {/* Header avec contrôles */}
      <div className="card" style={{ borderRadius: 0, borderLeft: 0, borderRight: 0, borderTop: 0, position: 'sticky', top: 0, zIndex: 40 }}>
        <div className="max-w-7xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            {/* Logo et titre */}
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Cpu className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-primary">Busy Beaver Simulator</h1>
                <p className="text-xs text-secondary">
                  {getModeLabel(performanceMode)}
                </p>
              </div>
            </div>

            {/* Sélecteur de machine */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <label className="form-label text-xs" style={{ marginBottom: 0 }}>Machine</label>
                {machineSource === 'preset' ? (
                  <select
                    value={selectedPerfectMachine}
                    onChange={(e) => setSelectedPerfectMachine(e.target.value)}
                    className="form-control text-xs" style={{ width: 'auto', padding: '8px 12px' }}
                  >
                    {Object.entries(perfectMachinesMap).map(([key]) => (
                      <option key={key} value={key}>
                        {key}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-primary font-medium px-3 py-2 bg-primary/10 rounded-md">
                      Machine personnalisée: {state.machine?.name || 'Aucune'}
                    </span>
                    <button
                      onClick={handleBackToPresets}
                      className="btn btn-ghost text-xs"
                      style={{ padding: '4px 8px' }}
                      title="Revenir aux machines prédéfinies"
                    >
                      ← Prédéfinies
                    </button>
                  </div>
                )}
              </div>

              <button
                onClick={() => setShowMachineLibrary(true)}
                className="btn btn-ghost" style={{ padding: '8px' }}
                title="Bibliothèque de machines"
              >
                <FolderOpen className="w-4 h-4" />
              </button>

              <button
                onClick={() => setShowHelpModal(true)}
                className="btn btn-ghost" style={{ padding: '8px' }}
                title="Aide (H)"
              >
                <HelpCircle className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Contrôles principaux */}
          <div className="flex items-center justify-between mt-5 pt-4" style={{ borderTop: '1px solid var(--color-border-light)' }}>
            {/* Boutons de contrôle */}
            <div className="flex items-center gap-2">
              <button
                onClick={isRunning ? stop : run}
                disabled={state.currentState?.isHalted}
                className={`btn ${
                  state.currentState?.isHalted
                    ? 'btn-secondary'
                    : isRunning
                    ? 'btn-warning'
                    : 'btn-success'
                }`}
                title="Play/Pause (Espace)"
              >
                {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                <span className="text-xs">{isRunning ? 'Pause' : 'Play'}</span>
              </button>

              <button
                onClick={step}
                disabled={state.currentState?.isHalted}
                className="btn btn-primary"
                title="Une étape (→)"
              >
                <StepForward className="w-4 h-4" />
                <span className="text-xs">Étape</span>
              </button>

              <button
                onClick={reset}
                className="btn btn-secondary"
                title="Reset (Ctrl+R)"
              >
                <RotateCcw className="w-4 h-4" />
                <span className="text-xs">Reset</span>
              </button>
            </div>

            {/* Contrôle de vitesse */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <label className="form-label text-xs" style={{ marginBottom: 0 }}>Vitesse</label>
                <select
                  value={getSpeedPreset(state.executionState.speed)}
                  onChange={(e) => setSpeedPreset(e.target.value)}
                  className="form-control text-xs" style={{ width: 'auto', padding: '6px 10px' }}
                >
                  <option value="Ultra Lent">Ultra Lent (0.5x)</option>
                  <option value="Lent">Lent (5x)</option>
                  <option value="Normal">Normal (50x)</option>
                  <option value="Rapide">Rapide (500x)</option>
                  <option value="Très Rapide">Très Rapide (5000x)</option>
                  <option value="MAXIMUM">MAXIMUM (100000x)</option>
                </select>
                <span className="text-xs font-medium text-primary min-w-[60px] text-right">
                  {state.executionState.speed.toLocaleString()}x
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Interface principale */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
          
          {/* Colonne gauche - Règles */}
          <div className="lg:col-span-1">
            <RulesPanel
              rules={state.machine?.rules || []}
              currentRule={getNextRule()}
              formatState={formatState}
            />
          </div>

          {/* Colonne principale - Tape */}
          <div className="lg:col-span-3">
            <div className="card card-elevated">
              <TapeVisualization
                state={state}
                formatState={formatState}
                getCurrentScore={getCurrentScore}
                getEstimatedSteps={getEstimatedSteps}
                currentExplanation={currentExplanation}
                performanceMode={performanceMode}
                getSigma6Warning={getSigma6Warning}
              />
            </div>
          </div>

          {/* Colonne droite - Stats */}
          <div className="lg:col-span-1">
            {showStats && (
              <div className="card">
                <StatsPanel
                  state={state}
                  isRunning={isRunning}
                  executionTime={getExecutionTime()}
                  stepsPerSecond={stepsPerSecond}
                  getCurrentScore={getCurrentScore}
                  estimatedTimeRemaining={getEstimatedTimeRemaining()}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Raccourcis clavier (bottom) */}
      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 card" style={{ padding: '8px 16px', opacity: 0.9 }}>
        <div className="flex items-center gap-4 text-xs text-secondary">
          <span><kbd className="text-xs px-1 py-0.5 bg-surface border border-border rounded" style={{ fontSize: '10px' }}>Space</kbd> Play</span>
          <span><kbd className="text-xs px-1 py-0.5 bg-surface border border-border rounded" style={{ fontSize: '10px' }}>→</kbd> Étape</span>
          <span><kbd className="text-xs px-1 py-0.5 bg-surface border border-border rounded" style={{ fontSize: '10px' }}>Ctrl+R</kbd> Reset</span>
          <span><kbd className="text-xs px-1 py-0.5 bg-surface border border-border rounded" style={{ fontSize: '10px' }}>H</kbd> Aide</span>
        </div>
      </div>

      {/* Modal d'aide */}
      {showHelpModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowHelpModal(false)}>
          <div className="card card-elevated max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <HelpModal onClose={() => setShowHelpModal(false)} />
          </div>
        </div>
      )}

      {/* Modal bibliothèque de machines */}
      {showMachineLibrary && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowMachineLibrary(false)}>
          <div className="card card-elevated max-w-4xl w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="card-content">
              <MachineLibrary
                onSelectMachine={handleLoadCustomMachine}
                onClose={() => setShowMachineLibrary(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
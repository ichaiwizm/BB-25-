import React, { useState, useEffect } from 'react';
import '../styles/slider.css';
import { 
  Play, Pause, RotateCcw, StepForward, Zap, 
  Target, BarChart3, Activity, Cpu, Clock, MessageSquare, Eye, EyeOff, HelpCircle, X
} from 'lucide-react';
import { useBusyBeaver } from '../hooks/useBusyBeaver';
import { perfectMachinesMap } from '../machines/presets';
import type { Rule } from '../types/turing';

export const ModernSimulator: React.FC = () => {
  const { state, step, run, stop, reset, loadPreset, isRunning, setSpeed } = useBusyBeaver();
  const [selectedPerfectMachine, setSelectedPerfectMachine] = useState<string>('Σ(2) - 6 pas, 4×"1"');
  const [showStats, setShowStats] = useState(true);
  const [showExplanations, setShowExplanations] = useState(false);
  const [currentExplanation, setCurrentExplanation] = useState<string>('');
  const [executionStartTime, setExecutionStartTime] = useState<number | null>(null);
  const [stepsPerSecond, setStepsPerSecond] = useState(0);
  const [lastStepCount, setLastStepCount] = useState(0);
  const [lastStepTime, setLastStepTime] = useState(Date.now());
  const [showHelpModal, setShowHelpModal] = useState(false);
  
  // Performance monitoring
  const [performanceMode, setPerformanceMode] = useState<'detailed' | 'normal' | 'fast' | 'turbo'>('detailed');
  const [realStepsPerSecond, setRealStepsPerSecond] = useState(0);
  
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
          isRunning ? stop() : run();
          break;
        case 'ArrowRight':
          e.preventDefault();
          if (!state.currentState?.isHalted) step();
          break;
        case 'KeyR':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            reset();
          }
          break;
        case 'Digit1':
          setSpeedPreset('Lent');
          break;
        case 'Digit2':
          setSpeedPreset('Normal');
          break;
        case 'Digit3':
          setSpeedPreset('Rapide');
          break;
        case 'Digit4':
          setSpeedPreset('MAXIMUM');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isRunning, state.currentState?.isHalted, step, run, stop, reset]);

  // Déterminer le mode de performance basé sur la vitesse
  const getPerformanceMode = (speed: number): 'detailed' | 'normal' | 'fast' | 'turbo' => {
    if (speed <= 10) return 'detailed';
    if (speed <= 1000) return 'normal';
    if (speed <= 10000) return 'fast';
    return 'turbo';
  };

  // Mettre à jour le mode de performance
  useEffect(() => {
    const newMode = getPerformanceMode(state.executionState.speed);
    if (newMode !== performanceMode) {
      setPerformanceMode(newMode);
    }
  }, [state.executionState.speed, performanceMode]);

  // Calculer les métriques en temps réel
  useEffect(() => {
    if (isRunning && !executionStartTime) {
      setExecutionStartTime(Date.now());
    } else if (!isRunning && executionStartTime) {
      setExecutionStartTime(null);
    }
  }, [isRunning]);

  // Calculer étapes/seconde et performance réelle
  useEffect(() => {
    const now = Date.now();
    const currentSteps = state.currentState?.stepCount || 0;
    const timeDiff = now - lastStepTime;
    
    if (timeDiff >= 1000 && currentSteps > lastStepCount) {
      const stepsDiff = currentSteps - lastStepCount;
      const sps = Math.round((stepsDiff / timeDiff) * 1000);
      setStepsPerSecond(sps);
      setRealStepsPerSecond(sps); // Performance réelle mesurée
      setLastStepCount(currentSteps);
      setLastStepTime(now);
    }
  }, [state.currentState?.stepCount]);

  // Mettre à jour l'explication quand l'état change (seulement en mode détaillé)
  useEffect(() => {
    if (showExplanations && performanceMode === 'detailed') {
      setCurrentExplanation(generateExplanation());
    } else {
      setCurrentExplanation('');
    }
  }, [showExplanations, state.currentState?.currentState, state.currentState?.tape.headPosition, performanceMode, state.machine?.rules]);

  // Charger machine par défaut
  useEffect(() => {
    const currentMachine = perfectMachinesMap[selectedPerfectMachine];
      
    if (currentMachine) {
      const rules = currentMachine.predefinedRules || [];
      let initialState = rules.length > 0 ? rules[0].currentState : 0;
      
      if (currentMachine.name.includes('Test Simple')) {
        initialState = 0;
      } else if (currentMachine.name.includes('Busy Beaver') || currentMachine.name.includes('Σ(')) {
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
  }, [selectedPerfectMachine, loadPreset]);

  const formatState = (state: any): string => {
    if (state === 'halt') return 'HALT';
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

  const getExecutionTime = (): string => {
    if (!executionStartTime) return '00:00';
    const elapsed = Math.floor((Date.now() - executionStartTime) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
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

  const getEstimatedSteps = (): number => {
    const name = state.machine?.name || '';
    if (name.includes('Σ(2)')) return 6;
    if (name.includes('Σ(3)')) return 14;
    if (name.includes('Σ(4)')) return 107;
    if (name.includes('Σ(5)')) return 47176870;
    if (name.includes('Σ(6)')) return 10 ** 15; // Approximation TRÈS conservatrice de 10↑↑11M (impossible à représenter)
    return 1000; // fallback
  };

  const getSigma6Warning = (): string | null => {
    const name = state.machine?.name || '';
    if (!name.includes('Σ(6)')) return null;
    
    return `🚨 MACHINE EXPÉRIMENTALE Σ(6) - NON-PROUVÉE ! 🚨
Cette machine pourrait ne JAMAIS s'arrêter !

📊 ESTIMATIONS APOCALYPTIQUES:
• Ordinateur normal (1 GHz): > 10^(10^15) siècles
• Tous les supercalculateurs: > 10^(10^14) siècles
• Plus que l'âge de l'Univers × googolplex !

⚠️ BB(6) reste un mystère non-résolu de l'informatique.`;
  };

  const getEstimatedTimeRemaining = (): string => {
    if (!isRunning || state.currentState?.isHalted) return '--';
    
    const remainingSteps = getEstimatedSteps() - (state.currentState?.stepCount || 0);
    if (remainingSteps <= 0) return '00:00';
    
    const currentSpeed = state.executionState.speed || 1;
    
    // Calculer les étapes théoriques par seconde basées sur la vitesse actuelle
    let theoreticalStepsPerSecond: number;
    
    if (currentSpeed >= 50000) {
      // ULTRA-MAX: 25000 étapes par batch à ~60 FPS
      theoreticalStepsPerSecond = 25000 * 60;
    } else if (currentSpeed >= 25000) {
      // ULTRA-RAPIDE: 10000 étapes par batch à ~60 FPS  
      theoreticalStepsPerSecond = 10000 * 60;
    } else if (currentSpeed >= 10000) {
      // Ultra-rapide: 5000 étapes par batch à ~60 FPS
      theoreticalStepsPerSecond = 5000 * 60;
    } else if (currentSpeed >= 1000) {
      // Très rapide: 1000 étapes par batch à ~60 FPS
      theoreticalStepsPerSecond = 1000 * 60;
    } else if (currentSpeed >= 50) {
      // Rapide: 100 étapes par batch à ~60 FPS
      theoreticalStepsPerSecond = 100 * 60;
    } else if (currentSpeed >= 10) {
      // Assez rapide: 10 étapes par batch à ~60 FPS
      theoreticalStepsPerSecond = 10 * 60;
    } else {
      // Vitesse normale avec délai
      theoreticalStepsPerSecond = currentSpeed;
    }
    
    const remainingSeconds = Math.ceil(remainingSteps / theoreticalStepsPerSecond);
    const minutes = Math.floor(remainingSeconds / 60);
    const seconds = remainingSeconds % 60;
    
    if (minutes > 60) {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return `${hours}h${mins.toString().padStart(2, '0')}m`;
    }
    
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const generateExplanation = (): string => {
    if (!state.currentState || !state.machine || state.currentState.isHalted) {
      return 'Machine arrêtée ou aucune règle à exécuter.';
    }

    const currentSymbol = state.currentState.tape.positions.get(state.currentState.tape.headPosition) ?? 0;
    const currentRule = state.machine.rules.find(r => 
      r.currentState === state.currentState?.currentState && r.readSymbol === currentSymbol
    );

    if (!currentRule) {
      return `Aucune règle trouvée pour l'état ${formatState(state.currentState.currentState)} lisant le symbole ${currentSymbol}. La machine va s'arrêter.`;
    }

    const directionText = currentRule.direction === 'L' ? 'gauche' : 
                         currentRule.direction === 'R' ? 'droite' : 'sur place';
    
    return `En état ${formatState(currentRule.currentState)}, la machine lit "${currentRule.readSymbol}" à la position ${state.currentState.tape.headPosition}. Elle va écrire "${currentRule.writeSymbol}", se déplacer vers la ${directionText}, puis passer à l'état ${formatState(currentRule.nextState)}.`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* 🎮 CONTROL BAR (Top Sticky) */}
      <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-slate-200 shadow-sm">
        <div className="max-w-full mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            
            {/* Logo & Machine Info */}
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Cpu className="w-6 h-6 text-white" />
                </div>
                <div className="flex items-center space-x-3">
                  <div>
                    <h1 className="text-xl font-bold text-slate-800">Busy Beaver</h1>
                    <p className="text-sm text-slate-500">Mission Control</p>
                  </div>
                  <button
                    onClick={() => setShowHelpModal(true)}
                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                    title="Qu'est-ce qu'une machine Busy Beaver ?"
                  >
                    <HelpCircle className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Machine Selector */}
              <div className="flex items-center space-x-4">
                <span className="text-sm text-slate-600 font-medium">Machine:</span>
                <select
                  value={selectedPerfectMachine}
                  onChange={(e) => setSelectedPerfectMachine(e.target.value)}
                  className="text-sm font-medium bg-slate-50 rounded-lg px-4 py-2 border-none focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[200px]"
                  title="Choisissez une machine de Turing Busy Beaver prédéfinie. Σ(n) représente les machines optimales pour n états."
                >
                  {Object.entries(perfectMachinesMap).map(([key]) => (
                    <option key={key} value={key}>{key}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Speed Control */}
            <div className="flex items-center space-x-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg px-4 py-2">
              <div title="Contrôle de vitesse d'exécution">
                <Zap className="w-5 h-5 text-orange-500" />
              </div>
              <div className="flex items-center space-x-3">
                <span 
                  className="text-sm font-medium text-slate-700"
                  title={`Vitesse actuelle: ${state.executionState.speed.toLocaleString()} étapes par seconde`}
                >
                  {state.executionState.speed.toLocaleString()}x
                </span>
                <input
                  type="range"
                  min="0.1"
                  max="100000"
                  step="0.1"
                  value={state.executionState.speed}
                  onChange={(e) => setSpeed(parseFloat(e.target.value))}
                  className="w-32 h-2 bg-orange-200 rounded-lg appearance-none cursor-pointer slider-orange"
                  title="Glissez pour ajuster la vitesse d'exécution (0.1x à 100K x)"
                />
                <select
                  value={getSpeedPreset(state.executionState.speed)}
                  onChange={(e) => setSpeedPreset(e.target.value)}
                  className="text-xs bg-white rounded px-2 py-1 border border-orange-200"
                  title="Sélectionnez un préréglage de vitesse rapide"
                >
                  <option>Ultra Lent</option>
                  <option>Lent</option>
                  <option>Normal</option>
                  <option>Rapide</option>
                  <option>Très Rapide</option>
                  <option>MAXIMUM</option>
                </select>
              </div>
            </div>

            {/* Control Buttons */}
            <div className="flex items-center space-x-3">
              <button
                onClick={step}
                disabled={state.currentState?.isHalted}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-slate-300 transition-all duration-200 shadow-sm"
                title="Exécuter une seule étape de la machine (Raccourci: →)"
              >
                <StepForward className="w-4 h-4" />
                <span className="text-sm font-medium">Étape</span>
              </button>

              <button
                onClick={isRunning ? stop : run}
                disabled={state.currentState?.isHalted}
                className={`flex items-center space-x-2 px-6 py-2 rounded-lg transition-all duration-200 shadow-sm font-medium text-sm ${
                  isRunning 
                    ? 'bg-red-500 text-white hover:bg-red-600' 
                    : 'bg-green-500 text-white hover:bg-green-600'
                } disabled:bg-slate-300`}
                title={isRunning ? 'Mettre en pause l\'exécution automatique (Raccourci: Espace)' : 'Démarrer l\'exécution automatique (Raccourci: Espace)'}
              >
                {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                <span>{isRunning ? 'Pause' : 'Exécuter'}</span>
              </button>

              <button
                onClick={reset}
                className="flex items-center space-x-2 px-4 py-2 bg-slate-500 text-white rounded-lg hover:bg-slate-600 transition-all duration-200 shadow-sm"
                title="Remettre la machine à son état initial (Raccourci: Ctrl+R)"
              >
                <RotateCcw className="w-4 h-4" />
                <span className="text-sm font-medium">Reset</span>
              </button>

              <button
                onClick={() => setShowExplanations(!showExplanations)}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  showExplanations 
                    ? 'bg-purple-100 text-purple-600 hover:bg-purple-200' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
                title={showExplanations ? 'Masquer les explications des règles' : 'Afficher les explications des règles (disponible uniquement à vitesse ≤ 10x)'}
              >
                {showExplanations ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
              </button>

              <button
                onClick={() => setShowStats(!showStats)}
                className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-all duration-200"
                title={showStats ? 'Masquer le panneau des statistiques' : 'Afficher le panneau des statistiques'}
              >
                <BarChart3 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 📐 MAIN LAYOUT */}
      <div className="flex h-[calc(100vh-80px)]">
        
        {/* 📊 SIDEBAR (Left) - Conditionnel selon performance */}
        {(performanceMode === 'detailed' || performanceMode === 'normal') && (
          <div className="w-80 bg-white border-r border-slate-200 overflow-y-auto">
          <div className="p-6 space-y-6">
            
            {/* Machine Status */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4">
              <h3 className="text-lg font-semibold text-slate-800 mb-3" title="Informations sur l'état actuel de la machine de Turing">État Machine</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600" title="L'état interne actuel de la machine (A, B, C, etc.)">État actuel</span>
                  <span className="text-lg font-bold text-blue-600" title={`La machine est actuellement dans l'état: ${formatState(state.currentState?.currentState)}`}>{formatState(state.currentState?.currentState)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600" title="Position de la tête de lecture/écriture sur la bande">Position</span>
                  <span className="text-lg font-bold text-purple-600" title={`Tête à la position ${state.currentState?.tape.headPosition || 0} sur la bande infinie`}>{state.currentState?.tape.headPosition || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600" title="Nombre total de symboles '1' écrits sur la bande">Score</span>
                  <span className="text-lg font-bold text-green-600" title={`${getCurrentScore()} symbole(s) '1' sur la bande - objectif du Busy Beaver`}>{getCurrentScore()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600" title="État d'exécution de la machine">Statut</span>
                  <span className={`text-sm font-medium px-2 py-1 rounded ${
                    state.currentState?.isHalted 
                      ? 'bg-red-100 text-red-700' 
                      : isRunning 
                        ? 'bg-green-100 text-green-700'
                        : 'bg-orange-100 text-orange-700'
                  }`}
                  title={
                    state.currentState?.isHalted 
                      ? 'Machine arrêtée - aucune règle applicable ou état HALT atteint' 
                      : isRunning 
                        ? 'Machine en cours d\'exécution automatique'
                        : 'Machine en pause - prête pour la prochaine étape'
                  }>
                    {state.currentState?.isHalted ? 'ARRÊTÉE' : isRunning ? 'EN COURS' : 'PAUSE'}
                  </span>
                </div>
              </div>
            </div>

            {/* Rules Display - Seulement en mode détaillé */}
            {performanceMode === 'detailed' && (
              <div className="bg-slate-50 rounded-xl p-4">
                <h3 className="text-lg font-semibold text-slate-800 mb-4" title="Ensemble des règles de transition de la machine - la règle active est surlignée">Règles de Transition</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {state.machine?.rules.map((rule: Rule, index: number) => {
                  const currentSymbol = state.currentState?.tape.positions.get(state.currentState.tape.headPosition) ?? 0;
                  const isActive = rule.currentState === state.currentState?.currentState && rule.readSymbol === currentSymbol;
                  
                  const ruleExplanation = `Si en état ${formatState(rule.currentState)} et lecture ${rule.readSymbol} → écrire ${rule.writeSymbol}, aller ${rule.direction === 'L' ? 'gauche' : rule.direction === 'R' ? 'droite' : 'nulle part'}, devenir état ${formatState(rule.nextState)}`;
                  
                  return (
                    <div
                      key={index}
                      className={`p-3 rounded-lg border-2 transition-all duration-200 cursor-help ${
                        isActive 
                          ? 'border-yellow-400 bg-yellow-50 shadow-md' 
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                      title={isActive ? `RÈGLE ACTIVE: ${ruleExplanation}` : ruleExplanation}
                    >
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-mono" title="État actuel, Symbole lu">{formatState(rule.currentState)},{rule.readSymbol}</span>
                        <span className="text-slate-400" title="Transition">→</span>
                        <span className="font-mono" title="Symbole écrit, Direction, Nouvel état">{rule.writeSymbol},{formatDirection(rule.direction)},{formatState(rule.nextState)}</span>
                      </div>
                      {isActive && (
                        <div className="mt-2 text-xs text-yellow-700 font-medium flex items-center">
                          <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2 animate-pulse"></div>
                          Règle active
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              </div>
            )}
          </div>
          </div>
        )}

        {/* 🚀 MODE TURBO - Affichage minimal pour performance maximale */}
        {(performanceMode === 'fast' || performanceMode === 'turbo') && (
          <div className="w-80 bg-gradient-to-br from-red-50 to-orange-50 border-r border-red-200 flex items-center justify-center">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-orange-500 rounded-full mx-auto mb-4 flex items-center justify-center animate-pulse">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-red-800 mb-2">
                MODE {performanceMode.toUpperCase()}
              </h3>
              <p className="text-sm text-red-600 mb-4">
                Affichage optimisé pour la performance
              </p>
              <div className="space-y-3 text-sm">
                <div className="bg-white/70 rounded-lg p-3">
                  <div className="font-semibold text-slate-800">Score</div>
                  <div className="text-2xl font-bold text-green-600">{getCurrentScore()}</div>
                </div>
                <div className="bg-white/70 rounded-lg p-3">
                  <div className="font-semibold text-slate-800">Étapes</div>
                  <div className="text-lg font-bold text-purple-600">
                    {(state.currentState?.stepCount || 0).toLocaleString()}
                  </div>
                </div>
                <div className="bg-white/70 rounded-lg p-3">
                  <div className="font-semibold text-slate-800">Performance</div>
                  <div className="text-lg font-bold text-orange-600">
                    {stepsPerSecond.toLocaleString()}/s
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 🎯 MAIN VIEWER (Center) */}
        <div className="flex-1 p-6 overflow-hidden">
          {performanceMode === 'turbo' ? (
            // Mode TURBO : Affichage ultra-simplifié
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <div className="w-32 h-32 bg-gradient-to-br from-red-500 to-orange-500 rounded-full mx-auto mb-6 flex items-center justify-center animate-spin">
                  <Cpu className="w-16 h-16 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-slate-800 mb-4">CALCUL EN COURS</h2>
                <p className="text-slate-600 mb-8">Mode turbo activé pour performance maximale</p>
                <div className="grid grid-cols-2 gap-6 max-w-md mx-auto">
                  <div className="bg-white rounded-xl p-4 shadow-lg">
                    <div className="text-sm text-slate-600 mb-1">Score Actuel</div>
                    <div className="text-3xl font-bold text-green-600">{getCurrentScore()}</div>
                  </div>
                  <div className="bg-white rounded-xl p-4 shadow-lg">
                    <div className="text-sm text-slate-600 mb-1">Étapes</div>
                    <div className="text-xl font-bold text-purple-600">
                      {(state.currentState?.stepCount || 0).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // Mode normal : Visualisation complète
            <TapeVisualization 
              state={state} 
              formatState={formatState}
              getCurrentScore={getCurrentScore}
              getEstimatedSteps={getEstimatedSteps}
              showExplanations={showExplanations}
              currentExplanation={currentExplanation}
              performanceMode={performanceMode}
              getSigma6Warning={getSigma6Warning}
            />
          )}
        </div>

        {/* 📈 STATS PANEL (Right) - Conditionnel selon performance */}
        {showStats && performanceMode !== 'turbo' && (
          <div className="w-80 bg-white border-l border-slate-200 overflow-y-auto">
            <StatsPanel 
              state={state}
              isRunning={isRunning}
              executionTime={getExecutionTime()}
              stepsPerSecond={stepsPerSecond}
              getCurrentScore={getCurrentScore}
              estimatedTimeRemaining={getEstimatedTimeRemaining()}
              performanceMode={performanceMode}
              realStepsPerSecond={realStepsPerSecond}
            />
          </div>
        )}
      </div>

      {/* 🔥 RACCOURCIS CLAVIER (Bottom) */}
      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-black/80 backdrop-blur text-white px-4 py-2 rounded-full text-xs font-medium opacity-75 hover:opacity-100 transition-all duration-200" title="Raccourcis clavier pour un contrôle rapide de la machine">
        <div className="flex items-center space-x-4">
          <span title="Démarrer ou mettre en pause l'exécution"><kbd className="bg-white/20 px-1 rounded">Space</kbd> Play/Pause</span>
          <span title="Exécuter une seule étape"><kbd className="bg-white/20 px-1 rounded">→</kbd> Étape</span>
          <span title="Remettre la machine à zéro"><kbd className="bg-white/20 px-1 rounded">Ctrl+R</kbd> Reset</span>
          <span title="Préréglages de vitesse rapides"><kbd className="bg-white/20 px-1 rounded">1-4</kbd> Vitesse</span>
        </div>
      </div>

      {/* 📚 MODAL D'AIDE */}
      {showHelpModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <HelpModal onClose={() => setShowHelpModal(false)} />
          </div>
        </div>
      )}
    </div>
  );
};

// Composant Tape Visualization
interface TapeVisualizationProps {
  state: any;
  formatState: (state: any) => string;
  getCurrentScore: () => number;
  getEstimatedSteps: () => number;
  showExplanations: boolean;
  currentExplanation: string;
  performanceMode: 'detailed' | 'normal' | 'fast' | 'turbo';
  getSigma6Warning?: () => string | null;
}

const TapeVisualization: React.FC<TapeVisualizationProps> = ({ state, formatState, getCurrentScore, getEstimatedSteps, showExplanations, currentExplanation, performanceMode, getSigma6Warning }) => {
  if (!state.currentState) return null;

  const headPos = state.currentState.tape.headPosition;
  const positions = [];
  
  // Adapter le nombre de positions selon le mode de performance
  const viewRadius = performanceMode === 'detailed' ? 10 : 
                    performanceMode === 'normal' ? 7 : 5;
  
  for (let i = headPos - viewRadius; i <= headPos + viewRadius; i++) {
    positions.push(i);
  }

  return (
    <div className="h-full flex flex-col">
      {/* Tape Header */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-t-xl p-4 text-white">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold" title="Bande infinie de la machine de Turing - vue focalisée autour de la tête">Bande de Turing</h2>
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-2" title="Position actuelle de la tête de lecture/écriture">
              <div className="w-3 h-3 bg-red-400 rounded-full animate-pulse"></div>
              <span>Position {headPos}</span>
            </div>
            <div className="flex items-center space-x-2" title="Nombre de symboles '1' sur la bande - objectif à maximiser">
              <Target className="w-4 h-4" />
              <span>Score: {getCurrentScore()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tape Display */}
      <div className="flex-1 bg-white rounded-b-xl p-8 flex items-center justify-center">
        <div className="relative">
          {/* Position Scale */}
          <div className="flex items-center justify-center space-x-1 mb-4">
            {positions.map((pos) => (
              <div key={`scale-${pos}`} className="w-12 text-center">
                <div className="text-xs text-slate-400 font-mono" title={`Position ${pos} sur la bande infinie`}>{pos}</div>
              </div>
            ))}
          </div>

          {/* Head Indicator */}
          <div className="flex items-center justify-center space-x-1 mb-2">
            {positions.map((pos) => (
              <div key={`indicator-${pos}`} className="w-12 text-center">
                {pos === headPos && (
                  <div className="text-red-500 text-lg animate-bounce" title="Tête de lecture/écriture - position actuelle de la machine">↓</div>
                )}
              </div>
            ))}
          </div>

          {/* Tape Cells */}
          <div className="flex items-center justify-center space-x-1 overflow-x-auto max-w-full px-4">
            {positions.map((pos) => {
              const symbol = state.currentState!.tape.positions.get(pos) ?? 0;
              const isHead = pos === headPos;
              
              return (
                <div
                  key={pos}
                  className={`
                    relative flex items-center justify-center font-bold rounded-xl transition-all duration-300 border-4 cursor-help
                    ${symbol === 1 ? 'w-16 h-16' : 'w-12 h-12'}
                    ${isHead 
                      ? 'border-red-400 bg-gradient-to-br from-red-50 to-red-100 shadow-xl transform scale-110' 
                      : symbol === 1 
                        ? 'border-green-400 bg-gradient-to-br from-green-50 to-green-100 shadow-lg'
                        : 'border-slate-200 bg-gradient-to-br from-slate-50 to-white'
                    }
                  `}
                  title={
                    isHead 
                      ? `Position ${pos}: TÊTE ICI - Symbole actuel: ${symbol} - La machine va lire cette valeur`
                      : `Position ${pos}: Symbole ${symbol}${symbol === 1 ? ' - Contribue au score' : ' - Cellule vide'}`
                  }
                >
                  <div className={`${symbol === 1 ? 'text-2xl text-green-700' : 'text-lg text-slate-600'} font-black`}>
                    {symbol}
                  </div>
                  
                  {/* Glow effect for 1s */}
                  {symbol === 1 && (
                    <div className="absolute inset-0 bg-green-400 rounded-xl opacity-20 animate-pulse"></div>
                  )}
                  
                  {/* Head indicator glow */}
                  {isHead && (
                    <div className="absolute inset-0 bg-red-400 rounded-xl opacity-10 animate-ping"></div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Current Rule Display */}
          <div className="mt-8 text-center space-y-4">
            <div className="inline-flex items-center space-x-3 bg-slate-100 rounded-lg px-4 py-2" title="État interne actuel de la machine de Turing">
              <span className="text-sm text-slate-600">État actuel:</span>
              <span className="font-mono text-blue-600 font-bold text-lg">
                {formatState(state.currentState?.currentState)}
              </span>
            </div>
            
            {/* Explanation Display */}
            {showExplanations && currentExplanation && state.executionState.speed <= 10 && (
              <div className="max-w-2xl mx-auto bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    <MessageSquare className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-purple-800 mb-2">Explication de la règle</h4>
                    <p className="text-sm text-purple-700 leading-relaxed">
                      {currentExplanation}
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Progress estimation pour les machines connues */}
            {state.machine?.name.includes('Σ(') && (
              <div className="max-w-md mx-auto" title={`Progression basée sur les résultats théoriques connus des machines Busy Beaver`}>
                <div className="flex justify-between text-xs text-slate-500 mb-1">
                  <span title="Pourcentage d'avancement vers le résultat optimal connu">Progression estimée</span>
                  <span title={`${(state.currentState?.stepCount || 0).toLocaleString()} / ${getEstimatedSteps().toLocaleString()} étapes`}>{Math.min(100, ((state.currentState?.stepCount || 0) / getEstimatedSteps() * 100)).toFixed(1)}%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2" title="Barre de progression vers l'arrêt optimal">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, ((state.currentState?.stepCount || 0) / getEstimatedSteps() * 100))}%` }}
                    title={`${Math.min(100, ((state.currentState?.stepCount || 0) / getEstimatedSteps() * 100)).toFixed(1)}% accompli`}
                  ></div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Σ(6) Warning Display - MOVED UNDER TAPE */}
        {getSigma6Warning && getSigma6Warning() && (
          <div className="max-w-2xl mx-auto bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-200 rounded-lg p-3 mt-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center animate-pulse">
                  <span className="text-white text-lg font-bold">⚠️</span>
                </div>
              </div>
              <div className="flex-1">
                <pre className="text-xs text-red-800 font-medium whitespace-pre-wrap leading-relaxed">
                  {getSigma6Warning()}
                </pre>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Composant Stats Panel
interface StatsPanelProps {
  state: any;
  isRunning: boolean;
  executionTime: string;
  stepsPerSecond: number;
  getCurrentScore: () => number;
  estimatedTimeRemaining: string;
  performanceMode: 'detailed' | 'normal' | 'fast' | 'turbo';
  realStepsPerSecond: number;
}

const StatsPanel: React.FC<StatsPanelProps> = ({ 
  state, 
  isRunning, 
  executionTime, 
  stepsPerSecond,
  getCurrentScore,
  estimatedTimeRemaining,
  performanceMode,
  realStepsPerSecond
}) => {
  return (
    <div className="p-6 space-y-6">
      {/* Real-time Metrics */}
      <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl p-4">
        <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center" title="Statistiques de performance en temps réel">
          <Activity className="w-5 h-5 mr-2 text-green-600" />
          Métriques Temps Réel
        </h3>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-600" title="Durée écoulée depuis le début de l'exécution">Temps écoulé</span>
            <span className="text-lg font-mono font-bold text-blue-600" title={`Exécution en cours depuis ${executionTime}`}>{executionTime}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-600" title="Nombre total d'étapes exécutées depuis le début">Étapes totales</span>
            <span className="text-lg font-bold text-purple-600" title={`${(state.currentState?.stepCount || 0).toLocaleString()} étapes de calcul effectuées`}>
              {(state.currentState?.stepCount || 0).toLocaleString()}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-600" title="Vitesse d'exécution mesurée en temps réel">Étapes/sec</span>
            <span className="text-lg font-bold text-orange-600" title={`Performance actuelle: ${stepsPerSecond.toLocaleString()} étapes par seconde`}>
              {stepsPerSecond.toLocaleString()}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-600" title="Nombre de symboles '1' sur la bande - mesure de la performance Busy Beaver">Score actuel</span>
            <span className="text-lg font-bold text-green-600" title={`${getCurrentScore().toLocaleString()} symboles '1' écrits sur la bande`}>
              {getCurrentScore().toLocaleString()}
            </span>
          </div>

          <div className="flex justify-between items-center border-t border-slate-200 pt-3">
            <span className="text-sm text-slate-600 flex items-center" title="Estimation basée sur la vitesse actuelle et les étapes restantes">
              <Clock className="w-4 h-4 mr-1" />
              Temps restant estimé
            </span>
            <span className="text-lg font-bold text-purple-600 font-mono" title={`Temps estimé pour terminer: ${estimatedTimeRemaining}`}>
              {estimatedTimeRemaining}
            </span>
          </div>
        </div>
      </div>


      {/* Machine Info */}
      <div className="bg-slate-800 text-white rounded-xl p-4">
        <h3 className="text-lg font-semibold mb-4" title="Informations sur la machine de Turing actuellement chargée">Machine Active</h3>
        <div className="space-y-2">
          <div className="text-sm">
            <span className="text-slate-300" title="Nom de la machine Busy Beaver sélectionnée">Nom:</span>
            <span className="ml-2 font-medium" title={state.machine?.name || 'Aucune machine chargée'}>{state.machine?.name || 'Aucune'}</span>
          </div>
          <div className="text-sm">
            <span className="text-slate-300" title="Nombre total de règles de transition définies">Règles:</span>
            <span className="ml-2 font-medium" title={`${state.machine?.rules.length || 0} règles de transition programmées`}>{state.machine?.rules.length || 0}</span>
          </div>
          <div className="text-sm">
            <span className="text-slate-300" title="État d'exécution actuel de la machine">Statut:</span>
            <span className={`ml-2 font-medium ${
              state.currentState?.isHalted ? 'text-red-400' : isRunning ? 'text-green-400' : 'text-orange-400'
            }`}
            title={
              state.currentState?.isHalted 
                ? 'Machine arrêtée - exécution terminée' 
                : isRunning 
                  ? 'Machine en cours d\'exécution automatique'
                  : 'Machine en pause - prête pour la suite'
            }>
              {state.currentState?.isHalted ? 'HALT' : isRunning ? 'RUNNING' : 'PAUSED'}
            </span>
          </div>
        </div>
      </div>

    </div>
  );
};

// Composant Modal d'Aide
interface HelpModalProps {
  onClose: () => void;
}

const HelpModal: React.FC<HelpModalProps> = ({ onClose }) => {
  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
            <Cpu className="w-7 h-7 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Qu'est-ce qu'une Machine Busy Beaver ?</h2>
            <p className="text-slate-500">Découvrez ce fascinant concept informatique</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all duration-200"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Content */}
      <div className="space-y-6 max-h-[60vh] overflow-y-auto">
        
        {/* Introduction */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6">
          <h3 className="text-xl font-semibold text-slate-800 mb-3 flex items-center">
            <div className="w-6 h-6 bg-blue-500 rounded-full mr-3 flex items-center justify-center">
              <span className="text-white text-sm font-bold">?</span>
            </div>
            Le Problème Busy Beaver
          </h3>
          <p className="text-slate-700 leading-relaxed">
            Les <strong>machines Busy Beaver</strong> sont des machines de Turing spéciales qui cherchent à produire le maximum de symboles "1" 
            avant de s'arrêter. C'est l'un des problèmes les plus fascinants de l'informatique théorique !
          </p>
        </div>

        {/* Machine de Turing */}
        <div>
          <h3 className="text-lg font-semibold text-slate-800 mb-3 flex items-center">
            <Activity className="w-5 h-5 text-green-600 mr-2" />
            Machine de Turing - Les Bases
          </h3>
          <div className="bg-slate-50 rounded-lg p-4 space-y-3">
            <p className="text-slate-700">Une machine de Turing est un modèle de calcul qui comprend :</p>
            <ul className="list-disc list-inside space-y-2 text-slate-600 ml-4">
              <li><strong>Une bande infinie</strong> avec des cellules contenant des symboles (0 ou 1)</li>
              <li><strong>Une tête de lecture/écriture</strong> qui peut lire, écrire et se déplacer</li>
              <li><strong>Des états internes</strong> (A, B, C, etc.) qui déterminent le comportement</li>
              <li><strong>Des règles de transition</strong> qui dictent les actions selon l'état et le symbole lu</li>
            </ul>
          </div>
        </div>

        {/* Le Défi Busy Beaver */}
        <div>
          <h3 className="text-lg font-semibold text-slate-800 mb-3 flex items-center">
            <Target className="w-5 h-5 text-red-600 mr-2" />
            Le Défi du Busy Beaver
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-red-50 rounded-lg p-4">
              <h4 className="font-semibold text-red-800 mb-2">Objectif</h4>
              <p className="text-red-700 text-sm">
                Trouver la machine de Turing à <strong>n états</strong> qui écrit le plus de "1" possible 
                avant de s'arrêter naturellement.
              </p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <h4 className="font-semibold text-green-800 mb-2">Contraintes</h4>
              <p className="text-green-700 text-sm">
                La machine doit <strong>s'arrêter</strong> d'elle-même (pas de boucle infinie) 
                et utiliser seulement les symboles 0 et 1.
              </p>
            </div>
          </div>
        </div>

        {/* Résultats Connus */}
        <div>
          <h3 className="text-lg font-semibold text-slate-800 mb-3 flex items-center">
            <BarChart3 className="w-5 h-5 text-purple-600 mr-2" />
            Résultats Connus
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full bg-white rounded-lg shadow-sm border border-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-slate-700 font-semibold">Machine</th>
                  <th className="px-4 py-3 text-left text-slate-700 font-semibold">États</th>
                  <th className="px-4 py-3 text-left text-slate-700 font-semibold">Score (1s)</th>
                  <th className="px-4 py-3 text-left text-slate-700 font-semibold">Étapes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <tr>
                  <td className="px-4 py-3 font-mono text-blue-600">Σ(1)</td>
                  <td className="px-4 py-3">1</td>
                  <td className="px-4 py-3 font-semibold">1</td>
                  <td className="px-4 py-3">1</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-mono text-blue-600">Σ(2)</td>
                  <td className="px-4 py-3">2</td>
                  <td className="px-4 py-3 font-semibold">4</td>
                  <td className="px-4 py-3">6</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-mono text-blue-600">Σ(3)</td>
                  <td className="px-4 py-3">3</td>
                  <td className="px-4 py-3 font-semibold">6</td>
                  <td className="px-4 py-3">14</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-mono text-blue-600">Σ(4)</td>
                  <td className="px-4 py-3">4</td>
                  <td className="px-4 py-3 font-semibold">13</td>
                  <td className="px-4 py-3">107</td>
                </tr>
                <tr className="bg-yellow-50">
                  <td className="px-4 py-3 font-mono text-blue-600">Σ(5)</td>
                  <td className="px-4 py-3">5</td>
                  <td className="px-4 py-3 font-semibold">4 098</td>
                  <td className="px-4 py-3">47 millions+</td>
                </tr>
                <tr className="bg-red-50 border-2 border-red-300">
                  <td className="px-4 py-3 font-mono text-red-600 font-bold">Σ(6) ⚠️</td>
                  <td className="px-4 py-3">6</td>
                  <td className="px-4 py-3 font-semibold text-red-700">???</td>
                  <td className="px-4 py-3 text-red-700 font-bold">&gt; 10↑↑11M</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            💡 La complexité explose rapidement ! Σ(6) reste un mystère non-résolu.
          </p>
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-xs text-red-700 font-medium">
              🚨 <strong>Σ(6) EXPÉRIMENTAL:</strong> Meilleur candidat actuel (juillet 2025). 
              NON-PROUVÉ ! Pourrait ne jamais s'arrêter. Estimation temporelle: 
              plus que l'âge de l'Univers × googolplex.
            </p>
          </div>
        </div>

        {/* Pourquoi c'est fascinant */}
        <div>
          <h3 className="text-lg font-semibold text-slate-800 mb-3 flex items-center">
            <MessageSquare className="w-5 h-5 text-orange-600 mr-2" />
            Pourquoi c'est fascinant ?
          </h3>
          <div className="bg-orange-50 rounded-lg p-4 space-y-3">
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-semibold text-orange-800 mb-2">🧠 Liens avec l'intelligence</h4>
                <p className="text-orange-700">
                  Ces machines montrent comment des règles simples peuvent créer des comportements complexes, 
                  similaires aux processus de pensée.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-orange-800 mb-2">🚀 Limites du calcul</h4>
                <p className="text-orange-700">
                  Le problème touche aux limites fondamentales de ce qui peut être calculé et prouvé mathématiquement.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-orange-800 mb-2">💡 Créativité computationnelle</h4>
                <p className="text-orange-700">
                  Trouver de nouvelles machines Busy Beaver nécessite souvent des insights créatifs inattendus.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-orange-800 mb-2">🔬 Recherche active</h4>
                <p className="text-orange-700">
                  Des chercheurs du monde entier collaborent encore aujourd'hui pour résoudre Σ(6) et au-delà.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Utilisation du Simulateur */}
        <div>
          <h3 className="text-lg font-semibold text-slate-800 mb-3 flex items-center">
            <Play className="w-5 h-5 text-blue-600 mr-2" />
            Utiliser ce Simulateur
          </h3>
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-semibold text-blue-800 mb-2">🎮 Contrôles</h4>
                <ul className="text-blue-700 space-y-1">
                  <li>• <kbd className="bg-blue-200 px-1 rounded">Espace</kbd> : Play/Pause</li>
                  <li>• <kbd className="bg-blue-200 px-1 rounded">→</kbd> : Une étape</li>
                  <li>• <kbd className="bg-blue-200 px-1 rounded">Ctrl+R</kbd> : Reset</li>
                  <li>• Ajustez la vitesse pour observer</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-blue-800 mb-2">🔍 Observation</h4>
                <ul className="text-blue-700 space-y-1">
                  <li>• Regardez les règles actives</li>
                  <li>• Suivez la tête sur la bande</li>
                  <li>• Observez le score augmenter</li>
                  <li>• Activez les explications en mode lent</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Footer */}
      <div className="mt-6 pt-4 border-t border-slate-200 text-center">
        <p className="text-sm text-slate-500">
          Explorez les mystères de l'informatique théorique ! 🤖✨
        </p>
      </div>
    </div>
  );
};
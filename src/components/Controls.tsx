import React from 'react';
import { Play, Pause, RotateCcw, StepForward } from 'lucide-react';
import { useBusyBeaver } from '../hooks/useBusyBeaver';

/**
 * Composant de contrôle de la machine de Turing
 * Fournit les boutons de contrôle et le réglage de vitesse
 */
export const Controls: React.FC = () => {
  const {
    state,
    step,
    run,
    stop,
    reset,
    setSpeed,
    isRunning,
    stepCount,
    cleanup
  } = useBusyBeaver();

  /**
   * Gère le bouton Run/Pause
   */
  const handleRunPause = () => {
    if (isRunning) {
      stop();
    } else {
      run();
    }
  };

  /**
   * Gère le changement de vitesse
   * @param event Événement du slider
   */
  const handleSpeedChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newSpeed = parseFloat(event.target.value);
    setSpeed(newSpeed);
  };

  /**
   * Formate l'affichage du nombre d'étapes
   * @param steps Nombre d'étapes
   * @returns Texte formaté
   */
  const formatStepCount = (steps: number): string => {
    if (steps >= 1000000) {
      return `${(steps / 1000000).toFixed(1)}M`;
    } else if (steps >= 1000) {
      return `${(steps / 1000).toFixed(1)}K`;
    }
    return steps.toString();
  };

  /**
   * Formate l'affichage de la vitesse
   * @param speed Vitesse en steps/s
   * @returns Texte formaté
   */
  const formatSpeed = (speed: number): string => {
    return `${speed.toFixed(1)} steps/s`;
  };

  // Nettoyer les ressources lors du démontage
  React.useEffect(() => {
    return cleanup;
  }, [cleanup]);

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* Titre */}
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Contrôles de la machine
      </h3>

      {/* Boutons de contrôle principaux */}
      <div className="flex items-center space-x-3 mb-6">
        {/* Bouton Step */}
        <button
          onClick={step}
          disabled={state.currentState?.isHalted || isRunning}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          title="Exécuter une étape"
        >
          <StepForward size={18} className="mr-2" />
          Step
        </button>

        {/* Bouton Run/Pause */}
        <button
          onClick={handleRunPause}
          disabled={state.currentState?.isHalted}
          className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          title={isRunning ? "Mettre en pause" : "Démarrer l'exécution"}
        >
          {isRunning ? (
            <>
              <Pause size={18} className="mr-2" />
              Pause
            </>
          ) : (
            <>
              <Play size={18} className="mr-2" />
              Run
            </>
          )}
        </button>

        {/* Bouton Reset */}
        <button
          onClick={reset}
          disabled={!state.machine}
          className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          title="Remettre à zéro"
        >
          <RotateCcw size={18} className="mr-2" />
          Reset
        </button>
      </div>

      {/* Informations d'état */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Nombre d'étapes */}
        <div className="bg-gray-50 p-3 rounded-md">
          <div className="text-sm text-gray-600 mb-1">Étapes exécutées</div>
          <div className="text-2xl font-bold text-gray-800">
            {formatStepCount(stepCount)}
          </div>
        </div>

        {/* État actuel */}
        <div className="bg-gray-50 p-3 rounded-md">
          <div className="text-sm text-gray-600 mb-1">État actuel</div>
          <div className="text-lg font-semibold text-gray-800">
            {state.currentState?.isHalted 
              ? `Arrêt (${state.currentState.haltState})`
              : state.currentState?.currentState ?? 'Aucun'
            }
          </div>
        </div>

        {/* Vitesse actuelle */}
        <div className="bg-gray-50 p-3 rounded-md">
          <div className="text-sm text-gray-600 mb-1">Vitesse</div>
          <div className="text-lg font-semibold text-gray-800">
            {formatSpeed(state.executionState.speed)}
          </div>
        </div>
      </div>

      {/* Contrôle de la vitesse */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700">
            Vitesse d'exécution
          </label>
          <span className="text-sm text-gray-500">
            {formatSpeed(state.executionState.speed)}
          </span>
        </div>
        
        <div className="relative">
          <input
            type="range"
            min="0.5"
            max="10"
            step="0.1"
            value={state.executionState.speed}
            onChange={handleSpeedChange}
            disabled={isRunning}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed slider"
          />
          
          {/* Marqueurs de vitesse */}
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>0.5</span>
            <span>5</span>
            <span>10</span>
          </div>
        </div>
      </div>

      {/* Statut de la machine */}
      <div className="mt-6 p-3 rounded-md border">
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${
            state.currentState?.isHalted 
              ? 'bg-red-500' 
              : isRunning 
                ? 'bg-green-500' 
                : 'bg-yellow-500'
          }`}></div>
          <span className="text-sm font-medium text-gray-700">
            {state.currentState?.isHalted 
              ? 'Machine arrêtée'
              : isRunning 
                ? 'En cours d\'exécution'
                : 'En attente'
            }
          </span>
        </div>
        
        {state.currentState?.isHalted && (
          <p className="text-sm text-gray-600 mt-1">
            La machine s'est arrêtée après {formatStepCount(stepCount)} étapes.
          </p>
        )}
      </div>

      {/* Styles CSS personnalisés pour le slider */}
      <style>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
        
        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
        
        .slider:focus {
          outline: none;
        }
        
        .slider:focus::-webkit-slider-thumb {
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3);
        }
        
        .slider:focus::-moz-range-thumb {
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3);
        }
      `}</style>
    </div>
  );
}; 
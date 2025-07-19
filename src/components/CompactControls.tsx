import React from 'react';
import { Play, Pause, SkipForward, RotateCcw } from 'lucide-react';

interface CompactControlsProps {
  isRunning: boolean;
  isAnimating: boolean;
  machineHalted: boolean;
  onStep: () => void;
  onRun: () => void;
  onPause: () => void;
  onReset: () => void;
  speed: number;
  onSpeedChange: (speed: number) => void;
}

export const CompactControls: React.FC<CompactControlsProps> = ({
  isRunning,
  isAnimating,
  machineHalted,
  onStep,
  onRun,
  onPause,
  onReset,
  speed,
  onSpeedChange
}) => {
  const getSpeedLabel = (speed: number) => {
    if (speed <= 0.5) return 'Très lent';
    if (speed <= 1) return 'Lent';
    if (speed <= 2) return 'Normal';
    if (speed <= 5) return 'Rapide';
    return 'Très rapide';
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-3">
      <div className="flex items-center justify-between">
        {/* Boutons principaux */}
        <div className="flex items-center space-x-2">
          <button
            onClick={onStep}
            disabled={machineHalted || isAnimating}
            className="flex items-center space-x-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-200 text-sm font-medium"
          >
            <SkipForward size={14} />
            <span>Étape</span>
          </button>

          <button
            onClick={isRunning ? onPause : onRun}
            disabled={machineHalted}
            className="flex items-center space-x-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-200 text-sm font-medium"
          >
            {isRunning ? <Pause size={14} /> : <Play size={14} />}
            <span>{isRunning ? 'Pause' : 'Exécuter'}</span>
          </button>


          <button
            onClick={onReset}
            className="flex items-center space-x-1 px-3 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-all duration-200 text-sm font-medium"
          >
            <RotateCcw size={14} />
            <span>Reset</span>
          </button>
        </div>

        {/* Contrôle de vitesse */}
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-600">
            <span className="font-medium">Vitesse:</span>
            <span className="ml-1 font-bold">{getSpeedLabel(speed)}</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-500">🐌</span>
            <input
              type="range"
              min="0.5"
              max="10"
              step="0.5"
              value={speed}
              onChange={(e) => onSpeedChange(parseFloat(e.target.value))}
              disabled={isRunning}
              className="w-20 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
            />
            <span className="text-xs text-gray-500">🚀</span>
          </div>
        </div>
      </div>

      {/* Légende rapide */}
      <div className="mt-2 flex items-center justify-center space-x-6 text-xs text-gray-500">
        <div><strong>Étape</strong>: Une action</div>
        <div><strong>Exécuter</strong>: Automatique</div>
        <div><strong>Reset</strong>: Recommencer</div>
      </div>
    </div>
  );
};
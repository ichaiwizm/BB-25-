import React from 'react';
import { Play, Pause, SkipForward, RotateCcw, Eye } from 'lucide-react';

interface CinematicControlsProps {
  isRunning: boolean;
  isAnimating: boolean;
  machineHalted: boolean;
  onStep: () => void;
  onRun: () => void;
  onPause: () => void;
  onReset: () => void;
  onWatch: () => void;
  speed: number;
  onSpeedChange: (speed: number) => void;
}

export const CinematicControls: React.FC<CinematicControlsProps> = ({
  isRunning,
  isAnimating,
  machineHalted,
  onStep,
  onRun,
  onPause,
  onReset,
  onWatch,
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
    <div className="bg-white rounded-xl shadow-xl p-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          🎮 Contrôles de la Machine
        </h2>
      </div>

      {/* Boutons principaux */}
      <div className="flex justify-center space-x-4 mb-6">
        {/* Étape suivante */}
        <button
          onClick={onStep}
          disabled={machineHalted || isAnimating}
          className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105"
        >
          <SkipForward size={20} />
          <span className="font-medium">Étape suivante</span>
        </button>

        {/* Run/Pause */}
        <button
          onClick={isRunning ? onPause : onRun}
          disabled={machineHalted}
          className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105"
        >
          {isRunning ? <Pause size={20} /> : <Play size={20} />}
          <span className="font-medium">{isRunning ? 'Pause' : 'Exécuter'}</span>
        </button>

        {/* Mode regarder */}
        <button
          onClick={onWatch}
          disabled={machineHalted}
          className="flex items-center space-x-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105"
        >
          <Eye size={20} />
          <span className="font-medium">Regarder</span>
        </button>

        {/* Reset */}
        <button
          onClick={onReset}
          className="flex items-center space-x-2 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-all duration-200 transform hover:scale-105"
        >
          <RotateCcw size={20} />
          <span className="font-medium">Recommencer</span>
        </button>
      </div>

      {/* Contrôle de vitesse */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="text-center mb-3">
          <div className="text-sm font-medium text-gray-700 mb-1">
            Vitesse d'exécution
          </div>
          <div className="text-lg font-bold text-gray-800">
            {getSpeedLabel(speed)}
          </div>
        </div>
        
        <div className="relative">
          <input
            type="range"
            min="0.5"
            max="10"
            step="0.5"
            value={speed}
            onChange={(e) => onSpeedChange(parseFloat(e.target.value))}
            disabled={isRunning}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
          />
          
          {/* Marqueurs de vitesse */}
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>🐌 Lent</span>
            <span>🚀 Rapide</span>
          </div>
        </div>
      </div>

      {/* Explications */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <div className="text-sm text-blue-800 space-y-1">
          <div><strong>Étape suivante</strong> : Avance d'une action à la fois</div>
          <div><strong>Exécuter</strong> : Lance l'exécution automatique</div>
          <div><strong>Regarder</strong> : Exécution lente avec explications</div>
          <div><strong>Recommencer</strong> : Remet la machine à zéro</div>
        </div>
      </div>
    </div>
  );
};
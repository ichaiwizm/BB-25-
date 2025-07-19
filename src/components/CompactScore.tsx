import React from 'react';
import { Trophy, Zap, Target } from 'lucide-react';

interface CompactScoreProps {
  currentScore: number;
  stepCount: number;
  expectedScore?: number;
  machineHalted: boolean;
  currentState: string | number;
  lastAction?: string;
}

export const CompactScore: React.FC<CompactScoreProps> = ({
  currentScore,
  stepCount,
  expectedScore,
  machineHalted,
  currentState,
  lastAction
}) => {
  const getScoreColor = () => {
    if (!expectedScore) return 'text-blue-600';
    if (currentScore >= expectedScore) return 'text-green-600';
    return 'text-blue-600';
  };

  const getStatusIcon = () => {
    if (machineHalted) return '🏁';
    if (lastAction) return '⚡';
    return '⏳';
  };

  const getStatusText = () => {
    if (machineHalted) return 'Terminé';
    if (lastAction) return lastAction;
    return 'En attente';
  };

  const formatState = (state: string | number) => {
    return state === 'halt' ? 'HALT' : `${state}`;
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 h-full">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-gray-800 mb-2">🏆 Score</h3>
      </div>

      {/* Score principal */}
      <div className="text-center mb-4">
        <div className={`text-4xl font-bold ${getScoreColor()}`}>
          {currentScore}
        </div>
        <div className="text-sm text-gray-600">symboles "1"</div>
        {expectedScore && (
          <div className="text-xs text-gray-500">
            sur {expectedScore} attendus
          </div>
        )}
      </div>

      {/* Barre de progression */}
      {expectedScore && (
        <div className="mb-4">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-500 ${
                currentScore >= expectedScore ? 'bg-green-500' : 'bg-blue-500'
              }`}
              style={{ width: `${Math.min(100, (currentScore / expectedScore) * 100)}%` }}
            />
          </div>
          <div className="text-center text-xs text-gray-500 mt-1">
            {Math.round((currentScore / expectedScore) * 100)}%
          </div>
        </div>
      )}

      {/* Statistiques */}
      <div className="space-y-3">
        <div className="flex items-center justify-between p-2 bg-blue-50 rounded">
          <div className="flex items-center space-x-2">
            <Zap className="h-4 w-4 text-blue-600" />
            <span className="text-sm text-blue-800">Étapes</span>
          </div>
          <span className="font-bold text-blue-600">{stepCount}</span>
        </div>

        <div className="flex items-center justify-between p-2 bg-green-50 rounded">
          <div className="flex items-center space-x-2">
            <Target className="h-4 w-4 text-green-600" />
            <span className="text-sm text-green-800">Efficacité</span>
          </div>
          <span className="font-bold text-green-600">
            {stepCount > 0 ? Math.round((currentScore / stepCount) * 100) : 0}%
          </span>
        </div>

        <div className="flex items-center justify-between p-2 bg-purple-50 rounded">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white text-xs">q</span>
            </div>
            <span className="text-sm text-purple-800">État</span>
          </div>
          <span className="font-bold text-purple-600 font-mono">
            {formatState(currentState)}
          </span>
        </div>
      </div>

      {/* Statut actuel */}
      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="text-2xl mb-1">{getStatusIcon()}</div>
          <div className="text-sm font-medium text-gray-700">
            {getStatusText()}
          </div>
        </div>
      </div>

      {/* Message final */}
      {machineHalted && (
        <div className="mt-4 p-3 bg-gradient-to-r from-green-100 to-blue-100 rounded-lg border border-green-300">
          <div className="text-center">
            <Trophy className="h-6 w-6 text-yellow-600 mx-auto mb-1" />
            <div className="text-sm font-bold text-green-800">
              Résultat final !
            </div>
            <div className="text-xs text-green-700">
              {currentScore} en {stepCount} étapes
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
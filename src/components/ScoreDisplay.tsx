import React from 'react';
import { Trophy, Target, Zap } from 'lucide-react';

interface ScoreDisplayProps {
  currentScore: number;
  stepCount: number;
  expectedScore?: number;
  machineHalted: boolean;
}

export const ScoreDisplay: React.FC<ScoreDisplayProps> = ({
  currentScore,
  stepCount,
  expectedScore,
  machineHalted
}) => {
  const getScoreStatus = () => {
    if (!expectedScore) return 'unknown';
    if (currentScore === expectedScore) return 'perfect';
    if (currentScore > expectedScore) return 'exceeded';
    return 'inProgress';
  };

  const getStatusColor = () => {
    const status = getScoreStatus();
    switch (status) {
      case 'perfect': return 'text-green-600';
      case 'exceeded': return 'text-purple-600';
      case 'inProgress': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = () => {
    const status = getScoreStatus();
    switch (status) {
      case 'perfect': return '🎯';
      case 'exceeded': return '🚀';
      case 'inProgress': return '⚡';
      default: return '📊';
    }
  };

  const getStatusMessage = () => {
    const status = getScoreStatus();
    if (!machineHalted) {
      return 'En cours...';
    }
    
    switch (status) {
      case 'perfect': return 'Score parfait !';
      case 'exceeded': return 'Incroyable ! Score dépassé !';
      case 'inProgress': return 'Machine arrêtée';
      default: return 'Score final';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-xl p-6">
      <div className="text-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          🏆 Score Busy Beaver
        </h2>
      </div>

      {/* Score principal */}
      <div className="text-center mb-6">
        <div className={`text-6xl font-bold ${getStatusColor()} mb-2`}>
          {currentScore}
        </div>
        <div className="text-lg text-gray-600">
          symboles "1" sur la bande
        </div>
        <div className="text-sm text-gray-500 mt-1">
          {getStatusIcon()} {getStatusMessage()}
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-4 text-center">
          <div className="flex justify-center mb-2">
            <Zap className="h-6 w-6 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-blue-600">{stepCount}</div>
          <div className="text-sm text-blue-800">Étapes</div>
        </div>
        
        <div className="bg-green-50 rounded-lg p-4 text-center">
          <div className="flex justify-center mb-2">
            <Target className="h-6 w-6 text-green-600" />
          </div>
          <div className="text-2xl font-bold text-green-600">
            {expectedScore || '?'}
          </div>
          <div className="text-sm text-green-800">Score attendu</div>
        </div>
      </div>

      {/* Barre de progression */}
      {expectedScore && (
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Progression</span>
            <span>{Math.round((currentScore / expectedScore) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className={`h-3 rounded-full transition-all duration-500 ${
                currentScore >= expectedScore ? 'bg-green-500' : 'bg-blue-500'
              }`}
              style={{ width: `${Math.min(100, (currentScore / expectedScore) * 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* Efficacité */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="text-center">
          <div className="text-sm text-gray-600 mb-1">Efficacité</div>
          <div className="text-lg font-bold text-gray-800">
            {stepCount > 0 ? Math.round((currentScore / stepCount) * 100) : 0}%
          </div>
          <div className="text-xs text-gray-500">
            symboles "1" par étape
          </div>
        </div>
      </div>

      {/* Message final */}
      {machineHalted && (
        <div className="mt-4 p-4 bg-gradient-to-r from-green-100 to-blue-100 rounded-lg border-2 border-green-300">
          <div className="text-center">
            <Trophy className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
            <div className="text-lg font-bold text-green-800">
              Résultat final !
            </div>
            <div className="text-sm text-green-700">
              {currentScore} symboles "1" en {stepCount} étapes
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
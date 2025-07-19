import React from 'react';
import type { Tape as TapeType } from '../types/turing';

interface CompactTapeProps {
  tape: TapeType;
  headPosition: number;
  isAnimating: boolean;
  lastAction?: {
    oldSymbol: number;
    newSymbol: number;
    direction: 'L' | 'R' | 'N';
  };
}

export const CompactTape: React.FC<CompactTapeProps> = ({
  tape,
  headPosition,
  isAnimating,
  lastAction
}) => {
  const visibleRange = 5; // Cellules de chaque côté (réduit pour éviter débordement)
  const positions = [];
  
  for (let i = headPosition - visibleRange; i <= headPosition + visibleRange; i++) {
    positions.push(i);
  }

  const getSymbolAt = (position: number) => {
    return (tape.positions.get(position) ?? tape.defaultSymbol) as number;
  };

  const isHeadPosition = (position: number) => {
    return position === headPosition;
  };

  const getCellClasses = (position: number) => {
    const symbol = getSymbolAt(position);
    const isHead = isHeadPosition(position);
    
    const baseClasses = [
      'w-10 h-10',
      'border-2',
      'flex items-center justify-center',
      'text-lg font-bold',
      'transition-all duration-300 ease-in-out',
      'relative',
      'rounded-lg',
      'shadow-sm'
    ];

    // Couleurs des symboles (contraste amélioré)
    if (symbol === 0) {
      baseClasses.push('bg-gray-200 text-gray-700 border-gray-400');
    } else {
      baseClasses.push('bg-yellow-400 text-yellow-900 border-yellow-600 shadow-md');
    }

    // Style de la tête
    if (isHead) {
      baseClasses.push('ring-3 ring-red-500 ring-offset-1 scale-110');
      if (isAnimating) {
        baseClasses.push('animate-pulse');
      }
    }

    return baseClasses.join(' ');
  };

  return (
    <div className="relative">
      {/* Flèche indicatrice */}
      <div className="flex justify-center mb-2">
        <div className="flex items-center space-x-2">
          <div className="w-0 h-0 border-l-3 border-r-3 border-b-6 border-transparent border-b-red-500 animate-bounce"></div>
          <span className="text-sm font-bold text-red-600">TÊTE</span>
        </div>
      </div>

      {/* Bande principale */}
      <div className="flex items-center justify-center space-x-1 py-2">
        {positions.map((position) => (
          <div key={position} className="relative">
            <div className={getCellClasses(position)}>
              {/* Symbole */}
              <span className="select-none">
                {getSymbolAt(position)}
              </span>
              
              {/* Effet scintillant pour les 1 */}
              {getSymbolAt(position) === 1 && (
                <div className="absolute inset-0 bg-yellow-300 opacity-20 rounded-lg animate-pulse"></div>
              )}
            </div>
            
            {/* Numéro de position (plus petit) */}
            <div className="text-center text-xs text-gray-400 mt-1 font-mono">
              {position}
            </div>
          </div>
        ))}
      </div>

      {/* Indicateur de mouvement */}
      {isAnimating && lastAction && (
        <div className="flex justify-center mt-2">
          <div className="flex items-center space-x-2 text-blue-600 font-bold text-sm animate-pulse">
            {lastAction.direction === 'L' && (
              <>
                <div className="w-0 h-0 border-t-2 border-b-2 border-r-4 border-transparent border-r-blue-500"></div>
                <span>← Gauche</span>
              </>
            )}
            {lastAction.direction === 'R' && (
              <>
                <span>Droite →</span>
                <div className="w-0 h-0 border-t-2 border-b-2 border-l-4 border-transparent border-l-blue-500"></div>
              </>
            )}
            {lastAction.direction === 'N' && (
              <>
                <span>• Reste</span>
              </>
            )}
          </div>
        </div>
      )}

      {/* Position actuelle */}
      <div className="text-center mt-2">
        <span className="text-sm text-gray-600">
          Position: <span className="font-mono font-bold text-red-600">{headPosition}</span>
        </span>
      </div>
    </div>
  );
};
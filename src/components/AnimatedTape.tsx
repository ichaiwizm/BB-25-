import React from 'react';
import type { Tape as TapeType } from '../types/turing';

interface AnimatedTapeProps {
  tape: TapeType;
  headPosition: number;
  isAnimating: boolean;
  lastAction?: {
    oldSymbol: number;
    newSymbol: number;
    direction: 'L' | 'R' | 'N';
  };
}

export const AnimatedTape: React.FC<AnimatedTapeProps> = ({
  tape,
  headPosition,
  isAnimating,
  lastAction
}) => {
  const visibleRange = 8; // Cellules visibles de chaque côté
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
      'w-16 h-16',
      'border-2 border-gray-400',
      'flex items-center justify-center',
      'text-2xl font-bold',
      'transition-all duration-500 ease-in-out',
      'relative',
      'rounded-lg'
    ];

    // Couleurs des symboles
    if (symbol === 0) {
      baseClasses.push('bg-slate-100 text-slate-400');
    } else {
      baseClasses.push('bg-yellow-300 text-yellow-900 shadow-lg');
    }

    // Animation de la tête
    if (isHead) {
      baseClasses.push('ring-4 ring-red-500 ring-offset-2');
      if (isAnimating) {
        baseClasses.push('animate-pulse scale-110');
      } else {
        baseClasses.push('scale-105');
      }
    }

    // Animation du changement de symbole
    if (isHead && lastAction && lastAction.oldSymbol !== lastAction.newSymbol) {
      baseClasses.push('animate-bounce');
    }

    return baseClasses.join(' ');
  };

  return (
    <div className="bg-white rounded-xl shadow-xl p-8">
      {/* Titre */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          🎯 Bande de la Machine
        </h2>
        <p className="text-gray-600">
          Position de la tête : <span className="font-mono text-lg text-red-600">{headPosition}</span>
        </p>
      </div>

      {/* Bande */}
      <div className="relative">
        {/* Flèche indicatrice au-dessus de la tête */}
        <div className="flex justify-center mb-4">
          <div className="relative">
            <div className="w-0 h-0 border-l-4 border-r-4 border-b-8 border-transparent border-b-red-500 animate-bounce"></div>
            <div className="text-center text-sm text-red-600 font-bold mt-1">
              TÊTE
            </div>
          </div>
        </div>

        {/* Cellules de la bande */}
        <div className="flex items-center justify-center space-x-2 py-4">
          {positions.map((position) => (
            <div key={position} className="relative">
              <div className={getCellClasses(position)}>
                {/* Symbole */}
                <span className="select-none">
                  {getSymbolAt(position)}
                </span>
                
                {/* Effet de brillance pour les 1 */}
                {getSymbolAt(position) === 1 && (
                  <div className="absolute inset-0 bg-yellow-200 opacity-30 rounded-lg animate-pulse"></div>
                )}
              </div>
              
              {/* Numéro de position */}
              <div className="text-center text-xs text-gray-500 mt-1 font-mono">
                {position}
              </div>
            </div>
          ))}
        </div>

        {/* Flèche de direction de mouvement */}
        {isAnimating && lastAction && (
          <div className="flex justify-center mt-4">
            <div className="flex items-center space-x-2 text-blue-600 font-bold animate-pulse">
              {lastAction.direction === 'L' && (
                <>
                  <div className="w-0 h-0 border-t-4 border-b-4 border-r-8 border-transparent border-r-blue-500"></div>
                  <span>Déplacement à GAUCHE</span>
                </>
              )}
              {lastAction.direction === 'R' && (
                <>
                  <span>Déplacement à DROITE</span>
                  <div className="w-0 h-0 border-t-4 border-b-4 border-l-8 border-transparent border-l-blue-500"></div>
                </>
              )}
              {lastAction.direction === 'N' && (
                <>
                  <span>Pas de déplacement</span>
                  <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Légende */}
      <div className="flex justify-center space-x-8 mt-6 text-sm">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-slate-100 border-2 border-gray-400 rounded"></div>
          <span className="text-gray-700">Symbole 0 (vide)</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-yellow-300 border-2 border-gray-400 rounded shadow-sm"></div>
          <span className="text-gray-700">Symbole 1 (marqué)</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-gray-200 border-2 border-red-500 rounded"></div>
          <span className="text-gray-700">Position de la tête</span>
        </div>
      </div>
    </div>
  );
};
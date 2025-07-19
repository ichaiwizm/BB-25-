import React, { useState, useEffect, useRef } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, Eye, EyeOff } from 'lucide-react';
import type { Tape as TapeType } from '../types/turing';

/**
 * Props du composant Tape
 */
interface TapeProps {
  /** Bande de la machine de Turing */
  tape: TapeType;
  /** Position de la tête de lecture/écriture */
  headPosition: number;
  /** Nombre de cellules à afficher de chaque côté de la tête (défaut: 20) */
  visibleCells?: number;
  /** Indique si on affiche les numéros de position */
  showPositions?: boolean;
}

/**
 * Composant d'affichage de la bande de la machine de Turing
 * Affiche une fenêtre glissante autour de la position de la tête
 */
export const Tape: React.FC<TapeProps> = ({
  tape,
  headPosition,
  visibleCells = 20,
  showPositions = true
}) => {
  const [zoom, setZoom] = useState(1);
  const [autoCenter, setAutoCenter] = useState(true);
  const [showAnimations, setShowAnimations] = useState(true);
  const [previousHeadPosition, setPreviousHeadPosition] = useState(headPosition);
  const [tapeHistory, setTapeHistory] = useState<Map<number, number>>(new Map());
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  // Gérer le zoom
  const [actualVisibleCells, setActualVisibleCells] = useState(visibleCells);
  
  useEffect(() => {
    setActualVisibleCells(Math.round(visibleCells / zoom));
  }, [visibleCells, zoom]);

  // Suivre les changements de position de la tête pour les animations
  useEffect(() => {
    if (showAnimations && headPosition !== previousHeadPosition) {
      // Enregistrer l'historique des changements
      const newHistory = new Map(tapeHistory);
      newHistory.set(previousHeadPosition, Date.now());
      setTapeHistory(newHistory);
      
      // Nettoyer l'historique ancien (plus de 3 secondes)
      const now = Date.now();
      for (const [pos, timestamp] of newHistory.entries()) {
        if (now - timestamp > 3000) {
          newHistory.delete(pos);
        }
      }
      
      setPreviousHeadPosition(headPosition);
    }
  }, [headPosition, previousHeadPosition, showAnimations, tapeHistory]);

  // Auto-centrer sur la tête
  useEffect(() => {
    if (autoCenter && scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const cellWidth = 44 * zoom; // 40px + 4px margin
      const containerWidth = container.offsetWidth;
      const targetScrollLeft = (actualVisibleCells * cellWidth) - (containerWidth / 2);
      
      container.scrollTo({
        left: Math.max(0, targetScrollLeft),
        behavior: showAnimations ? 'smooth' : 'auto'
      });
    }
  }, [headPosition, autoCenter, zoom, actualVisibleCells, showAnimations]);

  // Calculer la plage de positions à afficher
  const startPosition = headPosition - actualVisibleCells;
  const endPosition = headPosition + actualVisibleCells;

  // Générer les positions à afficher
  const positions: number[] = [];
  for (let i = startPosition; i <= endPosition; i++) {
    positions.push(i);
  }

  /**
   * Obtient le symbole à une position donnée
   * @param position Position sur la bande
   * @returns Symbole (0 ou 1 par défaut)
   */
  const getSymbolAt = (position: number): number => {
    return (tape.positions.get(position) ?? tape.defaultSymbol) as number;
  };

  /**
   * Détermine si une position est sous la tête
   * @param position Position à vérifier
   * @returns true si la position est sous la tête
   */
  const isUnderHead = (position: number): boolean => {
    return position === headPosition;
  };

  /**
   * Obtient les classes CSS pour une cellule
   * @param position Position de la cellule
   * @returns Classes CSS
   */
  const getCellClasses = (position: number): string => {
    const symbol = getSymbolAt(position);
    const isHead = isUnderHead(position);
    const recentlyChanged = tapeHistory.has(position);
    
    const baseSize = 40 * zoom;
    const classes = [
      'border border-gray-300', // Bordure
      'flex items-center justify-center', // Centrage du contenu
      'font-mono font-bold', // Police monospace pour les chiffres
      'select-none', // Empêcher la sélection
      'relative' // Pour les animations
    ];

    // Taille dynamique selon le zoom
    classes.push(`w-[${baseSize}px] h-[${baseSize}px]`);
    
    // Animation selon les préférences
    if (showAnimations) {
      classes.push('transition-all duration-300 ease-in-out');
    }

    // Couleur de fond selon le symbole avec animations
    if (symbol === 0) {
      classes.push('bg-slate-800 text-white');
      if (recentlyChanged && showAnimations) {
        classes.push('animate-pulse');
      }
    } else if (symbol === 1) {
      classes.push('bg-yellow-400 text-black shadow-lg');
      if (recentlyChanged && showAnimations) {
        classes.push('animate-bounce');
      }
    } else {
      // Pour les symboles personnalisés
      classes.push('bg-gray-200 text-gray-800');
    }

    // Effet pour la tête de lecture
    if (isHead) {
      classes.push('ring-4 ring-red-500 ring-offset-2 z-10');
      if (showAnimations) {
        classes.push('shadow-xl transform scale-110');
      }
    }

    return classes.join(' ');
  };

  /**
   * Formate l'affichage d'un symbole
   * @param symbol Symbole à afficher
   * @returns Texte à afficher
   */
  const formatSymbol = (symbol: number | string): string => {
    if (typeof symbol === 'number') {
      return symbol.toString();
    }
    return symbol;
  };

  return (
    <div className="flex flex-col space-y-4 p-4 bg-white rounded-lg shadow-lg">
      {/* En-tête avec contrôles */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">
          🎞️ Bande de la machine de Turing
        </h3>
        
        {/* Contrôles de visualisation */}
        <div className="flex items-center space-x-2">
          {/* Zoom */}
          <div className="flex items-center space-x-1 border rounded-lg p-1">
            <button
              onClick={() => setZoom(Math.max(0.5, zoom - 0.25))}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
              title="Dézoomer"
            >
              <ZoomOut size={16} />
            </button>
            <span className="text-xs px-2 min-w-[3rem] text-center">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => setZoom(Math.min(2, zoom + 0.25))}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
              title="Zoomer"
            >
              <ZoomIn size={16} />
            </button>
          </div>

          {/* Auto-centrage */}
          <button
            onClick={() => setAutoCenter(!autoCenter)}
            className={`p-2 rounded transition-colors ${
              autoCenter 
                ? 'bg-blue-100 text-blue-700' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            title={autoCenter ? "Désactiver auto-centrage" : "Activer auto-centrage"}
          >
            <RotateCcw size={16} />
          </button>

          {/* Animations */}
          <button
            onClick={() => setShowAnimations(!showAnimations)}
            className={`p-2 rounded transition-colors ${
              showAnimations 
                ? 'bg-green-100 text-green-700' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            title={showAnimations ? "Désactiver animations" : "Activer animations"}
          >
            {showAnimations ? <Eye size={16} /> : <EyeOff size={16} />}
          </button>
        </div>
      </div>

      {/* Statistiques et informations */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div className="bg-blue-50 p-3 rounded-lg">
          <div className="text-blue-800 font-semibold">Position tête</div>
          <div className="text-blue-600 text-xl font-bold">{headPosition}</div>
        </div>
        <div className="bg-green-50 p-3 rounded-lg">
          <div className="text-green-800 font-semibold">Symboles "1"</div>
          <div className="text-green-600 text-xl font-bold">
            {Array.from(tape.positions.values()).filter(s => s === 1).length}
          </div>
        </div>
        <div className="bg-purple-50 p-3 rounded-lg">
          <div className="text-purple-800 font-semibold">Cellules utilisées</div>
          <div className="text-purple-600 text-xl font-bold">{tape.positions.size}</div>
        </div>
        <div className="bg-orange-50 p-3 rounded-lg">
          <div className="text-orange-800 font-semibold">Zoom</div>
          <div className="text-orange-600 text-xl font-bold">{Math.round(zoom * 100)}%</div>
        </div>
      </div>

      {/* Conteneur de la bande avec défilement horizontal */}
      <div 
        ref={scrollContainerRef}
        className="relative w-full overflow-x-auto bg-gray-50 rounded-lg p-4"
        style={{ maxHeight: '200px' }}
      >
        {/* Bande principale */}
        <div className="flex items-center space-x-1 min-w-max py-4">
          {positions.map((position) => (
            <div
              key={position}
              className={getCellClasses(position)}
              title={`Position ${position}: ${formatSymbol(getSymbolAt(position))}`}
              style={{ 
                width: `${40 * zoom}px`, 
                height: `${40 * zoom}px`,
                fontSize: `${12 * zoom}px`
              }}
            >
              {/* Symbole */}
              <span className="text-center">
                {formatSymbol(getSymbolAt(position))}
              </span>
              
              {/* Numéro de position (optionnel) */}
              {showPositions && zoom >= 0.75 && (
                <div 
                  className="absolute text-gray-500 pointer-events-none"
                  style={{ 
                    bottom: `-${24 * zoom}px`, 
                    fontSize: `${10 * zoom}px`,
                    left: '50%',
                    transform: 'translateX(-50%)'
                  }}
                >
                  {position}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Indicateurs et légende */}
      <div className="flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
        {/* Indicateur de position de la tête */}
        <div className="flex items-center space-x-2 text-sm text-red-600">
          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
          <span className="font-medium">Tête à la position {headPosition}</span>
        </div>

        {/* Légende */}
        <div className="flex items-center space-x-4 text-sm text-gray-600">
          <div className="flex items-center space-x-1">
            <div className="w-4 h-4 bg-slate-800 border border-gray-300 rounded"></div>
            <span>0</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-4 h-4 bg-yellow-400 border border-gray-300 rounded shadow"></div>
            <span>1</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-4 h-4 bg-gray-200 border border-gray-300 ring-2 ring-red-400 ring-offset-1 rounded"></div>
            <span>Tête</span>
          </div>
        </div>
      </div>
    </div>
  );
}; 
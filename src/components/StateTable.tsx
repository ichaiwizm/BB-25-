import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Download, Trash2 } from 'lucide-react';
import type { MachineState } from '../types/turing';
import { useMachineContext } from '../context/MachineContext';

/**
 * Props du composant StateTable
 */
interface StateTableProps {
  /** Indique si le composant doit être visible */
  visible?: boolean;
  /** Nombre maximum d'entrées à afficher */
  maxEntries?: number;
  /** Indique si on doit afficher les détails de la bande */
  showTapeDetails?: boolean;
}

/**
 * Entrée dans le tableau de debug
 */
interface DebugEntry {
  step: number;
  state: number | string;
  tapeHash: string;
  headPosition: number;
  timestamp: number;
  tapeSnapshot: string;
}

/**
 * Composant de debug affichant l'historique des états
 * Tableau avec étapes, états et hash de la bande
 */
export const StateTable: React.FC<StateTableProps> = ({
  visible = true,
  maxEntries = 100,
  showTapeDetails = false
}) => {
  const { state } = useMachineContext();
  const [debugHistory, setDebugHistory] = useState<DebugEntry[]>([]);
  const [isVisible, setIsVisible] = useState(visible);
  const [autoScroll, setAutoScroll] = useState(true);

  /**
   * Génère un hash simple de la bande
   * @param tape Bande de la machine
   * @returns Hash de la bande
   */
  const generateTapeHash = (tape: MachineState['tape']): string => {
    try {
      // Créer un snapshot de la bande autour de la tête
      const headPos = tape.headPosition;
      const range = 10; // ±10 positions autour de la tête
      const snapshot: Record<number, any> = {};
      
      for (let i = headPos - range; i <= headPos + range; i++) {
        const symbol = tape.positions.get(i) ?? tape.defaultSymbol;
        if (symbol !== tape.defaultSymbol) {
          snapshot[i] = symbol;
        }
      }
      
      // Ajouter la position de la tête
      (snapshot as any)._head = headPos;
      
      return JSON.stringify(snapshot);
    } catch (error) {
      return 'error';
    }
  };

  /**
   * Crée un snapshot lisible de la bande
   * @param tape Bande de la machine
   * @returns Snapshot formaté
   */
  const createTapeSnapshot = (tape: MachineState['tape']): string => {
    try {
      const headPos = tape.headPosition;
      const range = 5; // ±5 positions pour l'affichage
      let snapshot = '';
      
      for (let i = headPos - range; i <= headPos + range; i++) {
        const symbol = tape.positions.get(i) ?? tape.defaultSymbol;
        if (i === headPos) {
          snapshot += `[${symbol}]`; // Position de la tête
        } else {
          snapshot += symbol;
        }
        if (i < headPos + range) {
          snapshot += ' ';
        }
      }
      
      return snapshot;
    } catch (error) {
      return 'error';
    }
  };

  /**
   * Ajoute une entrée au debug
   */
  const addDebugEntry = () => {
    if (!state.currentState) return;

    const entry: DebugEntry = {
      step: state.currentState.stepCount,
      state: state.currentState.currentState,
      tapeHash: generateTapeHash(state.currentState.tape),
      headPosition: state.currentState.tape.headPosition,
      timestamp: Date.now(),
      tapeSnapshot: createTapeSnapshot(state.currentState.tape)
    };

    setDebugHistory(prev => {
      const newHistory = [...prev, entry];
      // Limiter le nombre d'entrées
      if (newHistory.length > maxEntries) {
        return newHistory.slice(-maxEntries);
      }
      return newHistory;
    });
  };

  /**
   * Efface l'historique de debug
   */
  const clearHistory = () => {
    setDebugHistory([]);
  };

  /**
   * Exporte l'historique en JSON
   */
  const exportHistory = () => {
    const dataStr = JSON.stringify(debugHistory, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `busy-beaver-debug-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  /**
   * Formate un timestamp
   * @param timestamp Timestamp en millisecondes
   * @returns Timestamp formaté
   */
  const formatTimestamp = (timestamp: number): string => {
    return new Date(timestamp).toLocaleTimeString();
  };

  /**
   * Formate un hash pour l'affichage
   * @param hash Hash complet
   * @returns Hash tronqué
   */
  const formatHash = (hash: string): string => {
    if (hash.length <= 20) return hash;
    return hash.substring(0, 10) + '...' + hash.substring(hash.length - 10);
  };

  // Surveiller les changements d'état
  useEffect(() => {
    if (state.currentState && isVisible) {
      addDebugEntry();
    }
  }, [state.currentState?.stepCount, state.currentState?.currentState, isVisible]);

  // Auto-scroll vers le bas
  useEffect(() => {
    if (autoScroll && debugHistory.length > 0) {
      const tableElement = document.getElementById('debug-table');
      if (tableElement) {
        tableElement.scrollTop = tableElement.scrollHeight;
      }
    }
  }, [debugHistory, autoScroll]);

  if (!isVisible) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800">
            Debug Table
          </h3>
          <button
            onClick={() => setIsVisible(true)}
            className="inline-flex items-center px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <Eye size={16} className="mr-1" />
            Afficher
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-4" aria-live="polite">
      {/* En-tête */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          Debug Table ({debugHistory.length} entrées)
        </h3>
        
        <div className="flex items-center space-x-2">
          {/* Toggle auto-scroll */}
          <button
            onClick={() => setAutoScroll(!autoScroll)}
            className={`px-2 py-1 text-xs rounded ${
              autoScroll 
                ? 'bg-green-100 text-green-800' 
                : 'bg-gray-100 text-gray-600'
            }`}
            title={autoScroll ? 'Auto-scroll activé' : 'Auto-scroll désactivé'}
          >
            Auto
          </button>
          
          {/* Export */}
          <button
            onClick={exportHistory}
            disabled={debugHistory.length === 0}
            className="inline-flex items-center px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
            title="Exporter l'historique"
          >
            <Download size={14} className="mr-1" />
            Export
          </button>
          
          {/* Clear */}
          <button
            onClick={clearHistory}
            disabled={debugHistory.length === 0}
            className="inline-flex items-center px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 disabled:bg-gray-400 transition-colors"
            title="Effacer l'historique"
          >
            <Trash2 size={14} className="mr-1" />
            Clear
          </button>
          
          {/* Hide */}
          <button
            onClick={() => setIsVisible(false)}
            className="inline-flex items-center px-2 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700 transition-colors"
            title="Masquer le debug"
          >
            <EyeOff size={14} className="mr-1" />
            Hide
          </button>
        </div>
      </div>

      {/* Tableau de debug */}
      <div 
        id="debug-table"
        className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg"
      >
        <table className="w-full text-xs">
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              <th className="px-3 py-2 text-left font-medium text-gray-700 border-b">
                Step
              </th>
              <th className="px-3 py-2 text-left font-medium text-gray-700 border-b">
                State
              </th>
              <th className="px-3 py-2 text-left font-medium text-gray-700 border-b">
                Head
              </th>
              <th className="px-3 py-2 text-left font-medium text-gray-700 border-b">
                Tape Hash
              </th>
              {showTapeDetails && (
                <th className="px-3 py-2 text-left font-medium text-gray-700 border-b">
                  Tape Snapshot
                </th>
              )}
              <th className="px-3 py-2 text-left font-medium text-gray-700 border-b">
                Time
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {debugHistory.length === 0 ? (
              <tr>
                <td colSpan={showTapeDetails ? 6 : 5} className="px-3 py-4 text-center text-gray-500">
                  Aucune donnée de debug disponible
                </td>
              </tr>
            ) : (
              debugHistory.map((entry, _index) => (
                <tr 
                  key={`${entry.step}-${entry.timestamp}`}
                  className="hover:bg-gray-50 transition-colors"
                >
                  {/* Step */}
                  <td className="px-3 py-2 font-mono text-gray-900">
                    {entry.step}
                  </td>
                  
                  {/* State */}
                  <td className="px-3 py-2 font-mono text-gray-900">
                    {entry.state === 'halt' ? 'HALT' : entry.state}
                  </td>
                  
                  {/* Head Position */}
                  <td className="px-3 py-2 font-mono text-gray-900">
                    {entry.headPosition}
                  </td>
                  
                  {/* Tape Hash */}
                  <td className="px-3 py-2 font-mono text-gray-600" title={entry.tapeHash}>
                    {formatHash(entry.tapeHash)}
                  </td>
                  
                  {/* Tape Snapshot (optionnel) */}
                  {showTapeDetails && (
                    <td className="px-3 py-2 font-mono text-gray-600 max-w-xs truncate" title={entry.tapeSnapshot}>
                      {entry.tapeSnapshot}
                    </td>
                  )}
                  
                  {/* Timestamp */}
                  <td className="px-3 py-2 text-gray-500">
                    {formatTimestamp(entry.timestamp)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Informations supplémentaires */}
      <div className="mt-3 text-xs text-gray-600">
        <p>
          Hash: représentation JSON de la bande autour de la tête (±10 positions)
        </p>
        {showTapeDetails && (
          <p>
            Snapshot: vue de la bande avec [position de la tête] (±5 positions)
          </p>
        )}
      </div>
    </div>
  );
}; 
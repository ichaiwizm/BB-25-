import React from 'react';
import { Trash2 } from 'lucide-react';
import type { Rule } from '../types/turing';
import { useMachineContext } from '../context/MachineContext';

/**
 * Props du composant RuleList
 */
interface RuleListProps {
  /** Callback appelé lors de la suppression d'une règle */
  onRuleDelete?: (rule: Rule) => void;
}

/**
 * Composant d'affichage de la liste des règles
 * Affiche les règles groupées par état avec possibilité de suppression
 */
export const RuleList: React.FC<RuleListProps> = ({ onRuleDelete }) => {
  const { state, dispatch } = useMachineContext();

  /**
   * Supprime une règle
   * @param ruleToDelete Règle à supprimer
   */
  const handleDeleteRule = (ruleToDelete: Rule) => {
    if (!state.machine) return;

    const updatedRules = state.machine.rules.filter(rule => 
      !(rule.currentState === ruleToDelete.currentState && 
        rule.readSymbol === ruleToDelete.readSymbol)
    );

    dispatch({ type: 'UPDATE_RULES', payload: updatedRules });
    onRuleDelete?.(ruleToDelete);
  };

  /**
   * Formate l'affichage d'un symbole
   * @param symbol Symbole à formater
   * @returns Texte formaté
   */
  const formatSymbol = (symbol: number | string): string => {
    return symbol.toString();
  };

  /**
   * Formate l'affichage d'une direction
   * @param direction Direction à formater
   * @returns Texte formaté
   */
  const formatDirection = (direction: string): string => {
    switch (direction) {
      case 'L': return 'Gauche';
      case 'R': return 'Droite';
      case 'N': return 'Ne pas bouger';
      default: return direction;
    }
  };

  /**
   * Formate l'affichage d'un état
   * @param state État à formater
   * @returns Texte formaté
   */
  const formatState = (state: number | string): string => {
    if (state === 'halt') {
      return 'Arrêt';
    }
    return `État ${state}`;
  };

  /**
   * Groupe les règles par état
   * @param rules Règles à grouper
   * @returns Règles groupées par état
   */
  const groupRulesByState = (rules: Rule[]): Record<string, Rule[]> => {
    const grouped: Record<string, Rule[]> = {};
    
    rules.forEach(rule => {
      const stateKey = rule.currentState.toString();
      if (!grouped[stateKey]) {
        grouped[stateKey] = [];
      }
      grouped[stateKey].push(rule);
    });

    return grouped;
  };

  // Vérifier si une machine est chargée
  if (!state.machine || !state.machine.rules.length) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Règles de transition
        </h3>
        <p className="text-gray-600">
          {!state.machine 
            ? 'Aucune machine chargée. Veuillez d\'abord charger une machine.'
            : 'Aucune règle définie. Utilisez l\'éditeur pour ajouter des règles.'
          }
        </p>
      </div>
    );
  }

  const groupedRules = groupRulesByState(state.machine.rules);
  const stateKeys = Object.keys(groupedRules).sort((a, b) => {
    // Trier les états numériquement, avec 'halt' à la fin
    if (a === 'halt') return 1;
    if (b === 'halt') return -1;
    return parseInt(a) - parseInt(b);
  });

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* Titre */}
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Règles de transition ({state.machine.rules.length} règles)
      </h3>

      {/* Liste des règles groupées par état */}
      <div className="space-y-6">
        {stateKeys.map(stateKey => {
          const rules = groupedRules[stateKey];
          const stateName = formatState(stateKey);

          return (
            <div key={stateKey} className="border border-gray-200 rounded-lg overflow-hidden">
              {/* En-tête de l'état */}
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                <h4 className="font-medium text-gray-800">
                  {stateName} ({rules.length} règle{rules.length > 1 ? 's' : ''})
                </h4>
              </div>

              {/* Tableau des règles pour cet état */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Symbole lu
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Symbole écrit
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Direction
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nouvel état
                      </th>
                      <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {rules.map((rule, _index) => (
                      <tr 
                        key={`${rule.currentState}-${rule.readSymbol}`}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        {/* Symbole lu */}
                        <td className="px-4 py-3 text-sm font-mono">
                          <span className="inline-flex items-center justify-center w-6 h-6 bg-gray-100 rounded text-gray-700">
                            {formatSymbol(rule.readSymbol)}
                          </span>
                        </td>

                        {/* Symbole écrit */}
                        <td className="px-4 py-3 text-sm font-mono">
                          <span className="inline-flex items-center justify-center w-6 h-6 bg-gray-100 rounded text-gray-700">
                            {formatSymbol(rule.writeSymbol)}
                          </span>
                        </td>

                        {/* Direction */}
                        <td className="px-4 py-3 text-sm text-gray-700">
                          {formatDirection(rule.direction)}
                        </td>

                        {/* Nouvel état */}
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                          {formatState(rule.nextState)}
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => handleDeleteRule(rule)}
                            className="inline-flex items-center justify-center w-8 h-8 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors"
                            title="Supprimer cette règle"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </div>

      {/* Résumé */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <div className="flex items-center justify-between text-sm text-blue-800">
          <span>
            Total: {state.machine.rules.length} règle{state.machine.rules.length > 1 ? 's' : ''} 
            pour {stateKeys.length} état{stateKeys.length > 1 ? 's' : ''}
          </span>
          <span>
            États: {stateKeys.map(key => formatState(key)).join(', ')}
          </span>
        </div>
      </div>
    </div>
  );
}; 
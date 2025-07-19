import React from 'react';
import { ArrowRight, ArrowLeft, Minus } from 'lucide-react';
import type { Rule, State, Symbol } from '../types/turing';

interface VisualRulesProps {
  rules: Rule[];
  currentState?: State;
  nextRule?: Rule;
  className?: string;
}

export const VisualRules: React.FC<VisualRulesProps> = ({ 
  rules, 
  currentState, 
  nextRule,
  className = '' 
}) => {
  
  const formatState = (state: State): string => {
    if (state === 'halt') return '🛑 Arrêt';
    if (state === 0) return '🏠 Départ';
    if (state === 1) return '🔨 Constructeur';
    if (state === 2) return '⚡ Actif';
    if (state === 3) return '🎯 Finisseur';
    return `État ${state}`;
  };

  const formatSymbol = (symbol: Symbol): string => {
    return symbol === 0 ? '⚪' : symbol === 1 ? '🟢' : `${symbol}`;
  };

  const formatDirection = (direction: string): { icon: React.ReactNode; text: string } => {
    switch (direction) {
      case 'L': return { icon: <ArrowLeft className="h-4 w-4" />, text: 'Gauche' };
      case 'R': return { icon: <ArrowRight className="h-4 w-4" />, text: 'Droite' };
      case 'N': return { icon: <Minus className="h-4 w-4" />, text: 'Sur place' };
      default: return { icon: <Minus className="h-4 w-4" />, text: 'Inconnu' };
    }
  };

  const renderRule = (rule: Rule, index: number) => {
    const isActive = nextRule && 
      rule.currentState === nextRule.currentState && 
      rule.readSymbol === nextRule.readSymbol;
    
    const isCurrentStateRule = rule.currentState === currentState;
    const direction = formatDirection(rule.direction);

    return (
      <div 
        key={index}
        className={`
          relative p-4 rounded-lg border-2 transition-all duration-300
          ${isActive 
            ? 'border-yellow-400 bg-yellow-50 shadow-lg transform scale-105' 
            : isCurrentStateRule
              ? 'border-blue-300 bg-blue-50'
              : 'border-gray-200 bg-white'
          }
        `}
      >
        {/* Indicateur de règle active */}
        {isActive && (
          <div className="absolute -top-2 -right-2">
            <div className="bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded-full animate-pulse">
              ▶ Prochaine action
            </div>
          </div>
        )}

        {/* Contenu de la règle */}
        <div className="space-y-3">
          {/* Titre de l'état */}
          <div className={`text-center font-bold text-sm px-3 py-1 rounded-full ${
            isCurrentStateRule ? 'bg-blue-600 text-white' : 'bg-gray-600 text-white'
          }`}>
            {formatState(rule.currentState)}
          </div>

          {/* Condition */}
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="text-xs text-gray-600 mb-1 text-center">Si Castor voit :</div>
            <div className="text-2xl text-center">
              {formatSymbol(rule.readSymbol)}
            </div>
          </div>

          {/* Flèche */}
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full">
              →
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-2">
            {/* Écriture */}
            <div className="bg-green-50 border border-green-200 rounded p-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-green-700">Il écrit :</span>
                <span className="text-lg">{formatSymbol(rule.writeSymbol)}</span>
              </div>
            </div>

            {/* Mouvement */}
            <div className="bg-purple-50 border border-purple-200 rounded p-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-purple-700">Il va :</span>
                <div className="flex items-center space-x-1">
                  {direction.icon}
                  <span className="text-xs">{direction.text}</span>
                </div>
              </div>
            </div>

            {/* Nouvel état */}
            <div className="bg-orange-50 border border-orange-200 rounded p-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-orange-700">Il devient :</span>
                <span className="text-xs font-bold">{formatState(rule.nextState)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Grouper les règles par état
  const rulesByState = rules.reduce((acc, rule) => {
    const state = rule.currentState;
    if (!acc[state]) acc[state] = [];
    acc[state].push(rule);
    return acc;
  }, {} as Record<State, Rule[]>);

  return (
    <div className={`${className}`}>
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-800 mb-2 text-center">
          📋 Manuel d'Instructions du Castor
        </h3>
        <p className="text-sm text-gray-600 text-center">
          Voici comment Castor décide de ses actions selon ce qu'il voit et dans quel mode il est
        </p>
      </div>

      {/* Légende */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h4 className="font-semibold text-blue-800 mb-3">🔑 Comment lire une règle :</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-gray-100 rounded border"></div>
            <span>Condition (ce qu'il voit)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-green-100 rounded border"></div>
            <span>Action (ce qu'il écrit)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-purple-100 rounded border"></div>
            <span>Mouvement</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-orange-100 rounded border"></div>
            <span>Nouveau mode</span>
          </div>
        </div>
      </div>

      {/* Règles par état */}
      <div className="space-y-6">
        {Object.entries(rulesByState).map(([state, stateRules]) => (
          <div key={state}>
            <h4 className="font-semibold text-gray-700 mb-3 flex items-center space-x-2">
              <span className="w-3 h-3 bg-blue-600 rounded-full"></span>
              <span>Quand Castor est en mode {formatState(state as State)} :</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {stateRules.map((rule, index) => renderRule(rule, index))}
            </div>
          </div>
        ))}
      </div>

      {/* Explication contextuelle */}
      {nextRule && (
        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="font-semibold text-yellow-800 mb-2 flex items-center">
            ⚡ Prochaine action de Castor :
          </h4>
          <p className="text-yellow-700">
            En mode <strong>{formatState(nextRule.currentState)}</strong>, il voit{' '}
            <strong>{formatSymbol(nextRule.readSymbol)}</strong>, donc il va écrire{' '}
            <strong>{formatSymbol(nextRule.writeSymbol)}</strong>, aller{' '}
            <strong>{formatDirection(nextRule.direction).text.toLowerCase()}</strong>, et passer en mode{' '}
            <strong>{formatState(nextRule.nextState)}</strong>.
          </p>
        </div>
      )}
    </div>
  );
};
import React from 'react';
import { AlertTriangle, CheckCircle, XCircle, Info } from 'lucide-react';
import type { Rule, State, Symbol } from '../types/turing';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  info: string[];
}

export interface RuleValidatorProps {
  rules: Rule[];
  className?: string;
}

/**
 * Composant qui valide et affiche le statut des règles
 */
export const RuleValidator: React.FC<RuleValidatorProps> = ({ rules, className = '' }) => {
  const validation = validateRules(rules);

  if (validation.errors.length === 0 && validation.warnings.length === 0 && validation.info.length === 0) {
    return null;
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Erreurs */}
      {validation.errors.map((error, index) => (
        <div key={`error-${index}`} className="flex items-start space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <XCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-800">Erreur</p>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      ))}

      {/* Avertissements */}
      {validation.warnings.map((warning, index) => (
        <div key={`warning-${index}`} className="flex items-start space-x-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
          <AlertTriangle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-orange-800">Avertissement</p>
            <p className="text-sm text-orange-700">{warning}</p>
          </div>
        </div>
      ))}

      {/* Informations */}
      {validation.info.map((info, index) => (
        <div key={`info-${index}`} className="flex items-start space-x-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-blue-800">Information</p>
            <p className="text-sm text-blue-700">{info}</p>
          </div>
        </div>
      ))}

      {/* Statut global */}
      {validation.isValid && (
        <div className="flex items-center space-x-2 p-3 bg-green-50 border border-green-200 rounded-lg">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <p className="text-sm font-medium text-green-800">
            ✅ Toutes les règles sont valides !
          </p>
        </div>
      )}
    </div>
  );
};

/**
 * Valide un ensemble de règles de machine de Turing
 */
export function validateRules(rules: Rule[]): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const info: string[] = [];

  if (rules.length === 0) {
    errors.push('Aucune règle définie. La machine ne peut pas fonctionner.');
    return { isValid: false, errors, warnings, info };
  }

  // Collecter tous les états et symboles
  const states = new Set<State>();
  const symbols = new Set<Symbol>();
  const currentStates = new Set<State>();
  const nextStates = new Set<State>();
  const ruleMap = new Map<string, Rule>();

  for (const rule of rules) {
    states.add(rule.currentState);
    states.add(rule.nextState);
    symbols.add(rule.readSymbol);
    symbols.add(rule.writeSymbol);
    currentStates.add(rule.currentState);
    nextStates.add(rule.nextState);

    // Vérifier les règles dupliquées
    const key = `${rule.currentState}:${rule.readSymbol}`;
    if (ruleMap.has(key)) {
      errors.push(`Règle dupliquée: État ${rule.currentState} + Symbole ${rule.readSymbol}`);
    } else {
      ruleMap.set(key, rule);
    }

    // Vérifier la direction
    if (!['L', 'R', 'N'].includes(rule.direction)) {
      errors.push(`Direction invalide "${rule.direction}" dans la règle ${rule.currentState} → ${rule.nextState}`);
    }
  }

  // Détecter les états d'arrêt
  const haltStates = new Set<State>();
  for (const state of nextStates) {
    if (!currentStates.has(state)) {
      haltStates.add(state);
    }
  }

  // Vérifications des états d'arrêt
  if (haltStates.size === 0) {
    errors.push('Aucun état d\'arrêt détecté. La machine pourrait tourner indéfiniment.');
  } else if (haltStates.size === 1) {
    const haltState = Array.from(haltStates)[0];
    info.push(`État d'arrêt détecté: ${haltState}`);
  } else {
    const haltStatesList = Array.from(haltStates).join(', ');
    warnings.push(`Plusieurs états d'arrêt détectés: ${haltStatesList}`);
  }

  // Vérifier la couverture des états
  const activeStates = Array.from(currentStates).filter(state => !haltStates.has(state));
  const symbolArray = Array.from(symbols).filter(s => s === 0 || s === 1);
  
  if (symbolArray.length > 0) {
    for (const state of activeStates) {
      for (const symbol of symbolArray) {
        const key = `${state}:${symbol}`;
        if (!ruleMap.has(key)) {
          warnings.push(`Règle manquante: État ${state} + Symbole ${symbol}`);
        }
      }
    }
  }

  // Vérifier les symboles utilisés
  const validSymbols = symbols.size === 2 && symbols.has(0) && symbols.has(1);
  if (!validSymbols) {
    const symbolList = Array.from(symbols).join(', ');
    warnings.push(`Symboles non-standards détectés: ${symbolList}. Busy Beaver utilise normalement 0 et 1.`);
  }

  // Détecter les boucles potentielles
  const potentialLoops = findPotentialLoops(rules);
  if (potentialLoops.length > 0) {
    warnings.push(`Boucles potentielles détectées dans les états: ${potentialLoops.join(', ')}`);
  }

  // Statistiques
  info.push(`${rules.length} règles, ${activeStates.length} états actifs, ${symbols.size} symboles`);

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    info
  };
}

/**
 * Détecte les boucles potentielles dans les règles
 */
function findPotentialLoops(rules: Rule[]): State[] {
  const loops: State[] = [];
  
  for (const rule of rules) {
    // Boucle simple: l'état pointe vers lui-même
    if (rule.currentState === rule.nextState) {
      loops.push(rule.currentState);
    }
  }

  return Array.from(new Set(loops));
}

/**
 * Vérifie si une règle spécifique est en conflit avec les règles existantes
 */
export function validateSingleRule(rule: Rule, existingRules: Rule[]): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const info: string[] = [];

  // Vérifier les doublons
  const duplicate = existingRules.find(r => 
    r.currentState === rule.currentState && 
    r.readSymbol === rule.readSymbol
  );

  if (duplicate) {
    errors.push(`Cette règle entre en conflit avec une règle existante: ${duplicate.currentState} + ${duplicate.readSymbol} → ${duplicate.writeSymbol} ${duplicate.direction} ${duplicate.nextState}`);
  }

  // Vérifier la direction
  if (!['L', 'R', 'N'].includes(rule.direction)) {
    errors.push(`Direction invalide: "${rule.direction}". Utilisez L (gauche), R (droite) ou N (ne pas bouger).`);
  }

  // Vérifier les symboles
  if (rule.readSymbol !== 0 && rule.readSymbol !== 1) {
    warnings.push(`Symbole de lecture non-standard: ${rule.readSymbol}`);
  }
  if (rule.writeSymbol !== 0 && rule.writeSymbol !== 1) {
    warnings.push(`Symbole d'écriture non-standard: ${rule.writeSymbol}`);
  }

  // Vérifier si c'est une boucle
  if (rule.currentState === rule.nextState) {
    warnings.push('Cette règle crée une boucle (l\'état pointe vers lui-même)');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    info
  };
}
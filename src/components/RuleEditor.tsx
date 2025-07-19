import React, { useState, useEffect } from 'react';
import type { Rule, State, Symbol, Direction } from '../types/turing';
import { useMachineContext } from '../context/MachineContext';

/**
 * Props du composant RuleEditor
 */
interface RuleEditorProps {
  /** Règle existante à éditer (optionnel, pour mode édition) */
  existingRule?: Rule;
  /** Callback appelé lors de l'annulation */
  onCancel?: () => void;
}

/**
 * Composant d'édition de règle de transition
 * Permet de créer ou modifier une règle de la machine de Turing
 */
export const RuleEditor: React.FC<RuleEditorProps> = ({
  existingRule,
  onCancel
}) => {
  const { state, dispatch } = useMachineContext();
  
  // Obtenir les états et symboles disponibles depuis le contexte
  const availableStates: State[] = state.machine ? Array.from(state.machine.alphabet).map((_, i) => i) : [0, 1];
  const availableSymbols: Symbol[] = state.machine ? Array.from(state.machine.alphabet) : [0, 1];
  // État du formulaire
  const [formData, setFormData] = useState<Omit<Rule, 'currentState' | 'readSymbol'>>({
    writeSymbol: existingRule?.writeSymbol ?? 0,
    direction: existingRule?.direction ?? 'R',
    nextState: existingRule?.nextState ?? availableStates[0] ?? 0
  });

  // État actuel et symbole lu (lecture seule en mode édition)
  const [currentState, setCurrentState] = useState<State>(
    existingRule?.currentState ?? availableStates[0] ?? 0
  );
  const [readSymbol, setReadSymbol] = useState<Symbol>(
    existingRule?.readSymbol ?? 0
  );

  // Mode du formulaire (ajout ou édition)
  const isEditMode = !!existingRule;

  // Reset du formulaire après ajout réussi
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    if (isSubmitted && !isEditMode) {
      // Reset du formulaire après ajout
      setFormData({
        writeSymbol: 0,
        direction: 'R',
        nextState: availableStates[0] ?? 0
      });
      setCurrentState(availableStates[0] ?? 0);
      setReadSymbol(0);
      setIsSubmitted(false);
    }
  }, [isSubmitted, isEditMode, availableStates]);

  /**
   * Met à jour une valeur du formulaire
   * @param field Champ à mettre à jour
   * @param value Nouvelle valeur
   */
  const updateField = (field: keyof typeof formData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  /**
   * Valide le formulaire (validation légère)
   * @returns true si le formulaire est valide
   */
  const validateForm = (): boolean => {
    // Validation légère : tous les champs doivent être remplis
    return (
      currentState !== undefined &&
      readSymbol !== undefined &&
      formData.writeSymbol !== undefined &&
      formData.direction !== undefined &&
      formData.nextState !== undefined
    );
  };

  /**
   * Gère la soumission du formulaire
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const rule: Rule = {
      currentState,
      readSymbol,
      writeSymbol: formData.writeSymbol,
      direction: formData.direction,
      nextState: formData.nextState
    };

    if (isEditMode) {
      // Mode édition : remplacer la règle existante
      const updatedRules = state.machine?.rules.map(r => 
        r.currentState === existingRule.currentState && r.readSymbol === existingRule.readSymbol
          ? rule
          : r
      ) ?? [];
      
      dispatch({ type: 'UPDATE_RULES', payload: updatedRules });
    } else {
      // Mode ajout : ajouter la nouvelle règle
      const currentRules = state.machine?.rules ?? [];
      const updatedRules = [...currentRules, rule];
      
      dispatch({ type: 'UPDATE_RULES', payload: updatedRules });
      setIsSubmitted(true);
    }
  };

  /**
   * Gère l'annulation
   */
  const handleCancel = () => {
    onCancel?.();
  };

  // Vérifier si une machine est chargée
  if (!state.machine) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-md">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Éditeur de règles
        </h3>
        <p className="text-gray-600">
          Veuillez d'abord charger une machine pour pouvoir éditer ses règles.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-md">
      {/* Titre */}
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        {isEditMode ? 'Modifier la règle' : 'Ajouter une règle'}
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* État actuel */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            État actuel
          </label>
          <select
            value={currentState}
            onChange={(e) => setCurrentState(e.target.value as State)}
            disabled={isEditMode}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
          >
            {availableStates.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>
        </div>

        {/* Symbole lu */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Symbole lu
          </label>
          <select
            value={readSymbol}
            onChange={(e) => setReadSymbol(e.target.value as Symbol)}
            disabled={isEditMode}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
          >
            {availableSymbols.map((symbol) => (
              <option key={symbol} value={symbol}>
                {symbol}
              </option>
            ))}
          </select>
        </div>

        {/* Symbole à écrire */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Symbole à écrire
          </label>
          <select
            value={formData.writeSymbol}
            onChange={(e) => updateField('writeSymbol', e.target.value as Symbol)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {availableSymbols.map((symbol) => (
              <option key={symbol} value={symbol}>
                {symbol}
              </option>
            ))}
          </select>
        </div>

        {/* Direction */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Direction
          </label>
          <select
            value={formData.direction}
            onChange={(e) => updateField('direction', e.target.value as Direction)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="L">Gauche (L)</option>
            <option value="R">Droite (R)</option>
            <option value="N">Ne pas bouger (N)</option>
          </select>
        </div>

        {/* Nouvel état */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nouvel état
          </label>
          <select
            value={formData.nextState}
            onChange={(e) => updateField('nextState', e.target.value as State)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {availableStates.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>
        </div>

        {/* Aperçu de la règle */}
        <div className="bg-gray-50 p-3 rounded-md">
          <p className="text-sm text-gray-600 mb-1">Aperçu de la règle :</p>
          <p className="font-mono text-sm">
            {currentState} {readSymbol} → {formData.writeSymbol} {formData.direction} {formData.nextState}
          </p>
        </div>

        {/* Boutons d'action */}
        <div className="flex space-x-3 pt-4">
          <button
            type="submit"
            disabled={!validateForm()}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isEditMode ? 'Mettre à jour' : 'Ajouter'}
          </button>
          
          <button
            type="button"
            onClick={handleCancel}
            className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
          >
            Annuler
          </button>
        </div>
      </form>
    </div>
  );
}; 
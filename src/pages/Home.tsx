import React, { useState, useEffect } from 'react';
import { Tape } from '../components/Tape';
import { RuleEditor } from '../components/RuleEditor';
import { RuleList } from '../components/RuleList';
import { Controls } from '../components/Controls';
import { StateTable } from '../components/StateTable';
import { HelpGuide } from '../components/HelpGuide';
import { RuleValidator } from '../components/RuleValidator';
import { TestingSuite } from '../components/TestingSuite';
import { ExampleGallery } from '../components/ExampleGallery';
import { useBusyBeaver } from '../hooks/useBusyBeaver';
import { presetsMap } from '../machines/presets';
import { generateRandomSpec } from '../utils/generator';
import { HelpCircle, Target, Zap } from 'lucide-react';

/**
 * Page principale de l'application
 * Compose tous les composants dans un layout responsive
 */
export const Home: React.FC = () => {
  const { state, loadPreset } = useBusyBeaver();
  const [selectedPreset, setSelectedPreset] = useState<string>('Test Simple');
  const [showRuleEditor, setShowRuleEditor] = useState(false);
  const [showDebugTable, setShowDebugTable] = useState(false);
  const [showHelpGuide, setShowHelpGuide] = useState(false);
  const [showWelcomeMessage, setShowWelcomeMessage] = useState(true);
  const [showTestingSuite, setShowTestingSuite] = useState(false);
  const [showExampleGallery, setShowExampleGallery] = useState(false);

  // Charger automatiquement la machine de test simple au démarrage
  useEffect(() => {
    if (selectedPreset && !state.machine) {
      handlePresetChange(selectedPreset);
    }
  }, []);

  /**
   * Gère le changement de preset
   * @param presetKey Clé du preset sélectionné
   */
  const handlePresetChange = (presetKey: string) => {
    setSelectedPreset(presetKey);

    if (presetKey === 'random') {
      // Générer une machine aléatoire à 3 états
      const randomSpec = generateRandomSpec(3);
      loadPreset({
        name: randomSpec.name,
        description: randomSpec.description,
        rules: randomSpec.predefinedRules || [],
        initialState: 0,
        haltStates: new Set(['halt']),
        alphabet: new Set([0, 1])
      });
    } else if (presetKey && presetsMap[presetKey]) {
      // Charger un preset existant
      const preset = presetsMap[presetKey];
      loadPreset({
        name: preset.name,
        description: preset.description,
        rules: preset.predefinedRules || [],
        initialState: 0,
        haltStates: new Set(['halt']),
        alphabet: new Set([0, 1])
      });
    }
  };

  /**
   * Gère la suppression d'une règle
   */
  const handleRuleDeleted = () => {
    // Optionnel : feedback ou logique supplémentaire
    console.log('Règle supprimée');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* En-tête */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900 mr-3">
                🦫 Busy Beaver Simulator
              </h1>
              <button
                onClick={() => setShowHelpGuide(true)}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                title="Aide et guide d'utilisation"
              >
                <HelpCircle size={20} />
              </button>
            </div>
            
            {/* Sélecteur de preset */}
            <div className="flex items-center space-x-4">
              <label htmlFor="preset-select" className="text-sm font-medium text-gray-700">
                Machine:
              </label>
              <select
                id="preset-select"
                value={selectedPreset}
                onChange={(e) => handlePresetChange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Choisir une machine...</option>
                <optgroup label="Presets classiques">
                  {Object.entries(presetsMap).map(([key, preset]) => (
                    <option key={key} value={key}>
                      {preset.name}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Génération">
                  <option value="random">Machine aléatoire (3 états)</option>
                </optgroup>
              </select>
            </div>
          </div>
        </div>
      </header>

      {/* Contenu principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Message de bienvenue */}
        {showWelcomeMessage && state.machine && (
          <div className="mb-6 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <Target className="h-6 w-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-blue-900 mb-2">
                    🎯 Prêt à explorer les machines Busy Beaver !
                  </h3>
                  <p className="text-blue-800 mb-4">
                    Une machine <strong>"{state.machine.name}"</strong> est déjà chargée. 
                    Utilisez les boutons ci-dessous pour commencer :
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <div className="flex items-center space-x-2 bg-white px-3 py-1 rounded-full border border-blue-200">
                      <Zap className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium">Step</span>
                      <span className="text-xs text-gray-600">= 1 étape</span>
                    </div>
                    <div className="flex items-center space-x-2 bg-white px-3 py-1 rounded-full border border-blue-200">
                      <Zap className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium">Run</span>
                      <span className="text-xs text-gray-600">= exécution automatique</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowHelpGuide(true)}
                    className="text-sm text-blue-700 hover:text-blue-800 underline"
                  >
                    📖 Voir le guide complet
                  </button>
                </div>
              </div>
              <button
                onClick={() => setShowWelcomeMessage(false)}
                className="flex-shrink-0 p-1 text-blue-600 hover:text-blue-800 transition-colors"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Grille responsive */}
        <div className="md:grid md:grid-cols-[auto,1fr] md:gap-6 space-y-6 md:space-y-0">
          
          {/* Colonne 1 : Contrôles et édition */}
          <div className="space-y-6">
            {/* Contrôles */}
            <Controls />

            {/* Éditeur de règles */}
            <div className="bg-white rounded-lg shadow-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  Éditeur de règles
                </h3>
                <button
                  onClick={() => setShowRuleEditor(!showRuleEditor)}
                  className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
                >
                  {showRuleEditor ? 'Masquer' : 'Afficher'}
                </button>
              </div>
              
              {showRuleEditor && (
                <RuleEditor onCancel={() => setShowRuleEditor(false)} />
              )}
            </div>

            {/* Liste des règles */}
            <RuleList onRuleDelete={handleRuleDeleted} />

            {/* Validation des règles */}
            {state.machine && state.machine.rules.length > 0 && (
              <div className="bg-white rounded-lg shadow-lg p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  ✅ Validation des règles
                </h3>
                <RuleValidator rules={state.machine.rules} />
              </div>
            )}
          </div>

          {/* Colonne 2 : Visualisation et debug */}
          <div className="space-y-6">
            {/* Bande de la machine */}
            {state.currentState && (
              <Tape
                tape={state.currentState.tape}
                headPosition={state.currentState.tape.headPosition}
                visibleCells={15}
                showPositions={true}
              />
            )}


            {/* Table de debug */}
            <div className="bg-white rounded-lg shadow-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  Debug et monitoring
                </h3>
                <button
                  onClick={() => setShowDebugTable(!showDebugTable)}
                  className="px-3 py-1 bg-gray-600 text-white text-sm rounded-md hover:bg-gray-700 transition-colors"
                >
                  {showDebugTable ? 'Masquer' : 'Afficher'}
                </button>
              </div>
              
              {showDebugTable && (
                <StateTable 
                  visible={true}
                  maxEntries={50}
                  showTapeDetails={true}
                />
              )}
            </div>

            {/* Suite de tests */}
            <div className="bg-white rounded-lg shadow-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  🧪 Tests automatiques
                </h3>
                <button
                  onClick={() => setShowTestingSuite(!showTestingSuite)}
                  className="px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors"
                >
                  {showTestingSuite ? 'Masquer' : 'Afficher'}
                </button>
              </div>
              
              {showTestingSuite && <TestingSuite />}
            </div>

            {/* Galerie d'exemples éducatifs */}
            <div className="bg-white rounded-lg shadow-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  📚 Exemples éducatifs
                </h3>
                <button
                  onClick={() => setShowExampleGallery(!showExampleGallery)}
                  className="px-3 py-1 bg-purple-600 text-white text-sm rounded-md hover:bg-purple-700 transition-colors"
                >
                  {showExampleGallery ? 'Masquer' : 'Afficher'}
                </button>
              </div>
              
              {showExampleGallery && <ExampleGallery />}
            </div>
          </div>
        </div>

        {/* Informations sur la machine actuelle */}
        {state.machine && (
          <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Informations sur la machine
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Machine</h4>
                <p className="text-gray-900">{state.machine.name}</p>
                {state.machine.description && (
                  <p className="text-sm text-gray-600 mt-1">
                    {state.machine.description}
                  </p>
                )}
              </div>
              
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Configuration</h4>
                <p className="text-gray-900">
                  {state.machine.rules.length} règles, {state.machine.alphabet.size} symboles
                </p>
                <p className="text-sm text-gray-600">
                  État initial: {state.machine.initialState}
                </p>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-700 mb-2">État actuel</h4>
                <p className="text-gray-900">
                  {state.currentState?.isHalted 
                    ? `Arrêté (${state.currentState.haltState})`
                    : `En cours (${state.currentState?.currentState})`
                  }
                </p>
                <p className="text-sm text-gray-600">
                  {state.currentState?.stepCount ?? 0} étapes exécutées
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Message si aucune machine chargée */}
        {!state.machine && (
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  Aucune machine chargée
                </h3>
                <p className="text-sm text-blue-700 mt-1">
                  Sélectionnez une machine dans le menu déroulant ci-dessus pour commencer.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Guide d'aide */}
        <HelpGuide 
          isOpen={showHelpGuide} 
          onClose={() => setShowHelpGuide(false)} 
        />
      </main>
    </div>
  );
}; 
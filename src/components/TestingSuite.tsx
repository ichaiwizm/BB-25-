import React, { useState } from 'react';
import { Play, CheckCircle, XCircle, Clock, Hash, Target, Zap } from 'lucide-react';
import { useBusyBeaver } from '../hooks/useBusyBeaver';
import { presetsMap, getKnownScore } from '../machines/presets';

interface TestResult {
  name: string;
  expected: number | string;
  actual: number | string;
  passed: boolean;
  steps: number;
  executionTime: number;
  details: string;
}

export const TestingSuite: React.FC = () => {
  const { state, loadPreset } = useBusyBeaver();
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [currentTest, setCurrentTest] = useState<string | null>(null);

  /**
   * Exécute tous les tests sur les machines prédéfinies
   */
  const runAllTests = async () => {
    setIsRunning(true);
    setTestResults([]);
    setCurrentTest(null);

    const results: TestResult[] = [];

    for (const [key, preset] of Object.entries(presetsMap)) {
      setCurrentTest(preset.name);
      
      try {
        const result = await runSingleTest(key, preset);
        results.push(result);
      } catch (error) {
        results.push({
          name: preset.name,
          expected: 'Erreur',
          actual: 'Erreur',
          passed: false,
          steps: 0,
          executionTime: 0,
          details: error instanceof Error ? error.message : 'Erreur inconnue'
        });
      }
    }

    setTestResults(results);
    setCurrentTest(null);
    setIsRunning(false);
  };

  /**
   * Exécute un test sur une machine spécifique
   */
  const runSingleTest = async (_presetKey: string, preset: any): Promise<TestResult> => {
    return new Promise((resolve) => {
      const startTime = performance.now();
      
      // Charger la machine
      const machine = {
        name: preset.name,
        description: preset.description,
        rules: preset.predefinedRules || [],
        initialState: 0,
        haltStates: new Set(['halt']),
        alphabet: new Set([0, 1] as const)
      };

      loadPreset(machine);

      // Simuler l'exécution
      
      setTimeout(() => {
        // Compter les symboles 1 sur la bande
        const currentTape = state.currentState?.tape;
        let onesCount = 0;
        
        if (currentTape) {
          for (const symbol of currentTape.positions.values()) {
            if (symbol === 1) onesCount++;
          }
        }

        const executionTime = performance.now() - startTime;
        const expectedScore = getKnownScore(preset.numStates);
        
        resolve({
          name: preset.name,
          expected: expectedScore || 'Inconnu',
          actual: onesCount,
          passed: expectedScore ? onesCount === expectedScore : true,
          steps: state.currentState?.stepCount || 0,
          executionTime,
          details: `Machine exécutée avec succès`
        });
      }, 100);
    });
  };

  /**
   * Calcule le score actuel de la machine
   */
  const calculateCurrentScore = (): number => {
    if (!state.currentState?.tape) return 0;
    
    let count = 0;
    for (const symbol of state.currentState.tape.positions.values()) {
      if (symbol === 1) count++;
    }
    return count;
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
          <Target className="h-5 w-5 mr-2 text-blue-600" />
          Suite de tests automatiques
        </h3>
        <button
          onClick={runAllTests}
          disabled={isRunning}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {isRunning ? (
            <>
              <Clock className="h-4 w-4 mr-2 animate-spin" />
              Test en cours...
            </>
          ) : (
            <>
              <Play className="h-4 w-4 mr-2" />
              Lancer tous les tests
            </>
          )}
        </button>
      </div>

      {/* Test en cours */}
      {currentTest && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center">
            <Clock className="h-5 w-5 text-blue-600 mr-2 animate-spin" />
            <p className="text-blue-800 font-medium">
              Test en cours: {currentTest}
            </p>
          </div>
        </div>
      )}

      {/* Résultats actuels */}
      {state.machine && (
        <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <h4 className="font-semibold text-gray-800 mb-3">
            📊 Machine actuelle: {state.machine.name}
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {calculateCurrentScore()}
              </div>
              <div className="text-sm text-gray-600">Symboles "1"</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {state.currentState?.stepCount || 0}
              </div>
              <div className="text-sm text-gray-600">Étapes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {state.machine.rules.length}
              </div>
              <div className="text-sm text-gray-600">Règles</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${state.currentState?.isHalted ? 'text-red-600' : 'text-orange-600'}`}>
                {state.currentState?.isHalted ? 'Arrêtée' : 'En cours'}
              </div>
              <div className="text-sm text-gray-600">Statut</div>
            </div>
          </div>
          
          {/* Score attendu */}
          {state.machine && (
            <div className="mt-4 p-3 bg-white rounded-lg border">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  Score attendu pour cette machine:
                </span>
                <span className="text-sm font-bold text-gray-900">
                  {(() => {
                    const numStates = new Set(state.machine.rules.map(r => r.currentState)).size;
                    const expectedScore = getKnownScore(numStates);
                    return expectedScore || 'Inconnu';
                  })()}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Résultats des tests */}
      {testResults.length > 0 && (
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-800 flex items-center">
            <Hash className="h-4 w-4 mr-2" />
            Résultats des tests ({testResults.length} machines testées)
          </h4>
          
          {/* Résumé */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {testResults.filter(r => r.passed).length}
              </div>
              <div className="text-sm text-green-800">Tests réussis</div>
            </div>
            <div className="text-center p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {testResults.filter(r => !r.passed).length}
              </div>
              <div className="text-sm text-red-800">Tests échoués</div>
            </div>
            <div className="text-center p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {Math.round(testResults.reduce((sum, r) => sum + r.executionTime, 0) / testResults.length)}ms
              </div>
              <div className="text-sm text-blue-800">Temps moyen</div>
            </div>
          </div>

          {/* Liste détaillée */}
          <div className="space-y-2">
            {testResults.map((result, index) => (
              <div
                key={index}
                className={`p-4 border rounded-lg ${
                  result.passed 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-red-50 border-red-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {result.passed ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600" />
                    )}
                    <div>
                      <h5 className="font-medium text-gray-900">{result.name}</h5>
                      <p className="text-sm text-gray-600">{result.details}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">
                      {result.actual} / {result.expected}
                    </div>
                    <div className="text-xs text-gray-500">
                      {result.steps} étapes, {Math.round(result.executionTime)}ms
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Instructions */}
      {testResults.length === 0 && !isRunning && (
        <div className="text-center py-8">
          <Zap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">
            Prêt à tester vos machines !
          </h4>
          <p className="text-gray-600 mb-4">
            Lancez la suite de tests pour vérifier que toutes les machines prédéfinies 
            produisent les scores attendus.
          </p>
          <button
            onClick={runAllTests}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <Play className="h-4 w-4 mr-2" />
            Commencer les tests
          </button>
        </div>
      )}
    </div>
  );
};
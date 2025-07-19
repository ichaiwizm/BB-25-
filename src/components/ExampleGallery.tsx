import React, { useState } from 'react';
import { BookOpen, Play, Target, Brain, Lightbulb, ChevronRight } from 'lucide-react';
import { useBusyBeaver } from '../hooks/useBusyBeaver';
import { presetsMap } from '../machines/presets';

interface Example {
  id: string;
  title: string;
  description: string;
  difficulty: 'Débutant' | 'Intermédiaire' | 'Avancé';
  presetKey: string;
  learningGoals: string[];
  steps: string[];
  expectedResult: {
    score: number;
    steps: number;
    behavior: string;
  };
}

const examples: Example[] = [
  {
    id: 'simple-test',
    title: '🟢 Premier pas avec les machines',
    description: 'Découvrez comment fonctionne une machine de Turing très simple qui s\'arrête rapidement.',
    difficulty: 'Débutant',
    presetKey: 'Test Simple',
    learningGoals: [
      'Comprendre ce qu\'est une règle',
      'Observer le mouvement de la tête',
      'Voir comment une machine s\'arrête'
    ],
    steps: [
      'Chargez la machine "Test Simple"',
      'Cliquez sur "Step" pour avancer étape par étape',
      'Observez comment la tête écrit un "1" et s\'arrête',
      'Notez le score final : 1 symbole "1"'
    ],
    expectedResult: {
      score: 1,
      steps: 1,
      behavior: 'Écrit un seul "1" et s\'arrête immédiatement'
    }
  },
  {
    id: 'busy-beaver-2',
    title: '🔵 Le champion à 2 états',
    description: 'Explorez la machine Busy Beaver à 2 états qui détient le record officiel.',
    difficulty: 'Débutant',
    presetKey: '2-États',
    learningGoals: [
      'Comprendre la notion de "record"',
      'Observer des mouvements plus complexes',
      'Analyser l\'efficacité d\'une machine'
    ],
    steps: [
      'Chargez la machine "Busy Beaver 2 états"',
      'Utilisez "Run" pour l\'exécution automatique',
      'Observez les mouvements gauche-droite',
      'Comptez les symboles "1" à la fin : exactement 4'
    ],
    expectedResult: {
      score: 4,
      steps: 6,
      behavior: 'Produit exactement 4 symboles "1" en 6 étapes'
    }
  },
  {
    id: 'busy-beaver-3',
    title: '🟡 Complexité croissante',
    description: 'Analysez une machine plus sophistiquée qui produit 6 symboles "1".',
    difficulty: 'Intermédiaire',
    presetKey: '3-États',
    learningGoals: [
      'Observer des comportements plus complexes',
      'Comprendre l\'impact du nombre d\'états',
      'Analyser des patterns de mouvement'
    ],
    steps: [
      'Chargez la machine "Busy Beaver 3 états"',
      'Observez les 3 états différents (q0, q1, q2)',
      'Notez les boucles et les patterns',
      'Vérifiez le score final : 6 symboles "1"'
    ],
    expectedResult: {
      score: 6,
      steps: 14,
      behavior: 'Crée des patterns complexes avant de s\'arrêter'
    }
  },
  {
    id: 'busy-beaver-4',
    title: '🔴 Performance extrême',
    description: 'Testez une machine très performante qui produit 13 symboles "1".',
    difficulty: 'Avancé',
    presetKey: '4-États',
    learningGoals: [
      'Comprendre l\'explosion combinatoire',
      'Observer des comportements très complexes',
      'Apprécier l\'optimisation algorithmique'
    ],
    steps: [
      'Chargez la machine "Busy Beaver 4 états"',
      'Utilisez les outils de debug pour suivre l\'exécution',
      'Observez la complexité des patterns créés',
      'Admirez le résultat final : 13 symboles "1"'
    ],
    expectedResult: {
      score: 13,
      steps: 107,
      behavior: 'Comportement très complexe avec de nombreuses boucles'
    }
  }
];

export const ExampleGallery: React.FC = () => {
  const { loadPreset } = useBusyBeaver();
  const [selectedExample, setSelectedExample] = useState<Example | null>(null);

  const loadExample = (example: Example) => {
    const preset = presetsMap[example.presetKey];
    if (preset) {
      loadPreset({
        name: preset.name,
        description: preset.description,
        rules: preset.predefinedRules || [],
        initialState: 0,
        haltStates: new Set(['halt']),
        alphabet: new Set([0, 1])
      });
      setSelectedExample(example);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Débutant': return 'bg-green-100 text-green-800 border-green-200';
      case 'Intermédiaire': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Avancé': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
          <BookOpen className="h-5 w-5 mr-2 text-blue-600" />
          Galerie d'exemples éducatifs
        </h3>
      </div>

      {/* Liste des exemples */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {examples.map((example) => (
          <div
            key={example.id}
            className={`border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
              selectedExample?.id === example.id 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => setSelectedExample(example)}
          >
            <div className="flex items-start justify-between mb-3">
              <h4 className="font-semibold text-gray-800 text-sm">{example.title}</h4>
              <span className={`px-2 py-1 text-xs rounded-full border ${getDifficultyColor(example.difficulty)}`}>
                {example.difficulty}
              </span>
            </div>
            
            <p className="text-sm text-gray-600 mb-3">{example.description}</p>
            
            <div className="flex items-center justify-between">
              <div className="text-xs text-gray-500">
                Score attendu: <span className="font-bold">{example.expectedResult.score}</span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  loadExample(example);
                }}
                className="inline-flex items-center px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
              >
                <Play size={12} className="mr-1" />
                Charger
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Détails de l'exemple sélectionné */}
      {selectedExample && (
        <div className="border-t pt-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h4 className="text-lg font-semibold text-blue-900 mb-2">
                  {selectedExample.title}
                </h4>
                <p className="text-blue-800">{selectedExample.description}</p>
              </div>
              <span className={`px-3 py-1 text-sm rounded-full border ${getDifficultyColor(selectedExample.difficulty)}`}>
                {selectedExample.difficulty}
              </span>
            </div>

            {/* Objectifs d'apprentissage */}
            <div className="mb-6">
              <h5 className="font-semibold text-blue-900 mb-3 flex items-center">
                <Target className="h-4 w-4 mr-2" />
                Objectifs d'apprentissage
              </h5>
              <ul className="space-y-2">
                {selectedExample.learningGoals.map((goal, index) => (
                  <li key={index} className="flex items-start space-x-2 text-sm text-blue-800">
                    <ChevronRight className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    <span>{goal}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Étapes à suivre */}
            <div className="mb-6">
              <h5 className="font-semibold text-blue-900 mb-3 flex items-center">
                <Lightbulb className="h-4 w-4 mr-2" />
                Étapes à suivre
              </h5>
              <ol className="space-y-2">
                {selectedExample.steps.map((step, index) => (
                  <li key={index} className="flex items-start space-x-3 text-sm text-blue-800">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full text-xs flex items-center justify-center font-bold">
                      {index + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* Résultat attendu */}
            <div className="bg-white border border-blue-200 rounded-lg p-4">
              <h5 className="font-semibold text-blue-900 mb-3 flex items-center">
                <Brain className="h-4 w-4 mr-2" />
                Résultat attendu
              </h5>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{selectedExample.expectedResult.score}</div>
                  <div className="text-gray-600">Symboles "1"</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{selectedExample.expectedResult.steps}</div>
                  <div className="text-gray-600">Étapes</div>
                </div>
                <div className="text-center md:col-span-1">
                  <div className="text-sm text-gray-700 italic">
                    "{selectedExample.expectedResult.behavior}"
                  </div>
                </div>
              </div>
            </div>

            {/* Action */}
            <div className="mt-6 text-center">
              <button
                onClick={() => loadExample(selectedExample)}
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Play className="h-5 w-5 mr-2" />
                Charger et commencer l'exploration
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Message d'encouragement */}
      {!selectedExample && (
        <div className="text-center py-8">
          <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">
            Explorez les machines Busy Beaver !
          </h4>
          <p className="text-gray-600 mb-4">
            Sélectionnez un exemple ci-dessus pour commencer votre apprentissage 
            avec des machines de complexité croissante.
          </p>
        </div>
      )}
    </div>
  );
};
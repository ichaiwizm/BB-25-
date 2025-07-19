import React, { useState } from 'react';
import { X, ChevronRight, ChevronDown, Play, StepForward, RotateCcw } from 'lucide-react';

interface HelpGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpGuide: React.FC<HelpGuideProps> = ({ isOpen, onClose }) => {
  const [expandedSection, setExpandedSection] = useState<string | null>('basics');

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-800">
            🦫 Guide du Simulateur Busy Beaver
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Section 1: Qu'est-ce que le Busy Beaver ? */}
          <div className="border rounded-lg">
            <button
              onClick={() => toggleSection('basics')}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
            >
              <h3 className="text-lg font-semibold text-gray-800">
                🤖 Qu'est-ce que le Busy Beaver ?
              </h3>
              {expandedSection === 'basics' ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
            </button>
            {expandedSection === 'basics' && (
              <div className="p-4 border-t bg-gray-50">
                <p className="text-gray-700 mb-4">
                  Le <strong>Busy Beaver</strong> est un problème célèbre en informatique théorique qui cherche
                  la machine de Turing qui écrit le maximum de symboles "1" sur une bande avant de s'arrêter.
                </p>
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Exemple :</strong> Une machine à 2 états peut écrire au maximum 4 symboles "1" 
                    avant de s'arrêter. C'est le record pour 2 états !
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Section 2: Comment utiliser le simulateur */}
          <div className="border rounded-lg">
            <button
              onClick={() => toggleSection('howto')}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
            >
              <h3 className="text-lg font-semibold text-gray-800">
                🎯 Comment utiliser le simulateur
              </h3>
              {expandedSection === 'howto' ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
            </button>
            {expandedSection === 'howto' && (
              <div className="p-4 border-t bg-gray-50 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-lg border">
                    <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
                      <StepForward size={18} className="mr-2 text-blue-600" />
                      1. Choisir une machine
                    </h4>
                    <p className="text-sm text-gray-600">
                      Sélectionnez une machine prédéfinie dans le menu déroulant ou créez la vôtre.
                    </p>
                  </div>
                  <div className="bg-white p-4 rounded-lg border">
                    <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
                      <Play size={18} className="mr-2 text-green-600" />
                      2. Exécuter
                    </h4>
                    <p className="text-sm text-gray-600">
                      Utilisez "Step" pour avancer étape par étape ou "Run" pour l'exécution automatique.
                    </p>
                  </div>
                  <div className="bg-white p-4 rounded-lg border">
                    <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
                      <RotateCcw size={18} className="mr-2 text-orange-600" />
                      3. Observer
                    </h4>
                    <p className="text-sm text-gray-600">
                      Regardez la bande changer et comptez les symboles "1" produits.
                    </p>
                  </div>
                  <div className="bg-white p-4 rounded-lg border">
                    <h4 className="font-semibold text-gray-800 mb-2">
                      🔧 4. Expérimenter
                    </h4>
                    <p className="text-sm text-gray-600">
                      Modifiez les règles pour créer votre propre machine Busy Beaver.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Section 3: Comprendre les règles */}
          <div className="border rounded-lg">
            <button
              onClick={() => toggleSection('rules')}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
            >
              <h3 className="text-lg font-semibold text-gray-800">
                📋 Comprendre les règles
              </h3>
              {expandedSection === 'rules' ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
            </button>
            {expandedSection === 'rules' && (
              <div className="p-4 border-t bg-gray-50">
                <p className="text-gray-700 mb-4">
                  Chaque règle définit ce que fait la machine dans une situation donnée :
                </p>
                <div className="bg-white p-4 rounded-lg border">
                  <div className="grid grid-cols-5 gap-2 text-sm font-medium text-gray-600 mb-2">
                    <div>État actuel</div>
                    <div>Symbole lu</div>
                    <div>Symbole écrit</div>
                    <div>Direction</div>
                    <div>Nouvel état</div>
                  </div>
                  <div className="grid grid-cols-5 gap-2 text-sm bg-blue-50 p-2 rounded">
                    <div className="font-mono">q0</div>
                    <div className="font-mono">0</div>
                    <div className="font-mono">1</div>
                    <div className="font-mono">R</div>
                    <div className="font-mono">q1</div>
                  </div>
                  <p className="text-xs text-gray-600 mt-2">
                    <strong>Signification :</strong> Si dans l'état q0 on lit un 0, alors écrire 1, 
                    aller à droite (R), et passer à l'état q1.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Section 4: Machines prédéfinies */}
          <div className="border rounded-lg">
            <button
              onClick={() => toggleSection('presets')}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
            >
              <h3 className="text-lg font-semibold text-gray-800">
                🏆 Machines prédéfinies
              </h3>
              {expandedSection === 'presets' ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
            </button>
            {expandedSection === 'presets' && (
              <div className="p-4 border-t bg-gray-50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-lg border">
                    <h4 className="font-semibold text-green-600 mb-2">Test Simple</h4>
                    <p className="text-sm text-gray-600 mb-2">
                      Machine très simple qui s'arrête rapidement. Parfaite pour comprendre le fonctionnement.
                    </p>
                    <div className="text-xs text-gray-500">Score : 2 symboles "1"</div>
                  </div>
                  <div className="bg-white p-4 rounded-lg border">
                    <h4 className="font-semibold text-blue-600 mb-2">Busy Beaver 2 états</h4>
                    <p className="text-sm text-gray-600 mb-2">
                      Le champion officiel à 2 états. Écrit exactement 4 symboles "1".
                    </p>
                    <div className="text-xs text-gray-500">Score : 4 symboles "1"</div>
                  </div>
                  <div className="bg-white p-4 rounded-lg border">
                    <h4 className="font-semibold text-purple-600 mb-2">Busy Beaver 3 états</h4>
                    <p className="text-sm text-gray-600 mb-2">
                      Plus complexe, produit 6 symboles "1" avant de s'arrêter.
                    </p>
                    <div className="text-xs text-gray-500">Score : 6 symboles "1"</div>
                  </div>
                  <div className="bg-white p-4 rounded-lg border">
                    <h4 className="font-semibold text-red-600 mb-2">Busy Beaver 4 états</h4>
                    <p className="text-sm text-gray-600 mb-2">
                      Machine très performante qui produit 13 symboles "1".
                    </p>
                    <div className="text-xs text-gray-500">Score : 13 symboles "1"</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Section 5: Conseils pour tester */}
          <div className="border rounded-lg">
            <button
              onClick={() => toggleSection('testing')}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
            >
              <h3 className="text-lg font-semibold text-gray-800">
                🧪 Conseils pour tester
              </h3>
              {expandedSection === 'testing' ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
            </button>
            {expandedSection === 'testing' && (
              <div className="p-4 border-t bg-gray-50">
                <div className="space-y-3">
                  <div className="bg-green-50 p-3 rounded-lg">
                    <h4 className="font-semibold text-green-800 mb-1">✅ Commencez simple</h4>
                    <p className="text-sm text-green-700">
                      Utilisez d'abord la "Machine de test simple" pour comprendre le fonctionnement.
                    </p>
                  </div>
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <h4 className="font-semibold text-blue-800 mb-1">⚡ Utilisez "Step" pour débugger</h4>
                    <p className="text-sm text-blue-700">
                      Le bouton "Step" vous permet d'avancer étape par étape pour comprendre chaque transition.
                    </p>
                  </div>
                  <div className="bg-purple-50 p-3 rounded-lg">
                    <h4 className="font-semibold text-purple-800 mb-1">🎯 Comptez les symboles "1"</h4>
                    <p className="text-sm text-purple-700">
                      Le but est de maximiser le nombre de symboles "1" sur la bande finale.
                    </p>
                  </div>
                  <div className="bg-orange-50 p-3 rounded-lg">
                    <h4 className="font-semibold text-orange-800 mb-1">🔄 Testez différentes vitesses</h4>
                    <p className="text-sm text-orange-700">
                      Utilisez le slider de vitesse pour ralentir ou accélérer l'exécution selon vos besoins.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              💡 Astuce : Commencez par la "Machine de test simple" pour vous familiariser !
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Commencer !
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
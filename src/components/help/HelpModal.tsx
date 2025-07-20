import React from 'react';
import { Activity, Target, BarChart3, MessageSquare, Play, Cpu, X } from 'lucide-react';
import '../../styles/design-system.css';

interface HelpModalProps {
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ onClose }) => {
  return (
    <div className="card-content">
      {/* Header */}
      <div className="flex items-center justify-between mb-5 pb-4" style={{ borderBottom: '1px solid var(--color-border-light)' }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <Cpu className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-primary">Machine Busy Beaver</h2>
            <p className="text-xs text-secondary">Concept informatique fascinant</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="btn btn-ghost" style={{ padding: '6px' }}
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      <div className="space-y-4 max-h-[60vh] overflow-y-auto">
        
        {/* Introduction */}
        <div className="bg-surface border rounded-md p-4">
          <h3 className="text-sm font-semibold text-primary mb-2 flex items-center">
            <div className="w-5 h-5 bg-primary rounded-full mr-2 flex items-center justify-center">
              <span className="text-white text-xs font-bold">?</span>
            </div>
            Le Problème Busy Beaver
          </h3>
          <p className="text-xs text-secondary leading-relaxed">
            Les <strong>machines Busy Beaver</strong> cherchent à produire le maximum de symboles "1" 
            avant de s'arrêter. Un des défis les plus fascinants de l'informatique théorique.
          </p>
        </div>

        {/* Machine de Turing */}
        <div>
          <h3 className="text-sm font-semibold text-primary mb-2 flex items-center">
            <Activity className="w-4 h-4 text-success mr-2" />
            Machine de Turing
          </h3>
          <div className="bg-surface rounded-md p-3">
            <p className="text-xs text-secondary mb-2">Modèle de calcul comprenant :</p>
            <ul className="text-xs text-secondary space-y-1 ml-3" style={{ listStyle: 'disc' }}>
              <li>Bande infinie avec symboles (0 ou 1)</li>
              <li>Tête de lecture/écriture mobile</li>
              <li>États internes (A, B, C, etc.)</li>
              <li>Règles de transition</li>
            </ul>
          </div>
        </div>

        {/* Le Défi Busy Beaver */}
        <div>
          <h3 className="text-lg font-semibold text-slate-800 mb-3 flex items-center">
            <Target className="w-5 h-5 text-red-600 mr-2" />
            Le Défi du Busy Beaver
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-red-50 rounded-lg p-4">
              <h4 className="font-semibold text-red-800 mb-2">Objectif</h4>
              <p className="text-red-700 text-sm">
                Trouver la machine de Turing à <strong>n états</strong> qui écrit le plus de "1" possible 
                avant de s'arrêter naturellement.
              </p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <h4 className="font-semibold text-green-800 mb-2">Contraintes</h4>
              <p className="text-green-700 text-sm">
                La machine doit <strong>s'arrêter</strong> d'elle-même (pas de boucle infinie) 
                et utiliser seulement les symboles 0 et 1.
              </p>
            </div>
          </div>
        </div>

        {/* Résultats Connus */}
        <div>
          <h3 className="text-lg font-semibold text-slate-800 mb-3 flex items-center">
            <BarChart3 className="w-5 h-5 text-purple-600 mr-2" />
            Résultats Connus
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full bg-white rounded-lg shadow-sm border border-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-slate-700 font-semibold">Machine</th>
                  <th className="px-4 py-3 text-left text-slate-700 font-semibold">États</th>
                  <th className="px-4 py-3 text-left text-slate-700 font-semibold">Score (1s)</th>
                  <th className="px-4 py-3 text-left text-slate-700 font-semibold">Étapes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <tr>
                  <td className="px-4 py-3 font-mono text-blue-600">Σ(1)</td>
                  <td className="px-4 py-3">1</td>
                  <td className="px-4 py-3 font-semibold">1</td>
                  <td className="px-4 py-3">1</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-mono text-blue-600">Σ(2)</td>
                  <td className="px-4 py-3">2</td>
                  <td className="px-4 py-3 font-semibold">4</td>
                  <td className="px-4 py-3">6</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-mono text-blue-600">Σ(3)</td>
                  <td className="px-4 py-3">3</td>
                  <td className="px-4 py-3 font-semibold">6</td>
                  <td className="px-4 py-3">14</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-mono text-blue-600">Σ(4)</td>
                  <td className="px-4 py-3">4</td>
                  <td className="px-4 py-3 font-semibold">13</td>
                  <td className="px-4 py-3">107</td>
                </tr>
                <tr className="bg-yellow-50">
                  <td className="px-4 py-3 font-mono text-blue-600">Σ(5)</td>
                  <td className="px-4 py-3">5</td>
                  <td className="px-4 py-3 font-semibold">4 098</td>
                  <td className="px-4 py-3">47 millions+</td>
                </tr>
                <tr className="bg-red-50 border-2 border-red-300">
                  <td className="px-4 py-3 font-mono text-red-600 font-bold">Σ(6) ⚠️</td>
                  <td className="px-4 py-3">6</td>
                  <td className="px-4 py-3 font-semibold text-red-700">???</td>
                  <td className="px-4 py-3 text-red-700 font-bold">&gt; 10↑↑11M</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            💡 La complexité explose rapidement ! Σ(6) reste un mystère non-résolu.
          </p>
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-xs text-red-700 font-medium">
              🚨 <strong>Σ(6) EXPÉRIMENTAL:</strong> Meilleur candidat actuel (juillet 2025). 
              NON-PROUVÉ ! Pourrait ne jamais s'arrêter. Estimation temporelle: 
              plus que l'âge de l'Univers × googolplex.
            </p>
          </div>
        </div>

        {/* Pourquoi c'est fascinant */}
        <div>
          <h3 className="text-lg font-semibold text-slate-800 mb-3 flex items-center">
            <MessageSquare className="w-5 h-5 text-orange-600 mr-2" />
            Pourquoi c'est fascinant ?
          </h3>
          <div className="bg-orange-50 rounded-lg p-4 space-y-3">
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-semibold text-orange-800 mb-2">🧠 Liens avec l'intelligence</h4>
                <p className="text-orange-700">
                  Ces machines montrent comment des règles simples peuvent créer des comportements complexes, 
                  similaires aux processus de pensée.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-orange-800 mb-2">🚀 Limites du calcul</h4>
                <p className="text-orange-700">
                  Le problème touche aux limites fondamentales de ce qui peut être calculé et prouvé mathématiquement.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-orange-800 mb-2">💡 Créativité computationnelle</h4>
                <p className="text-orange-700">
                  Trouver de nouvelles machines Busy Beaver nécessite souvent des insights créatifs inattendus.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-orange-800 mb-2">🔬 Recherche active</h4>
                <p className="text-orange-700">
                  Des chercheurs du monde entier collaborent encore aujourd'hui pour résoudre Σ(6) et au-delà.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Utilisation du Simulateur */}
        <div>
          <h3 className="text-lg font-semibold text-slate-800 mb-3 flex items-center">
            <Play className="w-5 h-5 text-blue-600 mr-2" />
            Utiliser ce Simulateur
          </h3>
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-semibold text-blue-800 mb-2">🎮 Contrôles</h4>
                <ul className="text-blue-700 space-y-1">
                  <li>• <kbd className="bg-blue-200 px-1 rounded">Espace</kbd> : Play/Pause</li>
                  <li>• <kbd className="bg-blue-200 px-1 rounded">→</kbd> : Une étape</li>
                  <li>• <kbd className="bg-blue-200 px-1 rounded">Ctrl+R</kbd> : Reset</li>
                  <li>• Ajustez la vitesse pour observer</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-blue-800 mb-2">🔍 Observation</h4>
                <ul className="text-blue-700 space-y-1">
                  <li>• Regardez les règles actives</li>
                  <li>• Suivez la tête sur la bande</li>
                  <li>• Observez le score augmenter</li>
                  <li>• Activez les explications en mode lent</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Footer */}
      <div className="mt-6 pt-4 border-t border-slate-200 text-center">
        <p className="text-sm text-slate-500">
          Explorez les mystères de l'informatique théorique ! 🤖✨
        </p>
      </div>
    </div>
  );
};
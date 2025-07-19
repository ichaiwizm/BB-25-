import React, { useState, useEffect } from 'react';
import { BookOpen, Zap, Settings, ArrowRight } from 'lucide-react';
import { StoryDrivenInterface } from '../components/StoryDrivenInterface';
import { InteractiveTutorial } from '../components/InteractiveTutorial';
import { VisualRules } from '../components/VisualRules';
import { useBusyBeaver } from '../hooks/useBusyBeaver';
import { presetsMap } from '../machines/presets';

type ViewMode = 'welcome' | 'tutorial' | 'story' | 'advanced';

export const NewHome: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('welcome');
  const [showRules, setShowRules] = useState(false);
  const { state, loadPreset } = useBusyBeaver();

  // Charger la machine de test au démarrage
  useEffect(() => {
    const preset = presetsMap['Test Simple'];
    if (preset) {
      loadPreset({
        name: preset.name,
        description: preset.description,
        rules: preset.predefinedRules || [],
        initialState: 0,
        haltStates: new Set(['halt']),
        alphabet: new Set([0, 1])
      });
    }
  }, [loadPreset]);

  const handleTutorialComplete = () => {
    setViewMode('story');
  };

  const handleTutorialSkip = () => {
    setViewMode('story');
  };

  // Trouver la prochaine règle qui va s'exécuter
  const getNextRule = () => {
    if (!state.currentState || !state.machine || state.currentState.isHalted) return undefined;
    
    const currentSymbol = state.currentState.tape.positions.get(state.currentState.tape.headPosition) ?? 0;
    return state.machine.rules.find(r => 
      r.currentState === state.currentState?.currentState && r.readSymbol === currentSymbol
    );
  };

  // Page d'accueil
  if (viewMode === 'welcome') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-green-600">
        <div className="min-h-screen bg-black bg-opacity-20 flex items-center justify-center p-4">
          <div className="max-w-4xl w-full">
            {/* En-tête principale */}
            <div className="text-center mb-12">
              <div className="text-8xl mb-6">🦫</div>
              <h1 className="text-5xl md:text-7xl font-bold text-white mb-4">
                Castor Constructeur
              </h1>
              <p className="text-xl md:text-2xl text-blue-100 font-light">
                Découvrez les machines de Turing de manière intuitive et amusante
              </p>
            </div>

            {/* Cartes de choix */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              {/* Tutoriel */}
              <div 
                onClick={() => setViewMode('tutorial')}
                className="bg-white bg-opacity-95 rounded-2xl p-8 cursor-pointer hover:bg-opacity-100 transition-all duration-300 hover:scale-105 hover:shadow-2xl group"
              >
                <div className="text-center">
                  <BookOpen className="h-16 w-16 text-blue-600 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                  <h2 className="text-2xl font-bold text-gray-800 mb-3">
                    🎓 Apprendre d'abord
                  </h2>
                  <p className="text-gray-600 mb-4">
                    Parfait si c'est votre première fois ! Un tutoriel interactif vous explique 
                    tous les concepts étape par étape.
                  </p>
                  <div className="flex items-center justify-center text-blue-600 font-semibold group-hover:text-blue-800">
                    Commencer le tutoriel
                    <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>

              {/* Mode Histoire */}
              <div 
                onClick={() => setViewMode('story')}
                className="bg-white bg-opacity-95 rounded-2xl p-8 cursor-pointer hover:bg-opacity-100 transition-all duration-300 hover:scale-105 hover:shadow-2xl group"
              >
                <div className="text-center">
                  <Zap className="h-16 w-16 text-green-600 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                  <h2 className="text-2xl font-bold text-gray-800 mb-3">
                    ⚡ Plonger directement
                  </h2>
                  <p className="text-gray-600 mb-4">
                    Vous connaissez déjà les bases ? Lancez-vous directement dans l'aventure 
                    avec Castor le constructeur !
                  </p>
                  <div className="flex items-center justify-center text-green-600 font-semibold group-hover:text-green-800">
                    Commencer l'aventure
                    <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </div>

            {/* Lien vers mode avancé */}
            <div className="text-center">
              <button
                onClick={() => setViewMode('advanced')}
                className="text-white hover:text-blue-200 transition-colors text-sm underline flex items-center mx-auto space-x-2"
              >
                <Settings className="h-4 w-4" />
                <span>Mode avancé (interface technique)</span>
              </button>
            </div>

            {/* Infos en bas */}
            <div className="mt-12 text-center text-blue-100 text-sm">
              <p className="mb-2">
                Les machines de Turing sont un concept fondamental de l'informatique,
                inventé par Alan Turing en 1936.
              </p>
              <p>
                Le problème du "Busy Beaver" cherche la machine qui écrit le maximum de symboles 
                avant de s'arrêter. C'est l'un des défis les plus fascinants de l'informatique théorique !
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Mode Tutoriel
  if (viewMode === 'tutorial') {
    return (
      <InteractiveTutorial 
        onComplete={handleTutorialComplete}
        onSkip={handleTutorialSkip}
      />
    );
  }

  // Mode Histoire (nouvelle interface principale)
  if (viewMode === 'story') {
    return (
      <div className="relative">
        <StoryDrivenInterface />
        
        {/* Bouton pour afficher les règles */}
        <button
          onClick={() => setShowRules(!showRules)}
          className="fixed bottom-4 right-4 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors z-40"
          title="Voir les règles détaillées"
        >
          <BookOpen className="h-6 w-6" />
        </button>

        {/* Panneau des règles */}
        {showRules && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">
                    🔧 Manuel d'Instructions Détaillé
                  </h2>
                  <button
                    onClick={() => setShowRules(false)}
                    className="text-gray-500 hover:text-gray-700 text-2xl"
                  >
                    ✕
                  </button>
                </div>
                
                {state.machine && (
                  <VisualRules 
                    rules={state.machine.rules}
                    currentState={state.currentState?.currentState}
                    nextRule={getNextRule()}
                  />
                )}
              </div>
            </div>
          </div>
        )}

        {/* Bouton retour accueil */}
        <button
          onClick={() => setViewMode('welcome')}
          className="fixed top-4 left-4 bg-white bg-opacity-90 text-gray-800 px-4 py-2 rounded-lg shadow hover:bg-white transition-colors z-40"
        >
          ← Accueil
        </button>
      </div>
    );
  }

  // Mode avancé (ancienne interface)
  if (viewMode === 'advanced') {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-800">
                Mode Avancé - Interface Technique
              </h1>
              <button
                onClick={() => setViewMode('welcome')}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
              >
                ← Retour à l'accueil
              </button>
            </div>
            <p className="text-gray-600 mt-2">
              Interface complète avec tous les outils de développement et de debug.
            </p>
          </div>
          
          {/* Ici, on pourrait importer l'ancienne interface Home */}
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-500 text-center">
              L'interface technique sera disponible dans une prochaine version.
              <br />
              Pour l'instant, utilisez le mode Histoire qui est plus intuitif !
            </p>
          </div>
        </div>
      </div>
    );
  }

  return null;
};
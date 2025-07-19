import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Target, Zap, BookOpen } from 'lucide-react';
import { useBusyBeaver } from '../hooks/useBusyBeaver';

interface StoryState {
  currentNarration: string;
  currentAction: string;
  score: number;
  goal: number;
  step: number;
  isComplete: boolean;
}

export const StoryDrivenInterface: React.FC = () => {
  const { state, step, run, stop, reset, isRunning } = useBusyBeaver();
  const [storyState, setStoryState] = useState<StoryState>({
    currentNarration: "🦫 Rencontrez Castor, notre petit constructeur numérique !",
    currentAction: "En attente de vos instructions...",
    score: 0,
    goal: 4,
    step: 0,
    isComplete: false
  });
  
  const [showDetailedView, setShowDetailedView] = useState(false);
  const [animationClass, setAnimationClass] = useState('');

  // Mettre à jour l'histoire à chaque changement d'état
  useEffect(() => {
    if (state.currentState) {
      updateStory();
    }
  }, [state.currentState?.stepCount, state.currentState?.currentState, state.currentState?.tape.headPosition, state.machine]);

  const updateStory = () => {
    if (!state.currentState || !state.machine) return;

    const headPos = state.currentState.tape.headPosition;
    const currentMachineState = state.currentState.currentState;
    const stepCount = state.currentState.stepCount;
    const score = Array.from(state.currentState.tape.positions.values()).filter(s => s === 1).length;
    
    // Génération de narration basée sur l'état
    let narration = "";
    let action = "";

    if (state.currentState.isHalted) {
      narration = `🎉 Castor a terminé son travail ! Il a construit ${score} symboles.`;
      action = score >= storyState.goal 
        ? "Mission accomplie avec brio !" 
        : "Pas mal, mais on peut faire mieux !";
    } else {
      // Trouver la règle qui va s'appliquer
      const currentRead = state.currentState.tape.positions.get(headPos) ?? 0;
      const nextRule = state.machine.rules.find(r => 
        r.currentState === currentMachineState && r.readSymbol === currentRead
      );

      if (nextRule) {
        const directionText = nextRule.direction === 'R' ? 'droite' : nextRule.direction === 'L' ? 'gauche' : 'sur place';
        narration = `🔍 Castor examine la position ${headPos} et voit un "${currentRead}"`;
        action = `Il va écrire "${nextRule.writeSymbol}", aller à ${directionText}, puis passer en mode ${nextRule.nextState}`;
      } else {
        narration = `🤔 Castor ne sait pas quoi faire avec "${currentRead}" dans l'état ${currentMachineState}`;
        action = "Il s'arrête, perplexe...";
      }
    }

    setStoryState({
      currentNarration: narration,
      currentAction: action,
      score,
      goal: 4, // Pour la machine 2-états
      step: stepCount,
      isComplete: state.currentState.isHalted
    });

    // Animation visuelle
    setAnimationClass('animate-pulse');
    setTimeout(() => setAnimationClass(''), 500);
  };

  const handleStep = () => {
    step();
    setAnimationClass('animate-bounce');
    setTimeout(() => setAnimationClass(''), 300);
  };

  const getProgressPercentage = () => {
    return Math.min((storyState.score / storyState.goal) * 100, 100);
  };

  const renderTapeVisual = () => {
    if (!state.currentState) return null;

    const headPos = state.currentState.tape.headPosition;
    const positions = [];
    
    // Afficher 11 positions autour de la tête
    for (let i = headPos - 5; i <= headPos + 5; i++) {
      positions.push(i);
    }

    return (
      <div className="flex items-center justify-center space-x-2 p-6 bg-gradient-to-r from-blue-50 to-green-50 rounded-xl">
        {positions.map((pos) => {
          const symbol = state.currentState!.tape.positions.get(pos) ?? 0;
          const isHead = pos === headPos;
          
          return (
            <div
              key={pos}
              className={`
                relative w-12 h-12 flex items-center justify-center text-lg font-bold rounded-lg border-2 transition-all duration-300
                ${isHead 
                  ? 'bg-yellow-400 border-orange-500 scale-125 shadow-lg z-10' 
                  : symbol === 1 
                    ? 'bg-green-200 border-green-400' 
                    : 'bg-gray-100 border-gray-300'
                }
                ${animationClass}
              `}
            >
              {symbol === 1 ? '🟢' : '⚪'}
              {isHead && (
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
                  <div className="bg-orange-500 text-white px-2 py-1 rounded text-xs font-bold">
                    🦫 Castor
                  </div>
                </div>
              )}
              <div className="absolute -bottom-6 text-xs text-gray-500">
                {pos}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* En-tête storytelling */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl font-bold text-gray-800">
                🦫 L'Aventure du Castor Constructeur
              </h1>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full font-medium">
                Mode Histoire
              </span>
            </div>
            <button
              onClick={() => setShowDetailedView(!showDetailedView)}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              {showDetailedView ? '📖 Mode Simple' : '🔧 Mode Expert'}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8 space-y-8">
        {/* Zone de narration principale */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              {storyState.currentNarration}
            </h2>
            <p className="text-lg text-blue-600 font-medium">
              {storyState.currentAction}
            </p>
          </div>

          {/* Objectif et progression */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Target className="h-6 w-6 text-purple-600" />
                <span className="text-lg font-semibold text-purple-800">
                  Mission : Construire {storyState.goal} symboles verts
                </span>
              </div>
              <div className="text-2xl font-bold text-purple-600">
                {storyState.score} / {storyState.goal}
              </div>
            </div>
            
            {/* Barre de progression */}
            <div className="w-full bg-purple-200 rounded-full h-4 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500 ease-out"
                style={{ width: `${getProgressPercentage()}%` }}
              ></div>
            </div>
            
            {storyState.isComplete && (
              <div className="mt-4 text-center">
                <div className="inline-flex items-center space-x-2 bg-green-100 text-green-800 px-4 py-2 rounded-full font-bold">
                  🎉 Mission terminée en {storyState.step} étapes !
                </div>
              </div>
            )}
          </div>

          {/* Visualisation de la bande */}
          {renderTapeVisual()}
        </div>

        {/* Contrôles principaux */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">
            🎮 Contrôles de Castor
          </h3>
          
          <div className="flex items-center justify-center space-x-4">
            <button
              onClick={handleStep}
              disabled={storyState.isComplete || isRunning}
              className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all font-medium text-lg"
            >
              <Zap className="h-5 w-5" />
              <span>Une Action</span>
            </button>

            <button
              onClick={isRunning ? stop : run}
              disabled={storyState.isComplete}
              className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-4 focus:ring-green-200 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all font-medium text-lg"
            >
              {isRunning ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
              <span>{isRunning ? 'Pause' : 'Action Continue'}</span>
            </button>

            <button
              onClick={reset}
              className="flex items-center space-x-2 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 focus:outline-none focus:ring-4 focus:ring-orange-200 transition-all font-medium text-lg"
            >
              <RotateCcw className="h-5 w-5" />
              <span>Recommencer</span>
            </button>
          </div>

          {/* Instructions contextuelles */}
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <BookOpen className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-semibold mb-1">💡 Que faire maintenant ?</p>
                {storyState.step === 0 ? (
                  <p>Cliquez sur "Une Action" pour voir Castor faire son premier mouvement !</p>
                ) : !storyState.isComplete ? (
                  <p>Continuez étape par étape avec "Une Action" ou utilisez "Action Continue" pour voir la suite automatiquement.</p>
                ) : (
                  <p>Félicitations ! Essayez "Recommencer" ou passez au "Mode Expert" pour explorer d'autres machines.</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Vue détaillée (mode expert) */}
        {showDetailedView && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              🔧 Vue détaillée (Mode Expert)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="font-semibold text-gray-700 mb-1">État actuel</div>
                <div className="text-2xl font-bold text-blue-600">
                  {state.currentState?.currentState || 'N/A'}
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="font-semibold text-gray-700 mb-1">Position</div>
                <div className="text-2xl font-bold text-green-600">
                  {state.currentState?.tape.headPosition || 0}
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="font-semibold text-gray-700 mb-1">Étapes</div>
                <div className="text-2xl font-bold text-purple-600">
                  {storyState.step}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
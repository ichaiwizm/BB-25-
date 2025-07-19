import React, { useState } from 'react';
import { ChevronRight, ChevronLeft, Play, Target, Lightbulb, CheckCircle } from 'lucide-react';

interface TutorialStep {
  id: number;
  title: string;
  explanation: string;
  visual: React.ReactNode;
  action?: string;
  completed: boolean;
}

interface InteractiveTutorialProps {
  onComplete: () => void;
  onSkip: () => void;
}

export const InteractiveTutorial: React.FC<InteractiveTutorialProps> = ({ onComplete, onSkip }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState<TutorialStep[]>([
    {
      id: 1,
      title: "Qu'est-ce qu'un Castor Constructeur ?",
      explanation: "Imaginez un petit castor qui se déplace sur une ligne infinie de cases. Il peut lire ce qu'il y a dans chaque case, écrire quelque chose, puis se déplacer. Son but : construire le maximum de symboles verts (1) avant de s'arrêter !",
      visual: (
        <div className="flex items-center justify-center space-x-4 p-6 bg-blue-50 rounded-lg">
          <div className="text-4xl">🦫</div>
          <div className="text-2xl">→</div>
          <div className="flex space-x-2">
            {[0, 1, 0, 1, 1].map((val, i) => (
              <div key={i} className={`w-8 h-8 rounded flex items-center justify-center text-sm font-bold ${val ? 'bg-green-200' : 'bg-gray-200'}`}>
                {val ? '🟢' : '⚪'}
              </div>
            ))}
          </div>
        </div>
      ),
      completed: false
    },
    {
      id: 2,
      title: "Comment le castor prend-il ses décisions ?",
      explanation: "Le castor suit des règles simples. Par exemple : 'Si je vois un ⚪ (0), alors j'écris un 🟢 (1), je vais à droite, et je passe en mode constructeur'. Ces règles déterminent tout son comportement !",
      visual: (
        <div className="bg-yellow-50 p-6 rounded-lg">
          <div className="text-center mb-4 font-bold text-lg">Règle du Castor</div>
          <div className="flex items-center justify-center space-x-3 text-lg">
            <div className="bg-white p-3 rounded border-2 border-blue-300">
              <div>Si je vois : ⚪</div>
            </div>
            <div className="text-2xl">→</div>
            <div className="bg-white p-3 rounded border-2 border-green-300">
              <div>J'écris : 🟢</div>
              <div>Je vais : à droite</div>
              <div>Mode : constructeur</div>
            </div>
          </div>
        </div>
      ),
      completed: false
    },
    {
      id: 3,
      title: "Quel est l'objectif ?",
      explanation: "Le défi du 'Busy Beaver' consiste à trouver la machine qui écrit le MAXIMUM de symboles verts avant de s'arrêter. C'est un des problèmes les plus fascinants de l'informatique ! Chaque nombre d'états a son champion.",
      visual: (
        <div className="bg-purple-50 p-6 rounded-lg">
          <div className="text-center mb-4">
            <div className="text-2xl font-bold mb-2">🏆 Records Officiels</div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center bg-white p-3 rounded">
              <span>2 états</span>
              <span className="font-bold text-green-600">4 symboles 🟢</span>
            </div>
            <div className="flex justify-between items-center bg-white p-3 rounded">
              <span>3 états</span>
              <span className="font-bold text-green-600">6 symboles 🟢</span>
            </div>
            <div className="flex justify-between items-center bg-white p-3 rounded">
              <span>4 états</span>
              <span className="font-bold text-green-600">13 symboles 🟢</span>
            </div>
          </div>
        </div>
      ),
      completed: false
    },
    {
      id: 4,
      title: "Votre première mission",
      explanation: "Vous allez maintenant contrôler un castor simple qui peut construire jusqu'à 4 symboles verts. Votre mission : le guider étape par étape pour comprendre comment il fonctionne !",
      visual: (
        <div className="bg-green-50 p-6 rounded-lg text-center">
          <Target className="h-16 w-16 text-green-600 mx-auto mb-4" />
          <div className="text-xl font-bold text-green-800 mb-2">Mission : 4 symboles verts</div>
          <div className="text-green-700">Cliquez sur "Commencer l'aventure" pour démarrer !</div>
        </div>
      ),
      action: "Commencer l'aventure",
      completed: false
    }
  ]);

  const completeCurrentStep = () => {
    setSteps(prev => prev.map(step => 
      step.id === currentStep + 1 ? { ...step, completed: true } : step
    ));
  };

  const nextStep = () => {
    completeCurrentStep();
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const currentStepData = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* En-tête */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">🦫 Tutoriel Castor Constructeur</h2>
            <button
              onClick={onSkip}
              className="text-blue-200 hover:text-white transition-colors text-sm underline"
            >
              Passer le tutoriel
            </button>
          </div>
          
          {/* Barre de progression */}
          <div className="w-full bg-blue-400 rounded-full h-2 overflow-hidden">
            <div 
              className="h-full bg-white transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="text-sm mt-2 opacity-90">
            Étape {currentStep + 1} sur {steps.length}
          </div>
        </div>

        {/* Contenu */}
        <div className="p-8">
          {/* Indicateur d'étapes */}
          <div className="flex items-center justify-center space-x-4 mb-8">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                  ${index <= currentStep 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-500'
                  }
                  ${step.completed ? 'bg-green-600' : ''}
                `}>
                  {step.completed ? <CheckCircle className="h-4 w-4" /> : index + 1}
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-8 h-0.5 mx-2 ${index < currentStep ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
                )}
              </div>
            ))}
          </div>

          {/* Titre de l'étape */}
          <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">
            {currentStepData.title}
          </h3>

          {/* Explication */}
          <div className="bg-blue-50 border-l-4 border-blue-600 p-4 mb-6">
            <div className="flex items-start space-x-3">
              <Lightbulb className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <p className="text-gray-700 leading-relaxed">
                {currentStepData.explanation}
              </p>
            </div>
          </div>

          {/* Visuel */}
          <div className="mb-8">
            {currentStepData.visual}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <button
              onClick={prevStep}
              disabled={currentStep === 0}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Précédent</span>
            </button>

            <div className="text-center">
              <div className="text-sm text-gray-500 mb-1">
                {currentStep + 1} / {steps.length}
              </div>
              <div className="text-xs text-gray-400">
                {Math.round(progress)}% terminé
              </div>
            </div>

            <button
              onClick={nextStep}
              className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all font-medium"
            >
              {currentStepData.action ? (
                <>
                  <Play className="h-4 w-4" />
                  <span>{currentStepData.action}</span>
                </>
              ) : (
                <>
                  <span>Suivant</span>
                  <ChevronRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Conseils en bas */}
        <div className="bg-gray-50 p-4 rounded-b-xl border-t">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
            <span>
              Prenez votre temps pour bien comprendre chaque concept. Vous pourrez revenir sur ce tutoriel à tout moment !
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
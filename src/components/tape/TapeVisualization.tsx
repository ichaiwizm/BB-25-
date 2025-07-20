import React, { useEffect, useState } from 'react';
import { Target, MessageSquare, TrendingUp } from 'lucide-react';
import '../../styles/design-system.css';

interface TapeVisualizationProps {
  state: any;
  formatState: (state: any) => string;
  getCurrentScore: () => number;
  getEstimatedSteps: () => number;
  currentExplanation: string;
  performanceMode: 'detailed' | 'normal' | 'fast' | 'turbo';
  getSigma6Warning?: () => string | null;
}

export const TapeVisualization: React.FC<TapeVisualizationProps> = ({ 
  state, 
  formatState, 
  getCurrentScore, 
  getEstimatedSteps, 
  currentExplanation, 
  performanceMode, 
  getSigma6Warning 
}) => {
  const [scoreHistory, setScoreHistory] = useState<{step: number, score: number}[]>([]);
  const [maxVisualPoints] = useState(150); // Nombre fixe de points visuels
  
  // Mettre à jour l'historique des scores avec throttling selon la vitesse
  useEffect(() => {
    if (!state.currentState) return;
    
    const currentStep = state.currentState.stepCount || 0;
    const currentScore = getCurrentScore();
    const speed = state.executionState.speed;
    
    setScoreHistory(prev => {
      // Éviter les doublons
      if (prev.length > 0 && prev[prev.length - 1].step === currentStep) {
        return prev;
      }
      
      // Throttling basé sur la vitesse pour éviter trop de mises à jour
      let shouldUpdate = true;
      if (speed > 5000) {
        // Mode très rapide désactivé, pas de mise à jour
        shouldUpdate = false;
      } else if (speed > 1000) {
        // Mode rapide : tous les 10 pas
        shouldUpdate = currentStep % 10 === 0 || currentStep <= 10;
      } else if (speed > 100) {
        // Mode normal-rapide : tous les 3 pas
        shouldUpdate = currentStep % 3 === 0 || currentStep <= 5;
      }
      // Mode lent (≤100) : toujours mettre à jour (shouldUpdate reste true)
      
      if (!shouldUpdate && prev.length > 0) {
        return prev;
      }
      
      const newHistory = [...prev, { step: currentStep, score: currentScore }];
      
      // Pas de limite, on garde tout l'historique
      return newHistory;
    });
  }, [state.currentState?.stepCount, getCurrentScore, state.executionState.speed]);
  
  // Reset l'historique quand on reset la machine
  useEffect(() => {
    if ((state.currentState?.stepCount || 0) === 0) {
      setScoreHistory([]);
    }
  }, [state.currentState?.stepCount]);
  
  if (!state.currentState) return null;

  const headPos = state.currentState.tape.headPosition;
  const positions = [];
  
  // Adapter le nombre de positions selon le mode de performance
  const viewRadius = performanceMode === 'detailed' ? 10 : 
                    performanceMode === 'normal' ? 7 : 5;
  
  for (let i = headPos - viewRadius; i <= headPos + viewRadius; i++) {
    positions.push(i);
  }

  return (
    <div className="h-full">
      {/* Professional Tape Display */}
      <div className="card-content flex-1 flex flex-col items-center justify-center">
        
        {/* Machine Status Bar */}
        <div className="w-full max-w-4xl mb-6">
          <div className="flex items-center justify-between text-xs text-secondary mb-2">
            <div className="flex items-center gap-2">
              <div className="status-dot status-running"></div>
              <span>Position {headPos}</span>
            </div>
            <div className="flex items-center gap-2">
              <Target className="w-3 h-3" />
              <span>{getCurrentScore()} symboles</span>
            </div>
            <div className="font-mono text-primary">
              État: {formatState(state.currentState?.currentState)}
            </div>
          </div>
        </div>

        {/* Professional Tape */}
        <div className="relative w-full max-w-5xl">
          
          {/* Professional Tape Cells */}
          <div className="relative">
            {/* Position Labels */}
            <div className="flex items-center justify-center mb-2">
              {positions.map((pos) => (
                <div key={`pos-${pos}`} className="w-12 text-center">
                  <span className="text-xs font-mono text-muted">{pos}</span>
                </div>
              ))}
            </div>
            
            {/* Head Indicator */}
            <div className="flex items-center justify-center mb-1">
              {positions.map((pos) => (
                <div key={`head-${pos}`} className="w-12 text-center">
                  {pos === headPos && (
                    <div className="text-primary text-lg font-bold">▼</div>
                  )}
                </div>
              ))}
            </div>
            
            {/* Tape Strip */}
            <div className="relative">
              {/* Tape Background */}
              <div className="absolute inset-0 bg-border h-16 rounded-lg"></div>
              
              {/* Tape Cells */}
              <div className="relative flex items-center justify-center h-16">
                {positions.map((pos) => {
                  const symbol = state.currentState!.tape.positions.get(pos) ?? 0;
                  const isHead = pos === headPos;
                  
                  return (
                    <div
                      key={pos}
                      className={`
                        relative flex items-center justify-center w-12 h-12 mx-0.5 font-semibold transition-all duration-200
                        ${isHead 
                          ? 'bg-primary text-white rounded-md shadow-md border-2 border-primary transform scale-105' 
                          : symbol === 1 
                            ? 'bg-slate-800 text-white rounded-md border-2 border-slate-700'
                            : 'bg-white border-2 border-gray-200 text-gray-400'
                        }
                      `}
                      title={`Position ${pos}: ${symbol}${isHead ? ' (Tête)' : ''}`}
                    >
                      <span className="text-base font-bold">{symbol}</span>
                      
                      {/* Head indicator */}
                      {isHead && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full border-2 border-white"></div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Execution Info */}
          <div className="mt-8 text-center space-y-3">
            
            {/* Explanation Display - Mode lent/très lent */}
            {state.executionState.speed <= 10 && currentExplanation && (
              <div className="max-w-2xl mx-auto bg-primary/5 border border-primary/20 rounded-md p-4">
                <div className="flex items-start gap-3">
                  <MessageSquare className="w-5 h-5 text-primary mt-0.5" />
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-primary mb-2">Étape en cours</h4>
                    <p className="text-sm text-secondary leading-relaxed mb-3">
                      {currentExplanation}
                    </p>
                    
                    {/* Détails de l'exécution */}
                    <div className="bg-white/50 rounded-md p-3 space-y-2">
                      <div className="grid grid-cols-2 gap-4 text-xs">
                        <div>
                          <span className="text-muted">Position actuelle:</span>
                          <span className="ml-2 font-mono font-bold text-primary">{state.currentState?.tape.headPosition}</span>
                        </div>
                        <div>
                          <span className="text-muted">Symbole lu:</span>
                          <span className="ml-2 font-mono font-bold text-primary">
                            {state.currentState?.tape.positions.get(state.currentState?.tape.headPosition) ?? 0}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted">État machine:</span>
                          <span className="ml-2 font-mono font-bold text-primary">
                            {formatState(state.currentState?.currentState)}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted">Étape:</span>
                          <span className="ml-2 font-mono font-bold text-primary">
                            {(state.currentState?.stepCount || 0).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Graphique en temps réel - Désactivé en mode très rapide */}
            {state.executionState.speed <= 5000 && scoreHistory.length > 1 && (
              <div className="max-w-4xl mx-auto bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  <h4 className="text-sm font-medium text-primary">Évolution du Score</h4>
                  <span className="text-xs text-secondary">
                    ({scoreHistory.length} étapes • {scoreHistory.length > maxVisualPoints ? `${maxVisualPoints} points visuels` : 'toutes visibles'})
                  </span>
                </div>
                
                {/* Mini graphique SVG */}
                <div className="relative h-32 bg-gray-50 rounded-md overflow-hidden">
                  <svg
                    width="100%"
                    height="100%"
                    viewBox="0 0 400 120"
                    className="absolute inset-0"
                  >
                    {/* Grille de fond */}
                    <defs>
                      <pattern id="grid" width="40" height="24" patternUnits="userSpaceOnUse">
                        <path d="M 40 0 L 0 0 0 24" fill="none" stroke="#e5e7eb" strokeWidth="0.5"/>
                      </pattern>
                    </defs>
                    <rect width="400" height="120" fill="url(#grid)" />
                    
                    {/* Ligne du graphique */}
                    {scoreHistory.length > 1 && (() => {
                      const maxStep = Math.max(...scoreHistory.map(h => h.step));
                      const maxScore = Math.max(...scoreHistory.map(h => h.score), 1);
                      const minStep = Math.min(...scoreHistory.map(h => h.step));
                      
                      // Échantillonnage intelligent pour un nombre fixe de points visuels
                      let sampledHistory = scoreHistory;
                      if (scoreHistory.length > maxVisualPoints) {
                        const step = Math.ceil(scoreHistory.length / maxVisualPoints);
                        sampledHistory = scoreHistory.filter((_, i) => i % step === 0);
                        // Toujours garder le dernier point
                        if (sampledHistory[sampledHistory.length - 1] !== scoreHistory[scoreHistory.length - 1]) {
                          sampledHistory.push(scoreHistory[scoreHistory.length - 1]);
                        }
                      }
                      
                      const points = sampledHistory.map(h => {
                        const x = ((h.step - minStep) / (maxStep - minStep || 1)) * 380 + 10;
                        const y = 110 - ((h.score / maxScore) * 100);
                        return `${x},${y}`;
                      }).join(' ');
                      
                      return (
                        <>
                          {/* Zone sous la courbe */}
                          <path
                            d={`M ${points.split(' ')[0]} 110 L ${points} L ${points.split(' ').slice(-1)[0].split(',')[0]},110 Z`}
                            fill="rgba(59, 130, 246, 0.1)"
                            stroke="none"
                          />
                          {/* Ligne principale */}
                          <polyline
                            points={points}
                            fill="none"
                            stroke="#3b82f6"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          {/* Points de données - Seulement sur les données échantillonnées */}
                          {sampledHistory.map((h, i) => {
                            const x = ((h.step - minStep) / (maxStep - minStep || 1)) * 380 + 10;
                            const y = 110 - ((h.score / maxScore) * 100);
                            return (
                              <circle
                                key={i}
                                cx={x}
                                cy={y}
                                r="2"
                                fill="#3b82f6"
                                stroke="white"
                                strokeWidth="1"
                              />
                            );
                          })}
                        </>
                      );
                    })()}
                  </svg>
                  
                  {/* Légendes */}
                  <div className="absolute bottom-1 left-2 text-xs text-gray-500">
                    Étapes: {scoreHistory[0]?.step || 0} → {scoreHistory[scoreHistory.length - 1]?.step || 0}
                  </div>
                  <div className="absolute top-1 right-2 text-xs text-gray-500">
                    Score max: {Math.max(...scoreHistory.map(h => h.score))}
                  </div>
                </div>
                
                {/* Statistiques rapides */}
                <div className="grid grid-cols-3 gap-4 mt-3 text-xs">
                  <div className="text-center">
                    <div className="font-medium text-primary">
                      {scoreHistory[scoreHistory.length - 1]?.score || 0}
                    </div>
                    <div className="text-gray-500">Score actuel</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-green-600">
                      +{Math.max(...scoreHistory.map(h => h.score)) - Math.min(...scoreHistory.map(h => h.score))}
                    </div>
                    <div className="text-gray-500">Gain total</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-gray-700">
                      {scoreHistory.length > 1 ? 
                        ((scoreHistory[scoreHistory.length - 1].score - scoreHistory[0].score) / 
                         (scoreHistory[scoreHistory.length - 1].step - scoreHistory[0].step || 1)).toFixed(2)
                        : '0'
                      }
                    </div>
                    <div className="text-gray-500">Score/étape</div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Message quand le graphique est désactivé en mode très rapide */}
            {state.executionState.speed > 5000 && (
              <div className="max-w-2xl mx-auto bg-yellow-50 border border-yellow-200 rounded-md p-3">
                <div className="flex items-center gap-2 text-yellow-700">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-sm">
                    Graphique désactivé en mode très rapide (vitesse &gt; 5000x)
                  </span>
                </div>
              </div>
            )}
            
            {/* Progress estimation pour les machines connues */}
            {state.machine?.name.includes('Σ(') && (
              <div className="max-w-sm mx-auto">
                <div className="flex justify-between text-xs text-muted mb-1">
                  <span>Progression</span>
                  <span>{Math.min(100, ((state.currentState?.stepCount || 0) / getEstimatedSteps() * 100)).toFixed(1)}%</span>
                </div>
                <div className="w-full bg-border rounded-full h-1">
                  <div 
                    className="bg-primary h-1 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, ((state.currentState?.stepCount || 0) / getEstimatedSteps() * 100))}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Σ(6) Warning Display */}
        {getSigma6Warning && getSigma6Warning() && (
          <div className="mt-4 p-3 bg-danger/5 border border-danger/20 rounded-md max-w-2xl">
            <div className="flex items-start gap-2">
              <div className="text-danger text-sm mt-0.5">⚠️</div>
              <div>
                <pre className="text-xs text-danger whitespace-pre-wrap leading-relaxed">
                  {getSigma6Warning()}
                </pre>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
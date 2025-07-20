import React from 'react';
import { Target, MessageSquare } from 'lucide-react';
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
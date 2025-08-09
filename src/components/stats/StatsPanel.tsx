import React from 'react';
import { Activity, Clock } from 'lucide-react';
import type { AppState } from '../../context/MachineContext';
import '../../styles/design-system.css';

interface StatsPanelProps {
  state: AppState;
  isRunning: boolean;
  executionTime: string;
  stepsPerSecond: number;
  getCurrentScore: () => number;
  estimatedTimeRemaining: string;
}

export const StatsPanel: React.FC<StatsPanelProps> = ({ 
  state, 
  isRunning, 
  executionTime, 
  stepsPerSecond,
  getCurrentScore,
  estimatedTimeRemaining
}) => {
  return (
    <div className="card-content">
      {/* Mobile Layout */}
      <div className="mobile-only space-y-4">
        {/* Key Metrics - Prominent Display */}
        <div className="bg-primary/5 border-2 border-primary/20 rounded-lg p-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary mb-1">
                {(state.currentState?.stepCount || 0).toLocaleString()}
              </div>
              <div className="text-xs text-secondary font-medium">ÉTAPES</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-success mb-1">
                {getCurrentScore().toLocaleString()}
              </div>
              <div className="text-xs text-secondary font-medium">SCORE</div>
            </div>
          </div>
        </div>

        {/* Status and Machine Info */}
        <div className="bg-surface border rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-primary">Machine</h3>
            <div className="flex items-center gap-2">
              <div className={`status-dot ${
                state.currentState?.isHalted ? 'status-halted' : isRunning ? 'status-running' : 'status-paused'
              }`}></div>
              <span className="text-sm font-semibold">
                {state.currentState?.isHalted ? 'HALT' : isRunning ? 'RUN' : 'PAUSE'}
              </span>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-secondary">Nom</span>
              <span className="text-sm font-medium text-primary truncate ml-2 flex-1 text-right" 
                    title={state.machine?.name}>
                {state.machine?.name || 'Aucune'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-secondary">Règles</span>
              <span className="text-sm font-medium text-primary">
                {state.machine?.rules.length || 0}
              </span>
            </div>
          </div>
        </div>

        {/* Running Metrics - Only when running */}
        {isRunning && (
          <div className="bg-warning/5 border border-warning/30 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-warning mb-3 flex items-center">
              <Activity className="w-4 h-4 mr-2" />
              Exécution en cours
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-secondary">Temps</span>
                <span className="text-sm font-mono font-semibold text-primary">
                  {executionTime}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-secondary">Étapes/sec</span>
                <span className="text-sm font-semibold text-primary">
                  {stepsPerSecond.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-secondary flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  Temps restant
                </span>
                <span className="text-sm font-mono font-semibold text-secondary">
                  {estimatedTimeRemaining}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Paused State Info */}
        {!isRunning && (state.currentState?.stepCount || 0) > 0 && (
          <div className="text-center py-2">
            <span className="text-sm font-medium text-warning">
              {state.currentState?.isHalted ? '✓ Exécution terminée' : '⏸️ Exécution en pause'}
            </span>
          </div>
        )}
      </div>

      {/* Desktop Layout - Original */}
      <div className="desktop-only space-y-5">
        {/* Real-time Metrics */}
        <div className="bg-surface border rounded-md p-4">
          <h3 className="card-title text-sm mb-3 flex items-center">
            <Activity className="w-4 h-4 mr-2 text-primary" />
            Métriques
          </h3>
          
          <div className="space-y-2.5">
            {/* Toujours afficher les étapes et le score */}
            <div className="flex justify-between items-center">
              <span className="text-xs text-secondary">Étapes</span>
              <span className="text-xs font-medium text-primary">
                {(state.currentState?.stepCount || 0).toLocaleString()}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-xs text-secondary">Score</span>
              <span className="text-xs font-medium text-success">
                {getCurrentScore().toLocaleString()}
              </span>
            </div>

            {/* Métriques de temps uniquement en mode RUN */}
            {isRunning && (
              <>
                <div className="flex justify-between items-center border-t pt-2" style={{ borderColor: 'var(--color-border-light)' }}>
                  <span className="text-xs text-secondary">Temps</span>
                  <span className="text-xs font-mono font-medium text-primary">
                    {executionTime}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-xs text-secondary">Étapes/sec</span>
                  <span className="text-xs font-medium text-primary">
                    {stepsPerSecond.toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-xs text-secondary flex items-center">
                    <Clock className="w-3 h-3 mr-1" />
                    Restant
                  </span>
                  <span className="text-xs font-mono font-medium text-secondary">
                    {estimatedTimeRemaining}
                  </span>
                </div>
              </>
            )}

            {/* Affichage statut en mode pause/étape */}
            {!isRunning && (state.currentState?.stepCount || 0) > 0 && (
              <div className="flex justify-between items-center border-t pt-2" style={{ borderColor: 'var(--color-border-light)' }}>
                <span className="text-xs text-secondary">Statut</span>
                <span className="text-xs font-medium text-warning">
                  {state.currentState?.isHalted ? 'Terminé' : 'Pause'}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Machine Info */}
        <div className="bg-surface border rounded-md p-4">
          <h3 className="card-title text-sm mb-3">Machine</h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-secondary">Nom</span>
              <span className="text-xs font-medium text-primary truncate ml-2 max-w-32" title={state.machine?.name}>
                {state.machine?.name || 'Aucune'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-secondary">Règles</span>
              <span className="text-xs font-medium text-primary">{state.machine?.rules.length || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-secondary">Statut</span>
              <div className="flex items-center gap-1.5">
                <div className={`status-dot ${
                  state.currentState?.isHalted ? 'status-halted' : isRunning ? 'status-running' : 'status-paused'
                }`}></div>
                <span className="text-xs font-medium">
                  {state.currentState?.isHalted ? 'HALT' : isRunning ? 'RUN' : 'PAUSE'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
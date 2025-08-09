import React from 'react';
import type { Rule } from '../../types/turing';
import '../../styles/design-system.css';

interface RulesPanelProps {
  rules: Rule[];
  currentRule?: Rule | null;
  formatState: (state: string | number) => string;
}

export const RulesPanel: React.FC<RulesPanelProps> = ({ 
  rules, 
  currentRule, 
  formatState 
}) => {
  const formatDirection = (direction: string): string => {
    switch (direction) {
      case 'L': return '←';
      case 'R': return '→';
      case 'N': return '•';
      default: return direction;
    }
  };

  const explainRule = (rule: Rule): string => {
    return `En état ${formatState(rule.currentState)}, lit ${rule.readSymbol} → écrit ${rule.writeSymbol}, va ${
      rule.direction === 'L' ? 'gauche' : rule.direction === 'R' ? 'droite' : 'reste'
    }, devient ${formatState(rule.nextState)}`;
  };

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title text-sm">Règles de la Machine</h3>
        <p className="card-subtitle">Table de transition</p>
      </div>
      
      <div className="card-content">
        {/* Desktop Table View */}
        <div className="desktop-only">
          {/* Table Header */}
          <div className="grid grid-cols-5 gap-2 mb-3 text-xs font-medium text-secondary">
            <div className="text-center">État</div>
            <div className="text-center">Lit</div>
            <div className="text-center">Écrit</div>
            <div className="text-center">Dir</div>
            <div className="text-center">Nouvel</div>
          </div>
          
          {/* Rules List - Desktop */}
          <div className="space-y-1">
            {rules.map((rule, index) => {
              const isActive = currentRule && 
                rule.currentState === currentRule.currentState && 
                rule.readSymbol === currentRule.readSymbol;
              
              return (
                <div
                  key={index}
                  className={`
                    grid grid-cols-5 gap-2 p-2 rounded-md text-xs transition-all duration-200
                    ${isActive 
                      ? 'bg-primary/10 border border-primary/30 ring-1 ring-primary/20' 
                      : 'bg-surface hover:bg-primary/5 border border-border'
                    }
                  `}
                  title={explainRule(rule)}
                >
                  <div className="text-center font-mono font-medium">
                    {formatState(rule.currentState)}
                  </div>
                  <div className="text-center font-mono font-bold">
                    {rule.readSymbol}
                  </div>
                  <div className="text-center font-mono font-bold text-success">
                    {rule.writeSymbol}
                  </div>
                  <div className="text-center font-mono">
                    {formatDirection(rule.direction)}
                  </div>
                  <div className="text-center font-mono font-medium">
                    {formatState(rule.nextState)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Mobile Card View */}
        <div className="mobile-only">
          <div className="space-y-3">
            {rules.map((rule, index) => {
              const isActive = currentRule && 
                rule.currentState === currentRule.currentState && 
                rule.readSymbol === currentRule.readSymbol;
              
              return (
                <div
                  key={index}
                  className={`
                    p-4 rounded-lg border transition-all duration-200 touch-target
                    ${isActive 
                      ? 'bg-primary/10 border-primary/30 ring-2 ring-primary/20' 
                      : 'bg-surface border-border hover:border-primary/20'
                    }
                  `}
                  title={explainRule(rule)}
                >
                  {/* Rule header with state transition */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-secondary">Règle {index + 1}</span>
                      {isActive && (
                        <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm font-mono">
                      <span className="font-semibold">{formatState(rule.currentState)}</span>
                      <span className="text-secondary">→</span>
                      <span className="font-semibold">{formatState(rule.nextState)}</span>
                    </div>
                  </div>

                  {/* Rule details in readable format */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-secondary">Lecture :</span>
                        <span className="text-sm font-mono font-bold bg-surface-elevated px-2 py-1 rounded">
                          {rule.readSymbol}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-secondary">Écriture :</span>
                        <span className="text-sm font-mono font-bold text-success bg-surface-elevated px-2 py-1 rounded">
                          {rule.writeSymbol}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-secondary">Direction :</span>
                        <span className="text-lg font-mono bg-surface-elevated px-2 py-1 rounded">
                          {formatDirection(rule.direction)}
                        </span>
                      </div>
                      <div className="text-xs text-secondary italic">
                        {rule.direction === 'L' ? 'Gauche' : rule.direction === 'R' ? 'Droite' : 'Statique'}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        {rules.length === 0 && (
          <div className="text-center text-secondary py-8">
            <div className="text-4xl mb-2">⚙️</div>
            <div className="text-sm font-medium mb-1">Aucune règle définie</div>
            <div className="text-xs">Chargez une machine ou créez des règles</div>
          </div>
        )}
      </div>
    </div>
  );
};
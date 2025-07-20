import React from 'react';
import type { Rule } from '../../types/turing';
import '../../styles/design-system.css';

interface RulesPanelProps {
  rules: Rule[];
  currentRule?: Rule | null;
  formatState: (state: any) => string;
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
        {/* Table Header */}
        <div className="grid grid-cols-5 gap-2 mb-3 text-xs font-medium text-secondary">
          <div className="text-center">État</div>
          <div className="text-center">Lit</div>
          <div className="text-center">Écrit</div>
          <div className="text-center">Dir</div>
          <div className="text-center">Nouvel</div>
        </div>
        
        {/* Rules List */}
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
        
        {rules.length === 0 && (
          <div className="text-center text-secondary text-xs py-4">
            Aucune règle définie
          </div>
        )}
      </div>
    </div>
  );
};
import { useState, useEffect, useMemo } from 'react';

export type PerformanceMode = 'detailed' | 'normal' | 'fast' | 'turbo';

interface PerformanceModeConfig {
  showRules: boolean;
  showExplanations: boolean;
  stepDelay: number;
  maxStepsPerFrame: number;
  showAnimations: boolean;
}

export const usePerformanceMode = (speed: number, stepCount: number) => {
  const [performanceMode, setPerformanceMode] = useState<PerformanceMode>('normal');

  // Configuration automatique selon la vitesse et le nombre d'étapes
  useEffect(() => {
    if (speed <= 10) {
      setPerformanceMode('detailed');
    } else if (speed <= 100) {
      setPerformanceMode('normal');
    } else if (speed <= 10000) {
      setPerformanceMode('fast');
    } else {
      setPerformanceMode('turbo');
    }
  }, [speed]);

  // Configuration des paramètres selon le mode
  const config: PerformanceModeConfig = useMemo(() => {
    switch (performanceMode) {
      case 'detailed':
        return {
          showRules: true,
          showExplanations: true,
          stepDelay: Math.max(100, 1000 / speed),
          maxStepsPerFrame: 1,
          showAnimations: true,
        };
      case 'normal':
        return {
          showRules: true,
          showExplanations: false,
          stepDelay: Math.max(10, 100 / speed),
          maxStepsPerFrame: Math.min(10, Math.floor(speed / 10)),
          showAnimations: true,
        };
      case 'fast':
        return {
          showRules: stepCount < 100000, // Masquer les règles après 100k étapes
          showExplanations: false,
          stepDelay: Math.max(1, 10 / speed),
          maxStepsPerFrame: Math.min(100, Math.floor(speed / 10)),
          showAnimations: false,
        };
      case 'turbo':
        return {
          showRules: false,
          showExplanations: false,
          stepDelay: 0,
          maxStepsPerFrame: Math.min(1000, Math.floor(speed / 10)),
          showAnimations: false,
        };
      default:
        return {
          showRules: true,
          showExplanations: false,
          stepDelay: 100,
          maxStepsPerFrame: 1,
          showAnimations: true,
        };
    }
  }, [performanceMode, speed, stepCount]);

  // Fonction pour obtenir le libellé du mode
  const getModeLabel = (mode: PerformanceMode): string => {
    switch (mode) {
      case 'detailed':
        return 'Détaillé';
      case 'normal':
        return 'Normal';
      case 'fast':
        return 'Rapide';
      case 'turbo':
        return 'Turbo';
      default:
        return 'Normal';
    }
  };

  // Fonction pour obtenir la couleur du mode
  const getModeColor = (mode: PerformanceMode): string => {
    switch (mode) {
      case 'detailed':
        return 'text-blue-600';
      case 'normal':
        return 'text-green-600';
      case 'fast':
        return 'text-orange-600';
      case 'turbo':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return {
    performanceMode,
    config,
    getModeLabel,
    getModeColor,
    setPerformanceMode,
  };
};
import { useCallback, useRef } from 'react';
import { useMachineContext } from '../context/MachineContext';
import type { TuringMachine, Rule } from '../types/turing';

/**
 * Configuration pour l'exécution automatique
 */
const EXECUTION_CONFIG = {
  /** Nombre maximum d'étapes avant arrêt forcé (garde-fou) */
  MAX_STEPS: 50000000, // 50M pour permettre Σ(5)
  /** Délai minimum entre les étapes en ms */
  MIN_STEP_DELAY: 50
} as const;

/**
 * Hook personnalisé pour orchestrer la machine de Turing Busy Beaver
 * Fournit une interface simplifiée pour contrôler la machine
 */
export const useBusyBeaver = () => {
  const { state, dispatch } = useMachineContext();
  const animationFrameRef = useRef<number | null>(null);
  const stepCountRef = useRef<number>(0);
  const speedRef = useRef<number>(state.executionState.speed);
  
  // Mettre à jour la ref de vitesse quand elle change
  speedRef.current = state.executionState.speed;

  /**
   * Exécute une seule étape de la machine
   */
  const step = useCallback(() => {
    dispatch({ type: 'STEP' });
  }, [dispatch]);

  /**
   * Démarre l'exécution automatique de la machine
   * Utilise requestAnimationFrame avec un garde-fou pour éviter les boucles infinies
   */
  const run = useCallback(() => {
    // Arrêter toute exécution en cours
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    // Réinitialiser le compteur d'étapes
    stepCountRef.current = 0;

    // Démarrer l'exécution
    dispatch({ type: 'RUN' });

    const executeStep = () => {
      // Vérifier le garde-fou
      if (stepCountRef.current >= EXECUTION_CONFIG.MAX_STEPS) {
        console.warn(`Arrêt forcé après ${EXECUTION_CONFIG.MAX_STEPS} étapes (garde-fou)`);
        return;
      }

      const currentSpeed = speedRef.current || 1;
      
      // Exécution par batch optimisée pour les hautes vitesses
      if (currentSpeed >= 50000) {
        // ULTRA-MAX: exécuter 25000 étapes par batch
        for (let i = 0; i < 25000 && stepCountRef.current < EXECUTION_CONFIG.MAX_STEPS; i++) {
          dispatch({ type: 'STEP' });
          stepCountRef.current++;
        }
        if (animationFrameRef.current !== null) {
          animationFrameRef.current = requestAnimationFrame(executeStep);
        }
      } else if (currentSpeed >= 25000) {
        // ULTRA-RAPIDE: exécuter 10000 étapes par batch
        for (let i = 0; i < 10000 && stepCountRef.current < EXECUTION_CONFIG.MAX_STEPS; i++) {
          dispatch({ type: 'STEP' });
          stepCountRef.current++;
        }
        if (animationFrameRef.current !== null) {
          animationFrameRef.current = requestAnimationFrame(executeStep);
        }
      } else if (currentSpeed >= 10000) {
        // Ultra-rapide: exécuter 5000 étapes par batch
        for (let i = 0; i < 5000 && stepCountRef.current < EXECUTION_CONFIG.MAX_STEPS; i++) {
          dispatch({ type: 'STEP' });
          stepCountRef.current++;
        }
        if (animationFrameRef.current !== null) {
          animationFrameRef.current = requestAnimationFrame(executeStep);
        }
      } else if (currentSpeed >= 1000) {
        // Très rapide: exécuter 1000 étapes par batch
        for (let i = 0; i < 1000 && stepCountRef.current < EXECUTION_CONFIG.MAX_STEPS; i++) {
          dispatch({ type: 'STEP' });
          stepCountRef.current++;
        }
        if (animationFrameRef.current !== null) {
          animationFrameRef.current = requestAnimationFrame(executeStep);
        }
      } else if (currentSpeed >= 50) {
        // Rapide: exécuter 100 étapes par batch
        for (let i = 0; i < 100 && stepCountRef.current < EXECUTION_CONFIG.MAX_STEPS; i++) {
          dispatch({ type: 'STEP' });
          stepCountRef.current++;
        }
        if (animationFrameRef.current !== null) {
          animationFrameRef.current = requestAnimationFrame(executeStep);
        }
      } else if (currentSpeed >= 10) {
        // Assez rapide: 10 étapes par batch
        for (let i = 0; i < 10 && stepCountRef.current < EXECUTION_CONFIG.MAX_STEPS; i++) {
          dispatch({ type: 'STEP' });
          stepCountRef.current++;
        }
        if (animationFrameRef.current !== null) {
          animationFrameRef.current = requestAnimationFrame(executeStep);
        }
      } else {
        // Vitesse normale avec délai pour visualisation
        dispatch({ type: 'STEP' });
        stepCountRef.current++;
        const delay = Math.max(1, 1000 / currentSpeed);
        setTimeout(() => {
          if (animationFrameRef.current !== null) {
            animationFrameRef.current = requestAnimationFrame(executeStep);
          }
        }, delay);
      }
    };

    // Démarrer la première étape
    animationFrameRef.current = requestAnimationFrame(executeStep);
  }, [dispatch]);

  /**
   * Arrête l'exécution automatique
   */
  const stop = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    
    dispatch({ type: 'STOP' });
  }, [dispatch]);

  /**
   * Remet la machine à l'état initial
   */
  const reset = useCallback(() => {
    // Arrêter l'exécution en cours
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    dispatch({ type: 'RESET' });
  }, [dispatch]);

  /**
   * Charge une machine prédéfinie
   */
  const loadPreset = useCallback((machine: TuringMachine) => {
    // Arrêter l'exécution en cours
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    dispatch({ type: 'LOAD_PRESET', payload: machine });
  }, [dispatch]);

  /**
   * Met à jour les règles de la machine
   */
  const updateRules = useCallback((rules: Rule[]) => {
    dispatch({ type: 'UPDATE_RULES', payload: rules });
  }, [dispatch]);

  /**
   * Change la vitesse d'exécution
   */
  const setSpeed = useCallback((speed: number) => {
    dispatch({ type: 'SET_SPEED', payload: speed });
  }, [dispatch]);

  /**
   * Nettoie les ressources lors du démontage du composant
   */
  const cleanup = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  }, []);

  return {
    // État de la machine
    state,
    
    // Actions de contrôle
    step,
    run,
    stop,
    reset,
    loadPreset,
    updateRules,
    setSpeed,
    
    // Utilitaires
    cleanup,
    
    // Informations d'exécution
    isRunning: state.executionState.isRunning,
    stepCount: state.currentState?.stepCount ?? 0,
    maxSteps: EXECUTION_CONFIG.MAX_STEPS
  };
}; 
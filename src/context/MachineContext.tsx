import React, { createContext, useContext, useReducer } from 'react';
import type { ReactNode, Dispatch } from 'react';
import type {
  TuringMachine,
  MachineState,
  ExecutionState,
  DisplayConfig,
  Rule,
  Tape
} from '../types/turing';
import { simpleTestMachine, sigma2BusyBeaver } from '../machines/presets';

/**
 * État global de l'application
 */
export interface AppState {
  machine: TuringMachine | null;
  currentState: MachineState | null;
  executionState: ExecutionState;
  displayConfig: DisplayConfig;
}

/**
 * Actions du reducer
 */
export type MachineAction =
  | { type: 'STEP' }
  | { type: 'RUN' }
  | { type: 'STOP' }
  | { type: 'RESET' }
  | { type: 'LOAD_PRESET'; payload: TuringMachine }
  | { type: 'UPDATE_RULES'; payload: Rule[] }
  | { type: 'SET_SPEED'; payload: number };

/**
 * Valeur du contexte de la machine de Turing
 * Contient l'état global et la fonction dispatch
 */
export interface MachineContextValue {
  state: AppState;
  dispatch: Dispatch<MachineAction>;
}

/**
 * Crée une machine par défaut à partir d'une spécification
 */
function createDefaultMachine(): TuringMachine {
  return {
    name: sigma2BusyBeaver.name,
    description: sigma2BusyBeaver.description,
    rules: sigma2BusyBeaver.predefinedRules || [],
    initialState: 'A',
    haltStates: new Set(['halt']),
    alphabet: new Set([0, 1])
  };
}

/**
 * Crée l'état initial de la machine
 */
function createInitialMachineState(machine: TuringMachine): MachineState {
  const initialTape: Tape = {
    positions: new Map(),
    headPosition: 0,
    defaultSymbol: 0
  };

  return {
    currentState: machine.initialState,
    tape: initialTape,
    stepCount: 0,
    isHalted: false
  };
}

/**
 * État initial de l'application
 * Charge automatiquement une machine de test simple
 */
const defaultMachine = createDefaultMachine();
const initialState: AppState = {
  machine: defaultMachine,
  currentState: createInitialMachineState(defaultMachine),
  executionState: {
    isRunning: false,
    isPaused: false,
    speed: 1,
    stepDelay: 1000
  },
  displayConfig: {
    visibleCells: 10,
    showPositions: true,
    showBinary: false,
    symbolColors: new Map()
  }
};

/**
 * Contexte React pour la machine de Turing
 * Permet de partager l'état de la machine à travers l'application
 */
export const MachineContext = createContext<MachineContextValue | null>(null);

/**
 * Reducer pur pour gérer l'état de la machine de Turing
 * Aucun side-effect UI, seulement la logique d'état
 */
const machineReducer = (state: AppState, action: MachineAction): AppState => {
  switch (action.type) {
    case 'STEP': {
      if (!state.machine || !state.currentState || state.currentState.isHalted) {
        return state;
      }

      const { currentState, machine } = state;
      const currentSymbol = currentState.tape.positions.get(currentState.tape.headPosition) ?? currentState.tape.defaultSymbol;
      
      // Trouver la règle applicable
      const rule = machine.rules.find(r => 
        r.currentState === currentState.currentState && r.readSymbol === currentSymbol
      );

      if (!rule) {
        // Aucune règle trouvée, la machine s'arrête
        return {
          ...state,
          currentState: {
            ...currentState,
            isHalted: true,
            haltState: currentState.currentState
          },
          executionState: {
            ...state.executionState,
            isRunning: false
          }
        };
      }

      // Appliquer la règle
      const newTape = new Map(currentState.tape.positions);
      newTape.set(currentState.tape.headPosition, rule.writeSymbol);

      const newHeadPosition = rule.direction === 'L' 
        ? currentState.tape.headPosition - 1
        : rule.direction === 'R' 
        ? currentState.tape.headPosition + 1
        : currentState.tape.headPosition;

      const isHalted = machine.haltStates.has(rule.nextState);

      return {
        ...state,
        currentState: {
          currentState: rule.nextState,
          tape: {
            ...currentState.tape,
            positions: newTape,
            headPosition: newHeadPosition
          },
          stepCount: currentState.stepCount + 1,
          isHalted,
          haltState: isHalted ? rule.nextState : undefined
        },
        executionState: {
          ...state.executionState,
          isRunning: !isHalted
        }
      };
    }

    case 'RUN': {
      return {
        ...state,
        executionState: {
          ...state.executionState,
          isRunning: true,
          isPaused: false
        }
      };
    }

    case 'STOP': {
      return {
        ...state,
        executionState: {
          ...state.executionState,
          isRunning: false,
          isPaused: false
        }
      };
    }

    case 'RESET': {
      if (!state.machine) {
        return state;
      }

      const initialTape: Tape = {
        positions: new Map(),
        headPosition: 0,
        defaultSymbol: 0
      };

      return {
        ...state,
        currentState: {
          currentState: state.machine.initialState,
          tape: initialTape,
          stepCount: 0,
          isHalted: false
        },
        executionState: {
          ...state.executionState,
          isRunning: false,
          isPaused: false
        }
      };
    }

    case 'LOAD_PRESET': {
      const initialTape: Tape = {
        positions: new Map(),
        headPosition: 0,
        defaultSymbol: 0
      };

      return {
        ...state,
        machine: action.payload,
        currentState: {
          currentState: action.payload.initialState,
          tape: initialTape,
          stepCount: 0,
          isHalted: false
        },
        executionState: {
          ...state.executionState,
          isRunning: false,
          isPaused: false
        }
      };
    }

    case 'UPDATE_RULES': {
      if (!state.machine) {
        return state;
      }

      return {
        ...state,
        machine: {
          ...state.machine,
          rules: action.payload
        }
      };
    }

    case 'SET_SPEED': {
      return {
        ...state,
        executionState: {
          ...state.executionState,
          speed: action.payload,
          stepDelay: Math.max(100, 1000 / action.payload)
        }
      };
    }

    default:
      return state;
  }
};

/**
 * Hook personnalisé pour utiliser le contexte de la machine
 * @throws Error si utilisé en dehors d'un MachineProvider
 */
export const useMachineContext = (): MachineContextValue => {
  const context = useContext(MachineContext);
  if (!context) {
    throw new Error('useMachineContext doit être utilisé dans un MachineProvider');
  }
  return context;
};

/**
 * Props pour le MachineProvider
 */
interface MachineProviderProps {
  children: ReactNode;
}

/**
 * Provider du contexte de la machine de Turing
 * Fournit l'état global et la fonction dispatch à tous les composants enfants
 */
export const MachineProvider: React.FC<MachineProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(machineReducer, initialState);

  const contextValue: MachineContextValue = {
    state,
    dispatch
  };

  return (
    <MachineContext.Provider value={contextValue}>
      {children}
    </MachineContext.Provider>
  );
}; 
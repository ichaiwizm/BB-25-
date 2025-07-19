// Types de base pour l'automate de Turing

/**
 * Symbole sur la bande de la machine de Turing
 * 0 = blanc, 1 = noir, ou autres symboles personnalisés
 */
export type Symbol = 0 | 1 | string;

/**
 * Direction de mouvement de la tête de lecture/écriture
 */
export type Direction = 'L' | 'R' | 'N'; // Left, Right, No movement

/**
 * État de la machine de Turing
 * Peut être un nombre ou une chaîne pour les états nommés
 */
export type State = number | string;

/**
 * Règle de transition pour la machine de Turing
 * Définit ce qui se passe quand on est dans un état donné et qu'on lit un symbole donné
 */
export interface Rule {
  /** État actuel (lecture seule) */
  readonly currentState: State;
  /** Symbole lu sur la bande (lecture seule) */
  readonly readSymbol: Symbol;
  /** Symbole à écrire sur la bande (mutable) */
  writeSymbol: Symbol;
  /** Direction de mouvement de la tête (mutable) */
  direction: Direction;
  /** Nouvel état de la machine (mutable) */
  nextState: State;
}

/**
 * Position sur la bande de la machine de Turing
 */
export interface TapePosition {
  /** Index de la position (lecture seule) */
  readonly index: number;
  /** Symbole à cette position (mutable) */
  symbol: Symbol;
}

/**
 * Bande de la machine de Turing
 * Représente l'ensemble des cellules avec leurs symboles
 */
export interface Tape {
  /** Positions avec leurs symboles (mutable) */
  positions: Map<number, Symbol>;
  /** Position de la tête de lecture/écriture (mutable) */
  headPosition: number;
  /** Symbole par défaut pour les positions non définies (lecture seule) */
  readonly defaultSymbol: Symbol;
}

/**
 * État complet de la machine de Turing
 */
export interface MachineState {
  /** État actuel de la machine (mutable) */
  currentState: State;
  /** Bande de la machine (mutable) */
  tape: Tape;
  /** Nombre d'étapes exécutées (mutable) */
  stepCount: number;
  /** Indique si la machine a terminé (mutable) */
  isHalted: boolean;
  /** État d'arrêt (lecture seule, défini seulement si isHalted = true) */
  readonly haltState?: State;
}

/**
 * Configuration complète d'une machine de Turing
 */
export interface TuringMachine {
  /** Nom de la machine (lecture seule) */
  readonly name: string;
  /** Description de la machine (lecture seule) */
  readonly description?: string;
  /** Ensemble des règles de transition (mutable) */
  rules: Rule[];
  /** État initial (lecture seule) */
  readonly initialState: State;
  /** États d'arrêt (lecture seule) */
  readonly haltStates: Set<State>;
  /** Symboles valides pour cette machine (lecture seule) */
  readonly alphabet: Set<Symbol>;
}

/**
 * Spécification pour une machine Busy Beaver
 * Définit les paramètres pour générer automatiquement une machine
 */
export interface BusyBeaverSpec {
  /** Nombre d'états de la machine (lecture seule) */
  readonly numStates: number;
  /** Nombre de symboles (généralement 2 pour Busy Beaver) (lecture seule) */
  readonly numSymbols: number;
  /** Nom de la spécification (lecture seule) */
  readonly name: string;
  /** Description de la spécification (lecture seule) */
  readonly description?: string;
  /** Règles prédéfinies si disponibles (lecture seule) */
  readonly predefinedRules?: Rule[];
}

/**
 * Résultat d'exécution d'une machine Busy Beaver
 */
export interface BusyBeaverResult {
  /** Nombre d'étapes exécutées (lecture seule) */
  readonly steps: number;
  /** Nombre de symboles 1 sur la bande finale (lecture seule) */
  readonly score: number;
  /** Configuration finale de la bande (lecture seule) */
  readonly finalTape: Tape;
  /** État d'arrêt (lecture seule) */
  readonly haltState: State;
  /** Temps d'exécution en millisecondes (lecture seule) */
  readonly executionTime: number;
}

/**
 * État d'exécution de la machine
 */
export interface ExecutionState {
  /** Indique si la machine est en cours d'exécution (mutable) */
  isRunning: boolean;
  /** Indique si la machine est en pause (mutable) */
  isPaused: boolean;
  /** Vitesse d'exécution en étapes par seconde (mutable) */
  speed: number;
  /** Délai entre les étapes en millisecondes (mutable) */
  stepDelay: number;
}

/**
 * Configuration d'affichage pour l'interface utilisateur
 */
export interface DisplayConfig {
  /** Nombre de cellules à afficher de chaque côté de la tête (mutable) */
  visibleCells: number;
  /** Indique si on affiche les numéros de position (mutable) */
  showPositions: boolean;
  /** Indique si on affiche les symboles en binaire (mutable) */
  showBinary: boolean;
  /** Couleurs personnalisées pour les symboles (mutable) */
  symbolColors: Map<Symbol, string>;
}

/**
 * Événements de la machine de Turing
 */
export type MachineEvent = 
  | { type: 'STEP'; state: MachineState; rule: Rule }
  | { type: 'HALT'; finalState: MachineState }
  | { type: 'ERROR'; message: string }
  | { type: 'RESET'; initialState: MachineState };

/**
 * Callback pour les événements de la machine
 */
export type MachineEventHandler = (event: MachineEvent) => void; 
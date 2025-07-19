import type { BusyBeaverSpec } from '../types/turing';

/**
 * Machine Busy Beaver Σ(2) - 2 états, 6 pas, 4 "1" (OFFICIELLE OPTIMALE)
 * La machine qui maximise Σ(2), découverte par Tibor Radó en 1962
 * Score maximal: 4 symboles 1 sur la bande finale en exactement 6 étapes
 */
export const sigma2BusyBeaver: BusyBeaverSpec = {
  numStates: 2,
  numSymbols: 2,
  name: 'Σ(2) - 2 états (6 pas, 4×"1")',
  description: 'Machine Busy Beaver OFFICIELLE optimale Σ(2). Maximise le nombre de "1" pour 2 états: 4 symboles en 6 étapes exactement.',
  predefinedRules: [
    // Règles officielles Σ(2):
    // A0 → 1 R B    B0 → 1 L A
    // A1 → 1 L B    B1 → 1 R H
    {
      currentState: 'A',
      readSymbol: 0,
      writeSymbol: 1,
      direction: 'R',
      nextState: 'B'
    },
    {
      currentState: 'A',
      readSymbol: 1,
      writeSymbol: 1,
      direction: 'L',
      nextState: 'B'
    },
    {
      currentState: 'B',
      readSymbol: 0,
      writeSymbol: 1,
      direction: 'L',
      nextState: 'A'
    },
    {
      currentState: 'B',
      readSymbol: 1,
      writeSymbol: 1,
      direction: 'R',
      nextState: 'halt'
    }
  ]
};

/**
 * Machine Busy Beaver Σ(3) - 3 états, 14 pas, 6 "1" (OFFICIELLE OPTIMALE)
 * La machine qui maximise Σ(3), découverte par Lin et Rado en 1965
 * Score maximal: 6 symboles 1 sur la bande finale en exactement 14 étapes
 */
export const sigma3BusyBeaver: BusyBeaverSpec = {
  numStates: 3,
  numSymbols: 2,
  name: 'Σ(3) - 3 états (14 pas, 6×"1")',
  description: 'Machine Busy Beaver OFFICIELLE optimale Σ(3). Maximise le nombre de "1" pour 3 états: 6 symboles en 14 étapes exactement.',
  predefinedRules: [
    // Règles officielles Σ(3):
    // A0 → 1 R B    B0 → 0 R C    C0 → 1 L C
    // A1 → 1 R H    B1 → 1 R B    C1 → 1 L A
    {
      currentState: 'A',
      readSymbol: 0,
      writeSymbol: 1,
      direction: 'R',
      nextState: 'B'
    },
    {
      currentState: 'A',
      readSymbol: 1,
      writeSymbol: 1,
      direction: 'R',
      nextState: 'halt'
    },
    {
      currentState: 'B',
      readSymbol: 0,
      writeSymbol: 0,
      direction: 'R',
      nextState: 'C'
    },
    {
      currentState: 'B',
      readSymbol: 1,
      writeSymbol: 1,
      direction: 'R',
      nextState: 'B'
    },
    {
      currentState: 'C',
      readSymbol: 0,
      writeSymbol: 1,
      direction: 'L',
      nextState: 'C'
    },
    {
      currentState: 'C',
      readSymbol: 1,
      writeSymbol: 1,
      direction: 'L',
      nextState: 'A'
    }
  ]
};

/**
 * Machine Busy Beaver Σ(4) - 4 états, 107 pas, 13 "1" (OFFICIELLE OPTIMALE)
 * La machine qui maximise Σ(4), découverte par Brady en 1975
 * Score maximal: 13 symboles 1 sur la bande finale en exactement 107 étapes
 */
export const sigma4BusyBeaver: BusyBeaverSpec = {
  numStates: 4,
  numSymbols: 2,
  name: 'Σ(4) - 4 états (107 pas, 13×"1")',
  description: 'Machine Busy Beaver OFFICIELLE optimale Σ(4). Maximise le nombre de "1" pour 4 états: 13 symboles en 107 étapes exactement.',
  predefinedRules: [
    // Règles officielles Σ(4):
    // A0 → 1 R B    B0 → 1 L A    C0 → 1 R H    D0 → 1 R D
    // A1 → 1 L B    B1 → 0 L C    C1 → 1 L D    D1 → 0 R A
    {
      currentState: 'A',
      readSymbol: 0,
      writeSymbol: 1,
      direction: 'R',
      nextState: 'B'
    },
    {
      currentState: 'A',
      readSymbol: 1,
      writeSymbol: 1,
      direction: 'L',
      nextState: 'B'
    },
    {
      currentState: 'B',
      readSymbol: 0,
      writeSymbol: 1,
      direction: 'L',
      nextState: 'A'
    },
    {
      currentState: 'B',
      readSymbol: 1,
      writeSymbol: 0,
      direction: 'L',
      nextState: 'C'
    },
    {
      currentState: 'C',
      readSymbol: 0,
      writeSymbol: 1,
      direction: 'R',
      nextState: 'halt'
    },
    {
      currentState: 'C',
      readSymbol: 1,
      writeSymbol: 1,
      direction: 'L',
      nextState: 'D'
    },
    {
      currentState: 'D',
      readSymbol: 0,
      writeSymbol: 1,
      direction: 'R',
      nextState: 'D'
    },
    {
      currentState: 'D',
      readSymbol: 1,
      writeSymbol: 0,
      direction: 'R',
      nextState: 'A'
    }
  ]
};

/**
 * Machine Busy Beaver Σ(5) - 5 états, 47 176 870 pas, 4 098 "1" (OFFICIELLE PROUVÉE)
 * La machine qui maximise Σ(5), prouvée le 2 juillet 2024
 * Score maximal: 4 098 symboles 1 sur la bande finale en exactement 47 176 870 étapes
 */
export const sigma5BusyBeaver: BusyBeaverSpec = {
  numStates: 5,
  numSymbols: 2,
  name: 'Σ(5) - 5 états (47M pas, 4098×"1")',
  description: 'Machine Busy Beaver OFFICIELLE optimale Σ(5). Maximise le nombre de "1" pour 5 états: 4 098 symboles en 47 176 870 étapes exactement. Prouvée le 2 juillet 2024.',
  predefinedRules: [
    // Règles officielles Σ(5):
    // A: 0→1RB, 1→1LC
    // B: 0→1RC, 1→1RB  
    // C: 0→1RD, 1→0LE
    // D: 0→1LA, 1→1LD
    // E: 0→1RH, 1→0LA
    {
      currentState: 'A',
      readSymbol: 0,
      writeSymbol: 1,
      direction: 'R',
      nextState: 'B'
    },
    {
      currentState: 'A',
      readSymbol: 1,
      writeSymbol: 1,
      direction: 'L',
      nextState: 'C'
    },
    {
      currentState: 'B',
      readSymbol: 0,
      writeSymbol: 1,
      direction: 'R',
      nextState: 'C'
    },
    {
      currentState: 'B',
      readSymbol: 1,
      writeSymbol: 1,
      direction: 'R',
      nextState: 'B'
    },
    {
      currentState: 'C',
      readSymbol: 0,
      writeSymbol: 1,
      direction: 'R',
      nextState: 'D'
    },
    {
      currentState: 'C',
      readSymbol: 1,
      writeSymbol: 0,
      direction: 'L',
      nextState: 'E'
    },
    {
      currentState: 'D',
      readSymbol: 0,
      writeSymbol: 1,
      direction: 'L',
      nextState: 'A'
    },
    {
      currentState: 'D',
      readSymbol: 1,
      writeSymbol: 1,
      direction: 'L',
      nextState: 'D'
    },
    {
      currentState: 'E',
      readSymbol: 0,
      writeSymbol: 1,
      direction: 'R',
      nextState: 'halt'
    },
    {
      currentState: 'E',
      readSymbol: 1,
      writeSymbol: 0,
      direction: 'L',
      nextState: 'A'
    }
  ]
};

/**
 * Machine de test simple (pour debug)
 * Score maximal: 2 symboles 1
 */
export const simpleTestMachine: BusyBeaverSpec = {
  numStates: 2,
  numSymbols: 2,
  name: 'Machine de test simple',
  description: 'Machine simple pour tester le simulateur. Score maximal: 2 symboles 1.',
  predefinedRules: [
    // État A (état initial)
    {
      currentState: 'A',
      readSymbol: 0,
      writeSymbol: 1,
      direction: 'R',
      nextState: 'halt' // Arrêt immédiat
    },
    {
      currentState: 'A',
      readSymbol: 1,
      writeSymbol: 1,
      direction: 'R',
      nextState: 'halt'
    }
  ]
};


/**
 * Map des machines parfaites officielles
 */
export const perfectMachinesMap: Record<string, BusyBeaverSpec> = {
  'Σ(2) - 6 pas, 4×"1"': sigma2BusyBeaver,
  'Σ(3) - 14 pas, 6×"1"': sigma3BusyBeaver,
  'Σ(4) - 107 pas, 13×"1"': sigma4BusyBeaver,
  'Σ(5) - 47M pas, 4098×"1"': sigma5BusyBeaver,
};

/**
 * Map des presets disponibles pour le menu déroulant (backward compatibility)
 */
export const presetsMap: Record<string, BusyBeaverSpec> = {
  'Σ(2) Officielle': sigma2BusyBeaver,
  'Σ(3) Officielle': sigma3BusyBeaver,
  'Σ(4) Officielle': sigma4BusyBeaver,
  'Σ(5) Officielle': sigma5BusyBeaver,
  'Test Simple': simpleTestMachine
};

// Machines anciennes (pour compatibilité)
export const twoStateBusyBeaver = sigma2BusyBeaver;
export const threeStateBusyBeaver = sigma3BusyBeaver; 
export const fourStateBusyBeaver = sigma4BusyBeaver;

/**
 * Liste ordonnée des presets pour l'affichage
 */
export const presetsList: BusyBeaverSpec[] = [
  simpleTestMachine,
  sigma2BusyBeaver,
  sigma3BusyBeaver,
  sigma4BusyBeaver,
  sigma5BusyBeaver
];

/**
 * Informations sur les scores maximaux connus
 */
export const knownScores: Record<number, { score: number | string; year: number; discoverer: string }> = {
  1: { score: 1, year: 1962, discoverer: 'Tibor Radó' },
  2: { score: 4, year: 1962, discoverer: 'Tibor Radó' },
  3: { score: 6, year: 1965, discoverer: 'Lin & Rado' },
  4: { score: 13, year: 1975, discoverer: 'Brady' },
  5: { score: 4098, year: 1989, discoverer: 'Marxen & Buntrock' },
  6: { score: '≈4.6e1439', year: 1997, discoverer: 'Marxen & Buntrock' } // trop grand pour Number, stocké en string
};

/**
 * Obtient le score maximal connu pour un nombre d'états donné
 * @param nStates Nombre d'états
 * @returns Score maximal ou null si inconnu
 */
export function getKnownScore(nStates: number): number | string | null {
  return knownScores[nStates]?.score ?? null;
}

/**
 * Obtient les informations complètes pour un nombre d'états donné
 * @param nStates Nombre d'états
 * @returns Informations ou null si inconnu
 */
export function getKnownScoreInfo(nStates: number): { score: number | string; year: number; discoverer: string } | null {
  return knownScores[nStates] ?? null;
} 
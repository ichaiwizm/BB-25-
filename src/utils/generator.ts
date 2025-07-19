import type { BusyBeaverSpec, Rule, State, Symbol, Direction } from '../types/turing';

/**
 * Configuration pour la génération aléatoire
 */
const GENERATION_CONFIG = {
  /** Probabilité qu'une règle pointe vers l'état d'arrêt */
  HALT_PROBABILITY: 0.3,
  /** Probabilité de mouvement vers la gauche */
  LEFT_PROBABILITY: 0.4,
  /** Probabilité de mouvement vers la droite */
  RIGHT_PROBABILITY: 0.4,
  /** Probabilité de ne pas bouger */
  NO_MOVE_PROBABILITY: 0.2,
  /** Nombre maximum de tentatives pour générer une règle valide */
  MAX_ATTEMPTS: 100
} as const;

/**
 * Génère une spécification Busy Beaver aléatoire avec n états
 * @param nStates Nombre d'états de la machine
 * @returns Spécification Busy Beaver générée
 */
export function generateRandomSpec(nStates: number): BusyBeaverSpec {
  if (nStates < 1) {
    throw new Error('Le nombre d\'états doit être au moins 1');
  }

  if (nStates > 10) {
    throw new Error('Le nombre d\'états ne peut pas dépasser 10 pour des raisons de performance');
  }

  const rules = generateRandomRules(nStates);
  const spec = createSpecFromRules(nStates, rules);

  return spec;
}

/**
 * Génère un ensemble de règles aléatoires pour une machine à n états
 * @param nStates Nombre d'états
 * @returns Tableau de règles générées
 */
function generateRandomRules(nStates: number): Rule[] {
  const rules: Rule[] = [];
  const states = generateStates(nStates);
  const symbols: Symbol[] = [0, 1];
  const haltState = states[states.length - 1]; // Dernier état = état d'arrêt

  // Générer toutes les combinaisons état/symbole possibles
  for (const state of states.slice(0, -1)) { // Exclure l'état d'arrêt
    for (const symbol of symbols) {
      const rule = generateRandomRule(state, symbol, states, symbols, haltState);
      rules.push(rule);
    }
  }

  return rules;
}

/**
 * Génère une règle aléatoire pour une combinaison état/symbole donnée
 * @param currentState État actuel
 * @param readSymbol Symbole lu
 * @param allStates Tous les états disponibles
 * @param allSymbols Tous les symboles disponibles
 * @param haltState État d'arrêt
 * @returns Règle générée
 */
function generateRandomRule(
  currentState: State,
  readSymbol: Symbol,
  allStates: State[],
  allSymbols: Symbol[],
  haltState: State
): Rule {
  // Choisir aléatoirement le symbole à écrire
  const writeSymbol = randomChoice(allSymbols);

  // Choisir aléatoirement la direction
  const direction = randomDirection();

  // Choisir le nouvel état avec heuristiques
  const nextState = chooseNextState(currentState, allStates, haltState);

  return {
    currentState,
    readSymbol,
    writeSymbol,
    direction,
    nextState
  };
}

/**
 * Choisit le prochain état avec des heuristiques pour éviter les boucles triviales
 * @param currentState État actuel
 * @param allStates Tous les états disponibles
 * @param haltState État d'arrêt
 * @returns Prochain état choisi
 */
function chooseNextState(
  currentState: State,
  allStates: State[],
  haltState: State
): State {
  const availableStates = allStates.filter(state => state !== haltState);
  
  // Heuristique 1: Probabilité de pointer vers l'état d'arrêt
  if (Math.random() < GENERATION_CONFIG.HALT_PROBABILITY) {
    return haltState;
  }

  // Heuristique 2: Éviter de rester dans le même état trop souvent
  const otherStates = availableStates.filter(state => state !== currentState);
  
  if (otherStates.length > 0) {
    // 70% de chance de changer d'état
    if (Math.random() < 0.7) {
      return randomChoice(otherStates);
    }
  }

  // Sinon, choisir aléatoirement parmi tous les états non-arrêt
  return randomChoice(availableStates);
}

/**
 * Génère une direction aléatoire selon les probabilités configurées
 * @returns Direction choisie
 */
function randomDirection(): Direction {
  const rand = Math.random();
  
  if (rand < GENERATION_CONFIG.LEFT_PROBABILITY) {
    return 'L';
  } else if (rand < GENERATION_CONFIG.LEFT_PROBABILITY + GENERATION_CONFIG.RIGHT_PROBABILITY) {
    return 'R';
  } else {
    return 'N';
  }
}

/**
 * Choisit un élément aléatoire dans un tableau
 * @param array Tableau source
 * @returns Élément choisi
 */
function randomChoice<T>(array: T[]): T {
  if (array.length === 0) {
    throw new Error('Impossible de choisir dans un tableau vide');
  }
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Génère les états pour une machine à n états
 * @param nStates Nombre d'états
 * @returns Tableau d'états
 */
function generateStates(nStates: number): State[] {
  const states: State[] = [];
  
  for (let i = 0; i < nStates; i++) {
    // Utiliser des noms d'états numériques (q0, q1, q2, etc.)
    states.push(i);
  }
  
  return states;
}

/**
 * Crée une spécification Busy Beaver à partir d'un ensemble de règles
 * @param nStates Nombre d'états
 * @param rules Règles générées
 * @returns Spécification Busy Beaver
 */
function createSpecFromRules(nStates: number, rules: Rule[]): BusyBeaverSpec {
  return {
    numStates: nStates,
    numSymbols: 2, // Toujours 2 symboles pour Busy Beaver
    name: `Busy Beaver ${nStates} états (généré)`,
    description: `Machine Busy Beaver générée aléatoirement avec ${nStates} états`,
    predefinedRules: rules
  };
}

/**
 * Génère plusieurs spécifications aléatoires
 * @param nStates Nombre d'états
 * @param count Nombre de spécifications à générer
 * @returns Tableau de spécifications
 */
export function generateMultipleSpecs(nStates: number, count: number): BusyBeaverSpec[] {
  const specs: BusyBeaverSpec[] = [];
  
  for (let i = 0; i < count; i++) {
    const spec = generateRandomSpec(nStates);
    specs.push({ ...spec, name: `${spec.name} #${i + 1}` });
  }
  
  return specs;
}

/**
 * Génère une spécification avec des règles optimisées pour éviter les boucles triviales
 * @param nStates Nombre d'états
 * @returns Spécification optimisée
 */
export function generateOptimizedSpec(nStates: number): BusyBeaverSpec {
  if (nStates < 1) {
    throw new Error('Le nombre d\'états doit être au moins 1');
  }

  const rules = generateOptimizedRules(nStates);
  const spec = createSpecFromRules(nStates, rules);

  return spec;
}

/**
 * Génère des règles avec des optimisations pour éviter les boucles triviales
 * @param nStates Nombre d'états
 * @returns Règles optimisées
 */
function generateOptimizedRules(nStates: number): Rule[] {
  const rules: Rule[] = [];
  const states = generateStates(nStates);
  const symbols: Symbol[] = [0, 1];
  const haltState = states[states.length - 1];

  // Statistiques pour éviter les boucles
  const stateUsage = new Map<State, number>();
  const haltRules = new Map<State, number>();

  // Initialiser les compteurs
  for (const state of states) {
    stateUsage.set(state, 0);
    haltRules.set(state, 0);
  }

  for (const state of states.slice(0, -1)) {
    for (const symbol of symbols) {
      const rule = generateOptimizedRule(
        state, 
        symbol, 
        states, 
        symbols, 
        haltState, 
        stateUsage, 
        haltRules
      );
      rules.push(rule);
      
      // Mettre à jour les statistiques
      stateUsage.set(rule.nextState, (stateUsage.get(rule.nextState) ?? 0) + 1);
      if (rule.nextState === haltState) {
        haltRules.set(state, (haltRules.get(state) ?? 0) + 1);
      }
    }
  }

  return rules;
}

/**
 * Génère une règle optimisée avec des heuristiques avancées
 * @param currentState État actuel
 * @param readSymbol Symbole lu
 * @param allStates Tous les états
 * @param allSymbols Tous les symboles
 * @param haltState État d'arrêt
 * @param stateUsage Utilisation des états
 * @param haltRules Règles d'arrêt par état
 * @returns Règle optimisée
 */
function generateOptimizedRule(
  currentState: State,
  readSymbol: Symbol,
  allStates: State[],
  allSymbols: Symbol[],
  haltState: State,
  stateUsage: Map<State, number>,
  haltRules: Map<State, number>
): Rule {
  const writeSymbol = randomChoice(allSymbols);
  const direction = randomDirection();

  // Heuristiques avancées pour le choix du prochain état
  const nextState = chooseOptimizedNextState(
    currentState,
    allStates,
    haltState,
    stateUsage,
    haltRules
  );

  return {
    currentState,
    readSymbol,
    writeSymbol,
    direction,
    nextState
  };
}

/**
 * Choisit le prochain état avec des heuristiques avancées
 * @param currentState État actuel
 * @param allStates Tous les états
 * @param haltState État d'arrêt
 * @param stateUsage Utilisation des états
 * @param haltRules Règles d'arrêt par état
 * @returns Prochain état optimisé
 */
function chooseOptimizedNextState(
  currentState: State,
  allStates: State[],
  haltState: State,
  stateUsage: Map<State, number>,
  haltRules: Map<State, number>
): State {
  const availableStates = allStates.filter(state => state !== haltState);
  
  // Heuristique 1: Si cet état n'a pas encore de règle d'arrêt, augmenter la probabilité
  const currentHaltRules = haltRules.get(currentState) ?? 0;
  const haltProbability = currentHaltRules === 0 ? 0.5 : GENERATION_CONFIG.HALT_PROBABILITY;
  
  if (Math.random() < haltProbability) {
    return haltState;
  }

  // Heuristique 2: Préférer les états moins utilisés
  const stateWeights = availableStates.map(state => {
    const usage = stateUsage.get(state) ?? 0;
    return { state, weight: 1 / (usage + 1) }; // Plus l'usage est faible, plus le poids est élevé
  });

  // Choisir un état avec une probabilité basée sur les poids
  const totalWeight = stateWeights.reduce((sum, item) => sum + item.weight, 0);
  let random = Math.random() * totalWeight;
  
  for (const { state, weight } of stateWeights) {
    random -= weight;
    if (random <= 0) {
      return state;
    }
  }

  // Fallback
  return randomChoice(availableStates);
}

/**
 * Valide une spécification générée pour détecter les problèmes potentiels
 * @param spec Spécification à valider
 * @returns Résultat de validation
 */
export function validateGeneratedSpec(spec: BusyBeaverSpec): {
  isValid: boolean;
  warnings: string[];
  issues: string[];
} {
  const warnings: string[] = [];
  const issues: string[] = [];

  if (!spec.predefinedRules || spec.predefinedRules.length === 0) {
    issues.push('Aucune règle définie');
    return { isValid: false, warnings, issues };
  }

  // Vérifier la couverture des états
  const stateCoverage = new Set<State>();
  const haltStates = new Set<State>();
  
  for (const rule of spec.predefinedRules) {
    stateCoverage.add(rule.currentState);
    if (!spec.predefinedRules.some(r => r.currentState === rule.nextState)) {
      haltStates.add(rule.nextState);
    }
  }

  // Vérifier les états d'arrêt
  if (haltStates.size === 0) {
    issues.push('Aucun état d\'arrêt détecté');
  } else if (haltStates.size > 1) {
    warnings.push(`Plusieurs états d'arrêt détectés: ${Array.from(haltStates).join(', ')}`);
  }

  // Vérifier la couverture complète
  const expectedRules = (spec.numStates - 1) * spec.numSymbols;
  if (spec.predefinedRules.length !== expectedRules) {
    warnings.push(`Nombre de règles inattendu: ${spec.predefinedRules.length} au lieu de ${expectedRules}`);
  }

  return {
    isValid: issues.length === 0,
    warnings,
    issues
  };
} 
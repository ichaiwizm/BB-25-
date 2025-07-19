import type { Rule, BusyBeaverSpec, State, Symbol, Direction } from '../types/turing';

/**
 * Résultat d'un parsing avec gestion d'erreurs
 */
export type ParseResult<T> = 
  | { success: true; data: T }
  | { success: false; error: string; line?: number };

/**
 * Erreurs de parsing possibles
 */
export class ParseError extends Error {
  line?: number;
  column?: number;
  
  constructor(message: string, line?: number, column?: number) {
    super(message);
    this.name = 'ParseError';
    this.line = line;
    this.column = column;
  }
}

/**
 * Parse une ligne de règle au format: "état_actuel symbole_lu -> symbole_écrit direction nouvel_état"
 * Exemples:
 * - "q0 0 -> 1 R q1"
 * - "A 1 -> 0 L B"
 * - "state1 0 -> 1 N state2"
 */
export function parseRule(line: string): Rule {
  // Nettoyer la ligne
  const cleanLine = line.trim();
  if (!cleanLine || cleanLine.startsWith('#')) {
    throw new ParseError('Ligne vide ou commentaire');
  }

  // Diviser la ligne en parties
  const parts = cleanLine.split(/\s+/);
  if (parts.length !== 5) {
    throw new ParseError(
      `Format invalide. Attendu: "état symbole -> symbole direction état", reçu: "${cleanLine}"`
    );
  }

  const [currentStateStr, readSymbolStr, arrow, writeSymbolStr, directionStr, nextStateStr] = parts;

  // Vérifier la flèche
  if (arrow !== '->') {
    throw new ParseError(`Flèche invalide. Attendu: "->", reçu: "${arrow}"`);
  }

  // Parser l'état actuel
  const currentState = parseState(currentStateStr);

  // Parser le symbole lu
  const readSymbol = parseSymbol(readSymbolStr);

  // Parser le symbole à écrire
  const writeSymbol = parseSymbol(writeSymbolStr);

  // Parser la direction
  const direction = parseDirection(directionStr);

  // Parser le nouvel état
  const nextState = parseState(nextStateStr);

  return {
    currentState,
    readSymbol,
    writeSymbol,
    direction,
    nextState
  };
}

/**
 * Parse une règle avec gestion d'erreurs (retourne un Result)
 */
export function parseRuleSafe(line: string): ParseResult<Rule> {
  try {
    const rule = parseRule(line);
    return { success: true, data: rule };
  } catch (error) {
    if (error instanceof ParseError) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'Erreur inconnue lors du parsing' };
  }
}

/**
 * Parse un état (nombre ou chaîne)
 */
function parseState(stateStr: string): State {
  // Si c'est un nombre, le convertir
  const num = parseInt(stateStr, 10);
  if (!isNaN(num) && num >= 0) {
    return num;
  }
  
  // Sinon, c'est une chaîne (doit être non vide)
  if (!stateStr || stateStr.trim() === '') {
    throw new ParseError('État invalide: chaîne vide');
  }
  
  return stateStr.trim();
}

/**
 * Parse un symbole (0, 1, ou chaîne)
 */
function parseSymbol(symbolStr: string): Symbol {
  // Si c'est 0 ou 1, le retourner tel quel
  if (symbolStr === '0' || symbolStr === '1') {
    return parseInt(symbolStr, 10) as Symbol;
  }
  
  // Sinon, c'est une chaîne (doit être non vide)
  if (!symbolStr || symbolStr.trim() === '') {
    throw new ParseError('Symbole invalide: chaîne vide');
  }
  
  return symbolStr.trim();
}

/**
 * Parse une direction (L, R, N)
 */
function parseDirection(directionStr: string): Direction {
  const direction = directionStr.toUpperCase();
  
  if (direction === 'L' || direction === 'R' || direction === 'N') {
    return direction as Direction;
  }
  
  throw new ParseError(
    `Direction invalide. Attendu: L, R, ou N, reçu: "${directionStr}"`
  );
}

/**
 * Parse une spécification Busy Beaver depuis un texte
 * Format attendu:
 * # Nom de la spécification
 * # Description optionnelle
 * # Nombre d'états: X
 * # Nombre de symboles: Y
 * q0 0 -> 1 R q1
 * q0 1 -> 1 L q1
 * q1 0 -> 1 L q0
 * q1 1 -> 1 R halt
 */
export function parseSpec(text: string): BusyBeaverSpec {
  const lines = text.split('\n').map(line => line.trim()).filter(line => line && !line.startsWith('#'));
  
  if (lines.length === 0) {
    throw new ParseError('Aucune règle trouvée dans le texte');
  }

  // Extraire les métadonnées des commentaires
  const metadata = extractMetadata(text);
  
  // Parser toutes les règles
  const rules: Rule[] = [];
  const errors: string[] = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    try {
      const rule = parseRule(line);
      rules.push(rule);
    } catch (error) {
      if (error instanceof ParseError) {
        errors.push(`Ligne ${i + 1}: ${error.message}`);
      } else {
        errors.push(`Ligne ${i + 1}: Erreur inconnue`);
      }
    }
  }

  // Si il y a des erreurs, les lancer
  if (errors.length > 0) {
    throw new ParseError(`Erreurs de parsing:\n${errors.join('\n')}`);
  }

  // Détecter automatiquement le nombre d'états et de symboles
  const states = new Set<State>();
  const symbols = new Set<Symbol>();
  
  for (const rule of rules) {
    states.add(rule.currentState);
    states.add(rule.nextState);
    symbols.add(rule.readSymbol);
    symbols.add(rule.writeSymbol);
  }

  // Déterminer l'état d'arrêt (état qui n'apparaît que comme nextState)
  const haltStates = new Set<State>();
  const currentStates = new Set<State>();
  
  for (const rule of rules) {
    currentStates.add(rule.currentState);
  }
  
  for (const rule of rules) {
    if (!currentStates.has(rule.nextState)) {
      haltStates.add(rule.nextState);
    }
  }

  return {
    numStates: metadata.numStates ?? states.size,
    numSymbols: metadata.numSymbols ?? symbols.size,
    name: metadata.name ?? `Busy Beaver ${states.size} états`,
    description: metadata.description,
    predefinedRules: rules
  };
}

/**
 * Parse une spécification avec gestion d'erreurs
 */
export function parseSpecSafe(text: string): ParseResult<BusyBeaverSpec> {
  try {
    const spec = parseSpec(text);
    return { success: true, data: spec };
  } catch (error) {
    if (error instanceof ParseError) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'Erreur inconnue lors du parsing de la spécification' };
  }
}

/**
 * Extrait les métadonnées des commentaires
 */
function extractMetadata(text: string): {
  name?: string;
  description?: string;
  numStates?: number;
  numSymbols?: number;
} {
  const lines = text.split('\n');
  const metadata: any = {};

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed.startsWith('#')) continue;

    const content = trimmed.substring(1).trim();
    
    // Nom
    if (content.startsWith('Nom:')) {
      metadata.name = content.substring(4).trim();
    }
    // Description
    else if (content.startsWith('Description:')) {
      metadata.description = content.substring(12).trim();
    }
    // Nombre d'états
    else if (content.startsWith('États:') || content.startsWith('States:')) {
      const match = content.match(/(?:États|States):\s*(\d+)/);
      if (match) {
        metadata.numStates = parseInt(match[1], 10);
      }
    }
    // Nombre de symboles
    else if (content.startsWith('Symboles:') || content.startsWith('Symbols:')) {
      const match = content.match(/(?:Symboles|Symbols):\s*(\d+)/);
      if (match) {
        metadata.numSymbols = parseInt(match[1], 10);
      }
    }
  }

  return metadata;
}

/**
 * Valide un ensemble de règles
 */
export function validateRules(rules: Rule[]): ParseResult<void> {
  if (rules.length === 0) {
    return { success: false, error: 'Aucune règle fournie' };
  }

  const errors: string[] = [];
  const ruleMap = new Map<string, Rule>();

  for (let i = 0; i < rules.length; i++) {
    const rule = rules[i];
    const key = `${rule.currentState}:${rule.readSymbol}`;

    // Vérifier les doublons
    if (ruleMap.has(key)) {
      errors.push(`Règle dupliquée à la ligne ${i + 1}: ${rule.currentState} ${rule.readSymbol}`);
    } else {
      ruleMap.set(key, rule);
    }

    // Vérifier que la direction est valide
    if (!['L', 'R', 'N'].includes(rule.direction)) {
      errors.push(`Direction invalide à la ligne ${i + 1}: ${rule.direction}`);
    }
  }

  if (errors.length > 0) {
    return { success: false, error: errors.join('\n') };
  }

  return { success: true, data: undefined };
} 
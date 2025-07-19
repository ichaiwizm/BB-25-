# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production (runs TypeScript compile + Vite build)
- `npm run lint` - Run ESLint on codebase
- `npm run preview` - Preview production build

### Build Process
Always run both TypeScript compilation and linting after changes:
```bash
npm run build && npm run lint
```

## Architecture

### Core Concepts
This is a **Turing Machine and Busy Beaver simulator** built with React/TypeScript. The Busy Beaver problem seeks the Turing machine with n states that writes the maximum number of 1s before halting.

### State Management Architecture
- **Context Pattern**: Global state managed through `MachineContext` using React's `useReducer`
- **Pure Reducer**: All machine logic in `machineReducer` - no side effects, only state transformations
- **Custom Hook**: `useBusyBeaver` orchestrates machine control with requestAnimationFrame for smooth execution

### Key State Flow
1. **Actions**: Dispatched through `MachineContext` (`STEP`, `RUN`, `RESET`, `LOAD_PRESET`, etc.)
2. **Reducer**: Pure function handles state transitions and rule application
3. **Hook**: `useBusyBeaver` manages execution timing and lifecycle

### Domain Models (`src/types/turing.ts`)
- **Rule**: Transition rules (currentState + readSymbol → writeSymbol + direction + nextState)
- **Tape**: Infinite tape with Map for sparse storage, headPosition, defaultSymbol
- **MachineState**: Current execution state (currentState, tape, stepCount, isHalted)
- **TuringMachine**: Complete machine definition (rules, initialState, haltStates, alphabet)

### Machine Execution
- **Step-by-step**: Find applicable rule, write symbol, move head, change state
- **Halt Detection**: When nextState is in haltStates or no rule found
- **Safety Guards**: MAX_STEPS (1M) prevents infinite loops

### Component Architecture
- **Controls**: Play/pause/step/reset buttons, speed control, execution status
- **Tape**: Visual representation of tape with head position
- **RuleEditor**: Edit individual transition rules
- **RuleList**: Display all rules in tabular format
- **StateTable**: Transition table view

### Preset System (`src/machines/presets.ts`)
- **Historical Machines**: 2-state (score: 4), 3-state (score: 6), 4-state (score: 13)
- **BusyBeaverSpec**: Specification format with predefined rules
- **Known Scores**: Historical records up to 6 states

### Generation & Parsing
- **Generator** (`src/utils/generator.ts`): Create random machines with heuristics to avoid trivial loops
- **Parser** (`src/utils/parser.ts`): Parse machine definitions from text format

## Key Implementation Details

### Execution Model
- Uses `requestAnimationFrame` + `setTimeout` for smooth, cancellable execution
- Speed control via `stepDelay` calculation: `Math.max(100, 1000 / speed)`
- Cleanup pattern: Always cancel `animationFrameRef` on unmount/stop

### Tape Storage
- Uses `Map<number, Symbol>` for sparse storage (only non-default symbols stored)
- Infinite tape simulation with negative and positive indices
- Default symbol (0) assumed for unset positions

### Rule Application
The core machine step logic:
1. Get current symbol: `tape.positions.get(headPosition) ?? defaultSymbol`
2. Find matching rule: `currentState + readSymbol`
3. Apply rule: write symbol, move head, change state
4. Check halt condition: `haltStates.has(nextState)`

### French Language
The codebase uses French for:
- Comments and documentation
- UI text and labels
- Variable names in some contexts
- Error messages

## Development Guidelines

### Type Safety
- Strict TypeScript with comprehensive type definitions
- Readonly properties for immutable data (states, symbols)
- Exhaustive union types for Direction ('L' | 'R' | 'N')

### Performance Considerations
- Sparse tape storage for memory efficiency
- requestAnimationFrame for smooth animations
- Memoization opportunities in components displaying large rule sets

### Testing Machine Logic
- Test with preset machines (2-state, 3-state, 4-state)
- Verify halt conditions and infinite loop prevention
- Check rule validation and parsing edge cases
import { MachineProvider } from './context/MachineContext';
import { ModernSimulator } from './pages/ModernSimulator';

/**
 * Composant racine de l'application
 * Monte l'interface moderne Mission Control
 */
function App() {
  return (
    <MachineProvider>
      <ModernSimulator />
    </MachineProvider>
  );
}

export default App;

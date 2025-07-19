import { MachineProvider } from './context/MachineContext';
import { SimpleHome } from './pages/SimpleHome';

/**
 * Composant racine de l'application
 * Monte l'interface simple et fonctionnelle
 */
function App() {
  return (
    <MachineProvider>
      <SimpleHome />
    </MachineProvider>
  );
}

export default App;

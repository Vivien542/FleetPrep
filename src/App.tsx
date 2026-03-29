// Point d'entrée de l'application FleetPrep
import { ToastProvider } from '@/components/ui/Toast';
import { AppRouter } from '@/app/Router';

function App() {
  return (
    <ToastProvider>
      <AppRouter />
    </ToastProvider>
  );
}

export default App;

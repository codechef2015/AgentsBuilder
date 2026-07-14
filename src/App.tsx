/**
 * App Root
 * 
 * Routes between the Framework Selector page and the Builder (MainLayout).
 * Wraps everything in FrameworkProvider context.
 */

import { FrameworkProvider, useFramework } from './context/framework-context';
import { FrameworkSelector } from './pages/framework-selector';
import { MainLayout } from './components/main-layout';
import { getStoredFramework } from './frameworks/registry';

// Import and register framework adapters
import './frameworks/strands';
import './frameworks/google-adk';

function AppRouter() {
  const { isFrameworkActive } = useFramework();

  if (!isFrameworkActive) {
    return <FrameworkSelector />;
  }

  return <MainLayout />;
}

function App() {
  // Always show selector on app load — user explicitly chooses each session
  // (stored framework only used for "recently opened" display, not auto-routing)
  return (
    <FrameworkProvider initialFramework={null}>
      <AppRouter />
    </FrameworkProvider>
  );
}

export default App;

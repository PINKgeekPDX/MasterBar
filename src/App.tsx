import React from 'react';
import { Toaster } from 'react-hot-toast';
import { EnhancedToolbar } from './components/EnhancedToolbar';
import { TerminalConsole } from './components/TerminalConsole';
import { ErrorBoundary } from './components/ErrorBoundary';
import useToolbarStore from './store/toolbarStore';
import './styles/toolbar.css';

function App() {
  const { toolbars, addToolbar } = useToolbarStore();

  // Add initial toolbar if none exist
  React.useEffect(() => {
    if (toolbars.length === 0) {
      addToolbar('top');
    }
  }, []);

  return (
    <div className="h-screen bg-transparent">
      <ErrorBoundary>
        {toolbars.map(toolbar => (
          <EnhancedToolbar 
            key={toolbar.id} 
            toolbarId={toolbar.id}
            position={toolbar.position}
          />
        ))}
      </ErrorBoundary>
      <TerminalConsole />
      <Toaster position="bottom-right" />
    </div>
  );
}

export default App;
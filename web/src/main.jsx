import { createRoot } from 'react-dom/client';
import './app.css';
import App, { runDone } from './App.jsx';

createRoot(document.getElementById('root')).render(<App />);

// Keep the Qollab run alive until a terminal state: the End run button, or 30 minutes idle
// (no input, not playing, no live run in flight). A missing backend is not terminal.
await runDone;

import { createRoot } from 'react-dom/client';
import './app.css';
import App, { firstJobDone } from './App.jsx';

createRoot(document.getElementById('root')).render(<App />);

// Keep the Qollab run alive until the first IonQ job finishes (never resolves on local simulators).
await firstJobDone;

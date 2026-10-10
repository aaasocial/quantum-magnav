import { createRoot } from 'react-dom/client';
import './app.css';
import App, { runDone } from './App.jsx';

createRoot(document.getElementById('root')).render(<App />);

// Keep the Qollab run alive until a terminal state: the IonQ job finished, no backend,
// backend_info failed, or the idle keep-alive bound passed with no job in flight.
await runDone;

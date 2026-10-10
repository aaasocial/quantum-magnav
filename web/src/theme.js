// JS mirror of the UI-SPEC series tokens (canvas and SVG drawing read colours from here).
// Hex literals live only here and in app.css :root.

const EST_MAP_DASH = '8 5';

export const TRUTH = { key: 'truth', label: 'Truth (stinger)', color: '#F5F5F5', dash: '', mapDash: '' };
export const DR = { key: 'dead_reckoning', label: 'Dead reckoning (no GPS, no map)', color: '#009E73', dash: null, mapDash: '1 4' };

export const SERIES = {
  raw: { key: 'raw', label: 'Raw cabin', color: '#D55E00', dash: '2 3', mapDash: EST_MAP_DASH },
  lowpass: { key: 'lowpass', label: 'Low-pass', color: '#CC79A7', dash: '10 3 2 3', mapDash: EST_MAP_DASH },
  tl: { key: 'tl', label: 'Tolles-Lawson (TL)', color: '#56B4E9', dash: '8 4', mapDash: EST_MAP_DASH },
  tl_currents: { key: 'tl_currents', label: 'TL + currents', color: '#0072B2', dash: '12 3 3 3 3 3', mapDash: EST_MAP_DASH },
  krr: { key: 'krr', label: 'Classical KRR', color: '#E69F00', dash: '4 4', mapDash: EST_MAP_DASH },
  quantum: { key: 'quantum', label: 'Quantum slot (stub until Phase 4)', color: '#F0E442', dash: '1 5', mapDash: EST_MAP_DASH },
  truth: TRUTH,
  dead_reckoning: DR,
};

// Denoiser series in display order (truth and dead reckoning are separate).
export const SERIES_ORDER = ['raw', 'lowpass', 'tl', 'tl_currents', 'krr', 'quantum'];

export const SENSOR_LABELS = { mag_5_uc: 'Mag 5', mag_4_uc: 'Mag 4 (hard case)' };
export const LINE_LABELS = { '1003.02': '1003.02 (Eastern map)', '1007.06': '1007.06 (Renfrew map)' };

export const JAM_COLOR = '#FFD166';
export const CASING = '#000000';
export const INVALID_BASE = '#24282F';
export const INVALID_STRIPE = '#3A3F47';
export const TEXT_COLOR = '#E8EAED';

// Chart chrome (mirrors app.css --color-border, --color-text-muted, --color-accent).
export const GRID = '#3A404C';
export const MUTED = '#A9B0BB';
export const ACCENT = '#A5B4FC';

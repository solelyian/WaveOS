// --- WaveOS design tokens ---
// Single source for material, motion and accent. Apps must consume these,
// never invent one-off radii/glass/accent values.

export const ACCENT = '#00C2FF'; // WaveOS cyan (from logo)
export const ACCENT_DEEP = '#0090C8';

export const SPRINGS = {
  morph: { type: 'spring', stiffness: 400, damping: 28, mass: 0.85, bounce: 0.15 },
  shade: { type: 'spring', stiffness: 350, damping: 30, mass: 0.8 },
  island: { type: 'spring', stiffness: 400, damping: 30 },
  snappy: { type: 'spring', stiffness: 520, damping: 34 },
  soft: { type: 'spring', stiffness: 260, damping: 26 },
} as const;

// Radius scale — the only radii allowed in the system.
export const RADIUS = {
  sm: 'rounded-[12px]',
  md: 'rounded-[20px]',
  lg: 'rounded-[28px]',
  xl: 'rounded-[36px]',
} as const;

// Glass elevations. `low` for chrome over busy surfaces (stronger blur + scrim
// for legibility), `high` for cards/sheets. `button` for controls.
export const GLASS = {
  low: 'bg-black/30 border border-white/15 shadow-[inset_0_1px_0_rgba(255,255,255,0.22),0_10px_40px_rgba(0,0,0,0.25)] backdrop-blur-[14px] backdrop-saturate-[150%]',
  high: 'bg-white/85 border border-white/70 shadow-[0_4px_20px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.9)] backdrop-blur-[10px] backdrop-saturate-[140%]',
  darkHigh: 'bg-black/40 border border-white/15 shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_10px_40px_rgba(0,0,0,0.35)] backdrop-blur-[14px] backdrop-saturate-[150%]',
  button:
    'bg-white/10 active:bg-white/25 border border-white/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] backdrop-blur-md backdrop-saturate-150 transition-colors duration-200',
  tile: 'bg-white/10 border border-white/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.35)] backdrop-blur-[10px] backdrop-saturate-[140%]',
} as const;

export const WALLPAPERS = [
  { id: 'wave-dark', src: '/wallpapers/wave-dark.png', label: 'Wave' },
  { id: 'wave-aurora', src: '/wallpapers/wave-aurora.png', label: 'Aurora' },
] as const;

// App window morph target radius — matches the hardware bezel curve.
export const WINDOW_RADIUS = 60;
export const ICON_RADIUS = 22;

// Screen metrics of the simulated device (inner bezel).
export const SCREEN = { w: 400, h: 850 };
export const SWITCHER = { cardScale: 0.32, cardGap: 28, top: 170, padLeft: 36 };

export const MIN_TOUCH = 44; // px — minimum hit target

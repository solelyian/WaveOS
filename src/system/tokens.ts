// --- WaveOS design tokens ---
// Single source for material, motion and accent. Apps must consume these,
// never invent one-off radii/glass/accent values.

export const ACCENT = '#00C2FF'; // WaveOS cyan (from logo)
export const ACCENT_DEEP = '#0090C8';

export const SPRINGS = {
  // Window morphs: long, buttery, critically-damped — no visible bounce on
  // open/close, content glides as one surface.
  morph: { type: 'spring', stiffness: 280, damping: 32, mass: 0.9 },
  shade: { type: 'spring', stiffness: 350, damping: 30, mass: 0.8 },
  island: { type: 'spring', stiffness: 400, damping: 30 },
  snappy: { type: 'spring', stiffness: 520, damping: 34 },
  soft: { type: 'spring', stiffness: 260, damping: 26 },
  // Press feedback on controls: quick in, quick out.
  tap: { type: 'spring', stiffness: 600, damping: 32 },
} as const;

// Radius scale — the only radii allowed in the system.
export const RADIUS = {
  sm: 'rounded-[12px]',
  md: 'rounded-[20px]',
  lg: 'rounded-[28px]',
  xl: 'rounded-[36px]',
} as const;

// Glass elevations — "Liquid Glass": translucent white material over a strong
// backdrop blur, specular top edge (inset highlight), thin bright border and
// deep ambient shadow. `low` for chrome over the wallpaper, `darkHigh` for
// tiles on dark apps/shades, `high` for bars on light apps, `button`/`tile`
// for controls. `button` stays legible on both themes.
export const GLASS = {
  low: 'bg-white/[0.10] border border-white/[0.20] shadow-[inset_0_1px_0_rgba(255,255,255,0.30),inset_0_-1px_0_rgba(255,255,255,0.06),0_12px_40px_rgba(0,0,0,0.35)] backdrop-blur-2xl backdrop-saturate-[170%]',
  high: 'bg-white/[0.72] border border-white/70 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_8px_28px_rgba(0,0,0,0.12)] backdrop-blur-2xl backdrop-saturate-[180%]',
  darkHigh:
    'bg-white/[0.10] border border-white/[0.18] shadow-[inset_0_1px_0_rgba(255,255,255,0.26),inset_0_-1px_0_rgba(255,255,255,0.05),0_16px_48px_rgba(0,0,0,0.45)] backdrop-blur-2xl backdrop-saturate-[170%]',
  button:
    'bg-white/[0.14] active:bg-white/[0.30] border border-white/[0.30] shadow-[inset_0_1px_0_rgba(255,255,255,0.45)] backdrop-blur-xl backdrop-saturate-[160%] transition-colors duration-200',
  tile: 'bg-white/[0.12] border border-white/[0.20] shadow-[inset_0_1px_0_rgba(255,255,255,0.34)] backdrop-blur-xl backdrop-saturate-[160%]',
} as const;

// Specular sheen overlaid inside glass surfaces — the "liquid" highlight that
// sells the material. Parent must be relative + overflow-hidden (or use
// rounded-[inherit] on this layer).
export const SHEEN =
  'absolute inset-0 rounded-[inherit] bg-gradient-to-b from-white/[0.22] via-white/[0.06] to-transparent pointer-events-none';

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

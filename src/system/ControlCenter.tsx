import React from 'react';
import { motion } from 'framer-motion';
import {
  Wifi,
  Signal,
  Bluetooth,
  Plane,
  Sun,
  Volume2,
  Moon as MoonIcon,
  Flashlight,
  Calculator,
  Camera,
  RotateCcw,
  ScreenShare,
  Home,
  SkipBack,
  SkipForward,
  Pause,
  Music,
  Disc,
} from 'lucide-react';
import { useOS } from './OSContext';
import { GLASS, SPRINGS } from './tokens';

// Tap feedback: the control presses in (scale spring) while a translucent
// halo blooms outward past its bounds and a soft inner flash lifts the
// surface — this is what makes the glass feel "lit" rather than flat.
const GLOW = {
  cyan: 'rgba(0,194,255,0.55)',
  white: 'rgba(255,255,255,0.5)',
  indigo: 'rgba(129,140,248,0.55)',
  yellow: 'rgba(250,204,21,0.45)',
} as const;

const PressGlow: React.FC<
  React.PropsWithChildren<{
    onClick?: () => void;
    tint?: keyof typeof GLOW;
    className?: string;
    label?: string;
    pressed?: boolean;
    pill?: boolean; // circular control vs rounded tile
  }>
> = ({ children, onClick, tint = 'white', className = '', label, pressed, pill }) => {
  const [flash, setFlash] = React.useState(0);
  return (
    <motion.button
      whileTap={{ scale: 0.86 }}
      transition={SPRINGS.tap}
      onPointerDown={() => setFlash((f) => f + 1)}
      onClick={onClick}
      aria-label={label}
      aria-pressed={pressed}
      className={`relative ${className}`}
    >
      {flash > 0 && (
        <motion.span
          key={`halo-${flash}`}
          initial={{ opacity: 0.9, scale: 0.45 }}
          animate={{ opacity: 0, scale: 1.7 }}
          transition={{ duration: 0.65, ease: [0.16, 0.8, 0.3, 1] }}
          onAnimationComplete={() => setFlash(0)}
          className={`absolute -inset-3 ${pill ? 'rounded-full' : 'rounded-[36px]'} pointer-events-none`}
          style={{ background: `radial-gradient(closest-side, ${GLOW[tint]} 0%, transparent 72%)`, filter: 'blur(8px)' }}
        />
      )}
      {flash > 0 && (
        <motion.span
          key={`inner-${flash}`}
          initial={{ opacity: 0.32 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 0.28, ease: 'easeOut' }}
          className={`absolute inset-0 ${pill ? 'rounded-full' : 'rounded-[28px]'} bg-white pointer-events-none`}
        />
      )}
      {children}
    </motion.button>
  );
};

// Every control is wired: radios and Focus drive the status bar, flashlight
// lights the screen edge, quick actions launch their apps, brightness dims
// the whole device.
export const ControlCenter: React.FC = () => {
  const ctx = useOS();
  const { t } = ctx;

  const radioBtn = (active: boolean) =>
    `rounded-full flex items-center justify-center transition-colors aspect-square w-full h-full ${
      active
        ? 'bg-wave-cyan text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)]'
        : 'bg-white/10 text-white/60 border border-white/15 shadow-[inset_0_1px_0_rgba(255,255,255,0.15)]'
    }`;

  return (
    <motion.div
      initial={{ y: '-100%' }}
      animate={{ y: '0%' }}
      exit={{ y: '-100%' }}
      transition={SPRINGS.shade}
      drag="y"
      dragConstraints={{ top: 0, bottom: 0 }}
      onDragEnd={(e, { offset, velocity }) => {
        if (offset.y < -100 || velocity.y < -500) ctx.setShade(null);
      }}
      className="absolute inset-0 z-[200] bg-black/25 backdrop-blur-[14px] backdrop-saturate-[130%] p-6 pt-16 flex flex-col gap-5 text-white"
    >
      <div className="grid grid-cols-2 gap-4 h-[160px]">
        {/* Connectivity */}
        <div className={`${GLASS.darkHigh} rounded-[28px] p-3 grid grid-cols-2 grid-rows-2 gap-3`}>
          <PressGlow pill tint={ctx.wifi && !ctx.airplane ? 'cyan' : 'white'} onClick={() => ctx.setWifi(!ctx.wifi)} label="Wi-Fi" pressed={ctx.wifi && !ctx.airplane} className={radioBtn(ctx.wifi && !ctx.airplane)}>
            <Wifi size={20} />
          </PressGlow>
          <PressGlow pill tint={ctx.cellular && !ctx.airplane ? 'cyan' : 'white'} onClick={() => ctx.setCellular(!ctx.cellular)} label="Cellular" pressed={ctx.cellular && !ctx.airplane} className={radioBtn(ctx.cellular && !ctx.airplane)}>
            <Signal size={20} />
          </PressGlow>
          <PressGlow pill tint={ctx.bluetooth && !ctx.airplane ? 'cyan' : 'white'} onClick={() => ctx.setBluetooth(!ctx.bluetooth)} label="Bluetooth" pressed={ctx.bluetooth && !ctx.airplane} className={radioBtn(ctx.bluetooth && !ctx.airplane)}>
            <Bluetooth size={20} />
          </PressGlow>
          <PressGlow pill tint={ctx.airplane ? 'cyan' : 'white'} onClick={() => ctx.setAirplane(!ctx.airplane)} label="Airplane mode" pressed={ctx.airplane} className={radioBtn(ctx.airplane)}>
            <Plane size={20} />
          </PressGlow>
        </div>

        {/* Media */}
        <div className={`${GLASS.darkHigh} rounded-[28px] overflow-hidden relative`}>
          {ctx.isPlaying ? (
            <>
              <img
                src="https://images.unsplash.com/photo-1493225255756-d9584f8606e9?w=300"
                alt=""
                className="absolute inset-0 w-full h-full object-cover opacity-70"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent p-4 flex flex-col justify-end">
                <div className="text-sm font-bold truncate">Midnight City</div>
                <div className="text-xs opacity-80 truncate mb-3">M83</div>
                <div className="flex justify-between items-center">
                  <SkipBack size={20} className="fill-white" />
                  <PressGlow pill onClick={() => ctx.setIsPlaying(false)} label="Pause" className="p-1.5 rounded-full">
                    <Pause size={24} fill="white" />
                  </PressGlow>
                  <SkipForward size={20} className="fill-white" />
                </div>
              </div>
            </>
          ) : (
            <PressGlow onClick={() => ctx.openApp('music')} className="flex flex-col items-center justify-center h-full w-full gap-2 opacity-60 rounded-[28px]">
              <Music size={36} />
              <span className="text-xs font-bold uppercase tracking-widest">{t('cc.notPlaying')}</span>
            </PressGlow>
          )}
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 h-[180px]">
        {/* Brightness */}
        <div className={`col-span-1 relative ${GLASS.darkHigh} rounded-[28px] overflow-hidden`} role="slider" aria-label={t('cc.brightness')} aria-valuenow={ctx.brightness}>
          <motion.div className="absolute bottom-0 inset-x-0 bg-white/90" style={{ height: `${ctx.brightness}%` }} />
          <div className="absolute inset-0 flex flex-col items-center justify-end pb-5 pointer-events-none mix-blend-difference text-white">
            <Sun size={24} />
          </div>
          <input
            type="range"
            min={15}
            max={100}
            value={ctx.brightness}
            onChange={(e) => ctx.setBrightness(Number(e.target.value))}
            className="absolute inset-0 w-full h-full opacity-0 cursor-ns-resize z-20"
            aria-label={t('cc.brightness')}
          />
        </div>

        {/* Volume */}
        <div className={`col-span-1 relative ${GLASS.darkHigh} rounded-[28px] overflow-hidden`} role="slider" aria-label={t('cc.volume')} aria-valuenow={ctx.volume}>
          <motion.div className="absolute bottom-0 inset-x-0 bg-white/90" style={{ height: `${ctx.volume}%` }} />
          <div className="absolute inset-0 flex flex-col items-center justify-end pb-5 pointer-events-none mix-blend-difference text-white">
            <Volume2 size={24} />
          </div>
          <input
            type="range"
            min={0}
            max={100}
            value={ctx.volume}
            onChange={(e) => ctx.setVolume(Number(e.target.value))}
            className="absolute inset-0 w-full h-full opacity-0 cursor-ns-resize z-20"
            aria-label={t('cc.volume')}
          />
        </div>

        {/* Focus / Rotation / Cast */}
        <div className="col-span-2 grid grid-cols-2 grid-rows-2 gap-4">
          <PressGlow
            onClick={() => ctx.setFocus(!ctx.focus)}
            pressed={ctx.focus}
            tint={ctx.focus ? 'indigo' : 'white'}
            className={`col-span-2 rounded-[28px] flex items-center justify-between px-4 transition-colors ${
              ctx.focus ? 'bg-indigo-500/80 border border-indigo-300/40' : `${GLASS.darkHigh} active:bg-white/10`
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`p-1.5 rounded-full ${ctx.focus ? 'bg-white text-indigo-600' : 'bg-indigo-500'} shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)]`}>
                <MoonIcon size={16} className={ctx.focus ? '' : 'fill-white text-white'} />
              </div>
              <span className="text-sm font-medium">{t('cc.focus')}</span>
            </div>
          </PressGlow>
          <PressGlow
            onClick={() => {
              ctx.setRotationLock(!ctx.rotationLock);
              ctx.pushToast(t(ctx.rotationLock ? 'toast.rotationUnlocked' : 'toast.rotationLocked'));
            }}
            pressed={ctx.rotationLock}
            tint={ctx.rotationLock ? 'cyan' : 'white'}
            className={`rounded-[28px] flex items-center justify-center transition-colors ${
              ctx.rotationLock ? 'bg-white text-black' : `${GLASS.darkHigh} active:bg-white/10`
            }`}
          >
            <RotateCcw size={24} />
          </PressGlow>
          <PressGlow
            onClick={() => ctx.pushToast(t('cc.noDevices'))}
            className={`${GLASS.darkHigh} rounded-[28px] flex items-center justify-center active:bg-white/10 transition-colors`}
          >
            <ScreenShare size={24} />
          </PressGlow>
        </div>
      </div>

      {/* Utilities */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { icon: Flashlight, active: ctx.flashlight, fn: () => ctx.setFlashlight(!ctx.flashlight), label: 'Flashlight' },
          { icon: Calculator, active: false, fn: () => ctx.openApp('calculator'), label: t('app.calculator') },
          { icon: Camera, active: false, fn: () => ctx.openApp('photos'), label: 'Camera' },
          { icon: Disc, active: false, fn: () => ctx.pushToast(t('cc.recording')), label: 'Screen record' },
        ].map((item, i) => (
          <PressGlow
            pill
            key={i}
            onClick={item.fn}
            label={item.label}
            pressed={item.active}
            tint={item.active ? 'cyan' : 'white'}
            className={`aspect-square rounded-full flex items-center justify-center transition-all ${
              item.active ? 'bg-white text-black' : `${GLASS.darkHigh} text-white active:bg-white/20`
            }`}
          >
            <item.icon size={24} />
          </PressGlow>
        ))}
      </div>

      {/* Smart Home */}
      <PressGlow
        onClick={() => ctx.pushToast(t('cc.scenesActive'))}
        tint="yellow"
        className={`h-16 ${GLASS.darkHigh} rounded-[28px] flex items-center justify-between px-6 mt-auto active:bg-white/10 transition-colors`}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-yellow-500/20 rounded-full text-yellow-400 border border-yellow-500/30">
            <Home size={20} />
          </div>
          <span className="text-sm font-bold opacity-90">{t('cc.home')}</span>
        </div>
        <div className="text-xs font-medium opacity-50">{t('cc.scenesActive')}</div>
      </PressGlow>

      <div className="w-full flex justify-center pb-2 opacity-30 mt-2">
        <div className="w-12 h-1 bg-white rounded-full" />
      </div>
    </motion.div>
  );
};

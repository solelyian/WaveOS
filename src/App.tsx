import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { OSProvider, useOS } from './system/OSContext';
import { WALLPAPERS, SPRINGS } from './system/tokens';
import { StatusBar } from './system/StatusBar';
import { BootScreen } from './system/BootScreen';
import { LockScreen } from './system/LockScreen';
import { HomeScreen } from './system/HomeScreen';
import { AppLayer } from './system/AppLayer';
import { FlowIsland } from './system/FlowIsland';
import { ControlCenter } from './system/ControlCenter';
import { NotificationCenter } from './system/NotificationCenter';
import { GestureLayer } from './system/GestureLayer';
import { HomeIndicator } from './system/HomeIndicator';
import { Keyboard } from './system/Keyboard';
import { Toast } from './system/Toast';

const Shell: React.FC = () => {
  const { booted, locked, activeApp, shade, switcherOpen, wallpaper, brightness, flashlight } = useOS();

  return (
    <div className="w-full h-screen bg-[#020617] flex items-center justify-center font-sans overflow-hidden select-none">
      {/* Hardware bezel */}
      <div
        data-bezel
        className="relative w-full max-w-[400px] h-[850px] bg-black rounded-[60px] shadow-[0_0_0_12px_#111,0_0_0_14px_#222,0_50px_100px_-20px_rgba(0,0,0,0.8)] overflow-hidden ring-4 ring-white/10"
      >
        {/* Wallpaper */}
        <motion.div
          className="absolute inset-0 bg-cover bg-center z-0"
          style={{ backgroundImage: `url(${WALLPAPERS[wallpaper].src})` }}
          animate={{
            scale: activeApp || shade || switcherOpen ? 1.05 : locked ? 1.1 : 1,
            filter:
              locked || shade
                ? 'blur(10px) brightness(0.7) saturate(1.2)'
                : activeApp || switcherOpen
                  ? 'blur(4px) brightness(0.6)'
                  : 'blur(0px) brightness(1)',
          }}
          transition={SPRINGS.shade}
        />

        {/* SpringBoard — sinks back behind apps/shades */}
        <motion.div
          className="h-full w-full absolute inset-0 z-10"
          animate={{
            scale: locked ? 0.9 : activeApp ? 0.95 : shade || switcherOpen ? 0.9 : 1,
            opacity: locked ? 0 : activeApp ? 0.5 : 1,
          }}
          transition={SPRINGS.morph}
        >
          <HomeScreen />
        </motion.div>

        {/* Windows + app switcher */}
        <AppLayer />

        {/* Flashlight edge glow */}
        <AnimatePresence>
          {flashlight && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-[95] pointer-events-none"
              style={{
                background:
                  'radial-gradient(ellipse at 50% 0%, rgba(255,255,240,0.28), transparent 55%), radial-gradient(ellipse at 50% 100%, rgba(255,255,240,0.12), transparent 50%)',
              }}
            />
          )}
        </AnimatePresence>

        <StatusBar />
        <GestureLayer />
        <FlowIsland />

        <AnimatePresence>
          {shade === 'control' && <ControlCenter key="cc" />}
          {shade === 'notifications' && <NotificationCenter key="nc" />}
        </AnimatePresence>

        <HomeIndicator />
        <Keyboard />
        <Toast />

        {/* System brightness dims the whole device */}
        <div
          className="absolute inset-0 z-[600] bg-black pointer-events-none transition-opacity duration-200"
          style={{ opacity: ((100 - brightness) / 100) * 0.55 }}
        />

        <AnimatePresence>
          {locked && booted && (
            <motion.div key="lock" exit={{ opacity: 0, transition: { duration: 0.3 } }}>
              <LockScreen />
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>{!booted && <BootScreen key="boot" />}</AnimatePresence>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <OSProvider>
      <Shell />
    </OSProvider>
  );
}

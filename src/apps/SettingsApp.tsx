import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wifi,
  Bluetooth,
  Signal,
  Globe,
  Bell,
  Volume2,
  Moon,
  Sun,
  Languages,
  Info,
  ChevronLeft,
  Check,
} from 'lucide-react';
import { useOS } from '../system/OSContext';
import { NavBar, ListRow, Toggle, Wordmark } from '../ui/kit';
import { GLASS, WALLPAPERS } from '../system/tokens';
import { Lang } from '../system/i18n';

type Page = 'root' | 'wifi' | 'bluetooth' | 'notifications' | 'sounds' | 'focus' | 'display' | 'language' | 'about';

const Card: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="bg-white rounded-[28px] overflow-hidden shadow-sm border border-gray-100">{children}</div>
);

// Full settings tree: every row opens a real sub-page, language picker drives
// the whole OS, wallpaper picker changes the shell background.
const SettingsApp: React.FC = () => {
  const ctx = useOS();
  const { t } = ctx;
  const [page, setPage] = useState<Page>('root');
  const [haptics, setHaptics] = useState(true);

  const back = page === 'root' ? undefined : () => setPage('root');
  const pageTitle = (p: Page): string =>
    (
      {
        wifi: 'settings.wifi',
        bluetooth: 'settings.bluetooth',
        notifications: 'settings.notifications',
        sounds: 'settings.sounds',
        focus: 'settings.focus',
        display: 'settings.display',
        language: 'settings.language',
        about: 'settings.about',
      } as Record<string, string>
    )[p] ?? 'app.settings';

  return (
    <div className="h-full w-full flex flex-col relative">
      <NavBar title={t(pageTitle(page))} large={page === 'root'} onBack={back} />
      {page === 'root' && (
        <div className="px-6 mb-4 mt-2">
          <div className="h-10 bg-white rounded-[14px] shadow-sm border border-gray-100 flex items-center px-3 gap-2 text-gray-400">
            <Info size={16} className="opacity-0" />
            <span className="text-sm">{t('settings.search')}</span>
          </div>
        </div>
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={page}
          initial={{ opacity: 0, x: page === 'root' ? -30 : 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: page === 'root' ? -30 : 30 }}
          transition={{ duration: 0.18 }}
          className="flex-1 overflow-y-auto no-scrollbar px-6 pb-10 space-y-5"
        >
          {page === 'root' && (
            <>
              <button onClick={() => setPage('about')} className="w-full bg-white p-5 rounded-[28px] shadow-sm border border-gray-100 flex items-center gap-4 text-left active:scale-[0.98] transition-transform">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-wave-cyan to-wave-deep flex items-center justify-center text-white text-xl font-bold shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)]">
                  JD
                </div>
                <div className="flex-1">
                  <div className="text-xl font-bold text-black/90">John Doe</div>
                  <div className="text-sm text-black/50 font-medium">{t('settings.profile')}</div>
                </div>
                <ChevronLeft className="rotate-180 text-gray-300" />
              </button>

              <Card>
                <ListRow first icon={Wifi} label={t('settings.wifi')} value={ctx.wifi ? 'Home_5G' : t('settings.off')} onClick={() => setPage('wifi')} />
                <ListRow icon={Bluetooth} label={t('settings.bluetooth')} value={t(ctx.bluetooth ? 'settings.on' : 'settings.off')} onClick={() => setPage('bluetooth')} />
                <ListRow icon={Signal} iconColor="bg-green-500" label={t('settings.cellular')} value={t(ctx.cellular ? 'settings.on' : 'settings.off')} />
                <ListRow icon={Globe} label={t('settings.hotspot')} value={t('settings.off')} />
              </Card>

              <Card>
                <ListRow first icon={Bell} iconColor="bg-red-500" label={t('settings.notifications')} onClick={() => setPage('notifications')} />
                <ListRow icon={Volume2} iconColor="bg-pink-500" label={t('settings.sounds')} onClick={() => setPage('sounds')} />
                <ListRow icon={Moon} iconColor="bg-indigo-500" label={t('settings.focus')} value={t(ctx.focus ? 'settings.on' : 'settings.off')} onClick={() => setPage('focus')} />
              </Card>

              <Card>
                <ListRow first icon={Sun} iconColor="bg-amber-500" label={t('settings.display')} onClick={() => setPage('display')} />
                <ListRow icon={Languages} iconColor="bg-wave-deep" label={t('settings.language')} value={t(`settings.langName.${ctx.lang}`)} onClick={() => setPage('language')} />
                <ListRow icon={Info} iconColor="bg-gray-500" label={t('settings.about')} onClick={() => setPage('about')} />
              </Card>
            </>
          )}

          {page === 'wifi' && (
            <Card>
              <ListRow first label={t('settings.wifi')} trailing={<Toggle on={ctx.wifi} onChange={ctx.setWifi} label="Wi-Fi" />} />
              <div className="px-4 pt-2 pb-1 text-xs font-bold text-black/40 uppercase tracking-wider">{t('settings.networks')}</div>
              {['Home_5G', 'Nyne Office', 'Cafe Guest'].map((n, i) => (
                <div key={n} className={`flex items-center gap-3 px-4 py-3 ${i === 0 ? '' : 'border-t border-black/5'}`}>
                  <Wifi size={16} className="text-black/60" />
                  <span className="flex-1 font-medium text-black/80 text-sm">{n}</span>
                  {i === 0 && ctx.wifi && <Check size={16} className="text-wave-deep" />}
                </div>
              ))}
            </Card>
          )}

          {page === 'bluetooth' && (
            <Card>
              <ListRow first label={t('settings.bluetooth')} trailing={<Toggle on={ctx.bluetooth} onChange={ctx.setBluetooth} label="Bluetooth" />} />
              <div className="px-4 pt-2 pb-1 text-xs font-bold text-black/40 uppercase tracking-wider">{t('settings.devices')}</div>
              {['WaveBuds Pro', 'Nyne Watch'].map((n, i) => (
                <div key={n} className={`flex items-center gap-3 px-4 py-3 border-t border-black/5`}>
                  <Bluetooth size={16} className="text-black/60" />
                  <span className="flex-1 font-medium text-black/80 text-sm">{n}</span>
                  <span className="text-xs text-black/40">{ctx.bluetooth && i === 0 ? t('settings.connected') : ''}</span>
                </div>
              ))}
            </Card>
          )}

          {page === 'notifications' && (
            <Card>
              {(['messages', 'mail', 'calendar', 'photos'] as const).map((app, i) => (
                <ListRow key={app} first={i === 0} label={t(`app.${app}`)} trailing={<Toggle on={true} onChange={() => {}} label={t(`app.${app}`)} />} />
              ))}
            </Card>
          )}

          {page === 'sounds' && (
            <Card>
              <div className="p-4 border-b border-black/5">
                <div className="text-sm font-semibold text-black/80 mb-3">{t('settings.volume')}</div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={ctx.volume}
                  onChange={(e) => ctx.setVolume(Number(e.target.value))}
                  className="w-full accent-wave-cyan"
                  aria-label={t('settings.volume')}
                />
              </div>
              <ListRow label={t('settings.haptics')} trailing={<Toggle on={haptics} onChange={setHaptics} label={t('settings.haptics')} />} />
            </Card>
          )}

          {page === 'focus' && (
            <Card>
              <ListRow first label={t('settings.focus')} trailing={<Toggle on={ctx.focus} onChange={ctx.setFocus} label={t('settings.focus')} />} />
              {['Do Not Disturb', 'Work', 'Sleep'].map((m, i) => (
                <button key={m} onClick={() => ctx.setFocus(true)} className={`w-full flex items-center gap-3 px-4 py-3 text-left border-t border-black/5 active:bg-black/5`}>
                  <Moon size={16} className="text-indigo-500" />
                  <span className="flex-1 font-medium text-black/80 text-sm">{m}</span>
                  {ctx.focus && i === 0 && <Check size={16} className="text-wave-deep" />}
                </button>
              ))}
            </Card>
          )}

          {page === 'display' && (
            <>
              <Card>
                <div className="p-4">
                  <div className="text-sm font-semibold text-black/80 mb-3">{t('settings.brightness')}</div>
                  <input
                    type="range"
                    min={15}
                    max={100}
                    value={ctx.brightness}
                    onChange={(e) => ctx.setBrightness(Number(e.target.value))}
                    className="w-full accent-wave-cyan"
                    aria-label={t('settings.brightness')}
                  />
                </div>
              </Card>
              <div className="text-xs font-bold text-black/40 uppercase tracking-wider px-2">{t('settings.wallpaper')}</div>
              <div className="grid grid-cols-2 gap-4">
                {WALLPAPERS.map((w, i) => (
                  <button
                    key={w.id}
                    onClick={() => ctx.setWallpaper(i)}
                    className={`relative aspect-[9/16] rounded-[20px] overflow-hidden border-2 transition-all ${
                      ctx.wallpaper === i ? 'border-wave-cyan scale-[1.02]' : 'border-transparent'
                    }`}
                  >
                    <img src={w.src} alt={w.label} className="w-full h-full object-cover" />
                    {ctx.wallpaper === i && (
                      <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-wave-cyan flex items-center justify-center">
                        <Check size={12} className="text-black" />
                      </div>
                    )}
                    <div className="absolute bottom-2 inset-x-0 text-center text-white text-xs font-bold drop-shadow">{w.label}</div>
                  </button>
                ))}
              </div>
            </>
          )}

          {page === 'language' && (
            <Card>
              {(['en', 'fr'] as Lang[]).map((l, i) => (
                <button
                  key={l}
                  onClick={() => ctx.setLang(l)}
                  className={`w-full flex items-center gap-3 px-4 py-4 text-left ${i === 0 ? '' : 'border-t border-black/5'} active:bg-black/5`}
                >
                  <Languages size={16} className="text-black/60" />
                  <span className="flex-1 font-medium text-black/80">{t(`settings.langName.${l}`)}</span>
                  {ctx.lang === l && <Check size={16} className="text-wave-deep" />}
                </button>
              ))}
            </Card>
          )}

          {page === 'about' && (
            <div className="flex flex-col items-center pt-8 gap-4">
              <div className={`w-24 h-24 rounded-[28px] bg-[#020617] flex items-center justify-center shadow-xl border border-white/10`}>
                <Wordmark size={15} />
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-black/90">WaveOS</div>
                <div className="text-sm text-black/50">{t('settings.version')} 0.1 · Concept</div>
                <div className="text-xs text-black/40 mt-1">Nyne Technologies</div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default SettingsApp;

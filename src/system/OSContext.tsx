import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { DragControls } from 'framer-motion';
import { Lang, localeOf, translate } from './i18n';

export type AppID =
  | 'photos'
  | 'music'
  | 'messages'
  | 'settings'
  | 'weather'
  | 'calculator'
  | 'mail'
  | 'calendar'
  | 'phone'
  | 'maps'
  | 'surf';

export type ShadeKind = 'notifications' | 'control';

export interface InputSink {
  get: () => string;
  set: (v: string) => void;
  onSubmit?: () => void;
  placeholder?: string;
}

export interface ToastMsg {
  id: number;
  text: string;
}

interface OSContextType {
  // boot / lock
  booted: boolean;
  setBooted: (v: boolean) => void;
  locked: boolean;
  unlock: () => void;
  lock: () => void;

  // window manager
  openApps: AppID[];
  activeApp: AppID | null;
  closingApp: AppID | null;
  openApp: (id: AppID) => void;
  closeActiveApp: () => void;
  focusApp: (id: AppID) => void;
  killApp: (id: AppID) => void;
  finishClosing: (id: AppID) => void;
  switcherOpen: boolean;
  setSwitcherOpen: (v: boolean) => void;
  iconRects: Map<AppID, { x: number; y: number; w: number; h: number }>;
  registerIconRect: (id: AppID, r: { x: number; y: number; w: number; h: number }) => void;

  // window drag (global home indicator drives the active window)
  windowControls: DragControls | null;
  setWindowControls: (c: DragControls | null) => void;

  // shades
  shade: ShadeKind | null;
  setShade: (s: ShadeKind | null) => void;

  // system state
  brightness: number;
  setBrightness: (v: number) => void;
  volume: number;
  setVolume: (v: number) => void;
  wifi: boolean;
  setWifi: (v: boolean) => void;
  cellular: boolean;
  setCellular: (v: boolean) => void;
  bluetooth: boolean;
  setBluetooth: (v: boolean) => void;
  airplane: boolean;
  setAirplane: (v: boolean) => void;
  focus: boolean;
  setFocus: (v: boolean) => void;
  flashlight: boolean;
  setFlashlight: (v: boolean) => void;
  rotationLock: boolean;
  setRotationLock: (v: boolean) => void;
  isPlaying: boolean;
  setIsPlaying: (v: boolean) => void;
  wallpaper: number;
  setWallpaper: (v: number) => void;

  // i18n
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string) => string;
  locale: string;

  // keyboard
  keyboardFor: string | null;
  openKeyboard: (id: string) => void;
  closeKeyboard: () => void;
  registerInput: (id: string, sink: InputSink) => void;
  unregisterInput: (id: string) => void;
  getInput: (id: string) => InputSink | undefined;

  // toasts
  toast: ToastMsg | null;
  pushToast: (text: string) => void;

  reduceMotion: boolean;
}

const OSContext = createContext<OSContextType>({} as OSContextType);

export const useOS = () => useContext(OSContext);

export const OSProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [booted, setBooted] = useState(false);
  const [locked, setLocked] = useState(true);
  const [openApps, setOpenApps] = useState<AppID[]>([]);
  const [activeApp, setActiveApp] = useState<AppID | null>(null);
  const [closingApp, setClosingApp] = useState<AppID | null>(null);
  const [switcherOpen, setSwitcherOpen] = useState(false);
  const [windowControls, setWindowControls] = useState<DragControls | null>(null);
  const [shade, setShade] = useState<ShadeKind | null>(null);

  const [brightness, setBrightness] = useState(85);
  const [volume, setVolume] = useState(50);
  const [wifi, setWifi] = useState(true);
  const [cellular, setCellular] = useState(true);
  const [bluetooth, setBluetooth] = useState(true);
  const [airplane, setAirplane] = useState(false);
  const [focus, setFocus] = useState(false);
  const [flashlight, setFlashlight] = useState(false);
  const [rotationLock, setRotationLock] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [wallpaper, setWallpaper] = useState(0);

  const [lang, setLang] = useState<Lang>('en');
  const [keyboardFor, setKeyboardFor] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastMsg | null>(null);
  const toastTimer = useRef<number>();

  const iconRects = useRef(new Map<AppID, { x: number; y: number; w: number; h: number }>());
  const inputs = useRef(new Map<string, InputSink>());

  const reduceMotion = useMemo(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches,
    []
  );

  const t = useCallback((key: string) => translate(lang, key), [lang]);
  const locale = localeOf(lang);

  const openApp = useCallback((id: AppID) => {
    setOpenApps((prev) => (prev.includes(id) ? prev : [...prev, id]));
    setClosingApp(null);
    setActiveApp(id);
    setShade(null);
    setSwitcherOpen(false);
  }, []);

  const closeActiveApp = useCallback(() => {
    setActiveApp((cur) => {
      setClosingApp(cur);
      return null;
    });
  }, []);

  const finishClosing = useCallback((id: AppID) => {
    setClosingApp((cur) => (cur === id ? null : cur));
  }, []);

  const focusApp = useCallback((id: AppID) => {
    setClosingApp(null);
    setActiveApp(id);
    setSwitcherOpen(false);
    setShade(null);
    setOpenApps((prev) => (prev.includes(id) ? prev : [...prev, id]));
  }, []);

  const killApp = useCallback(
    (id: AppID) => {
      setOpenApps((prev) => prev.filter((a) => a !== id));
      if (activeApp === id) setActiveApp(null);
      if (closingApp === id) setClosingApp(null);
    },
    [activeApp, closingApp]
  );

  const lock = useCallback(() => {
    setLocked(true);
    setActiveApp(null);
    setClosingApp(null);
    setSwitcherOpen(false);
    setShade(null);
    setKeyboardFor(null);
  }, []);

  const unlock = useCallback(() => setLocked(false), []);

  const openKeyboard = useCallback((id: string) => setKeyboardFor(id), []);
  const closeKeyboard = useCallback(() => setKeyboardFor(null), []);

  const registerInput = useCallback((id: string, sink: InputSink) => {
    inputs.current.set(id, sink);
  }, []);
  const unregisterInput = useCallback((id: string) => {
    inputs.current.delete(id);
  }, []);
  const getInput = useCallback((id: string) => inputs.current.get(id), []);

  const pushToast = useCallback((text: string) => {
    window.clearTimeout(toastTimer.current);
    setToast({ id: Date.now(), text });
    toastTimer.current = window.setTimeout(() => setToast(null), 2200);
  }, []);

  useEffect(() => () => window.clearTimeout(toastTimer.current), []);

  const value: OSContextType = {
    booted,
    setBooted,
    locked,
    unlock,
    lock,
    openApps,
    activeApp,
    closingApp,
    openApp,
    closeActiveApp,
    focusApp,
    killApp,
    finishClosing,
    switcherOpen,
    setSwitcherOpen,
    iconRects: iconRects.current,
    registerIconRect: (id, r) => iconRects.current.set(id, r),
    windowControls,
    setWindowControls,
    shade,
    setShade,
    brightness,
    setBrightness,
    volume,
    setVolume,
    wifi,
    setWifi,
    cellular,
    setCellular,
    bluetooth,
    setBluetooth,
    airplane,
    setAirplane,
    focus,
    setFocus,
    flashlight,
    setFlashlight,
    rotationLock,
    setRotationLock,
    isPlaying,
    setIsPlaying,
    wallpaper,
    setWallpaper,
    lang,
    setLang,
    t,
    locale,
    keyboardFor,
    openKeyboard,
    closeKeyboard,
    registerInput,
    unregisterInput,
    getInput,
    toast,
    pushToast,
    reduceMotion,
  };

  return <OSContext.Provider value={value}>{children}</OSContext.Provider>;
};

import React from 'react';
import {
  Sun,
  Calendar,
  Image as ImageIcon,
  Calculator,
  Settings,
  Map,
  Phone,
  Mail,
  MessageCircle,
  Music,
  Compass,
} from 'lucide-react';
import { AppID } from '../system/OSContext';
import WeatherApp from './WeatherApp';
import CalendarApp from './CalendarApp';
import PhotosApp from './PhotosApp';
import CalculatorApp from './CalculatorApp';
import SettingsApp from './SettingsApp';
import MapsApp from './MapsApp';
import PhoneApp from './PhoneApp';
import MailApp from './MailApp';
import MessagesApp from './MessagesApp';
import MusicApp from './MusicApp';
import SurfApp from './SurfApp';

export interface AppConfig {
  id: AppID;
  icon: React.ElementType;
  color: string;
  component: React.FC;
  theme?: 'light' | 'dark';
}

export const APPS: Record<AppID, AppConfig> = {
  weather: { id: 'weather', icon: Sun, color: 'bg-gradient-to-br from-sky-400 to-blue-600', component: WeatherApp, theme: 'dark' },
  calendar: { id: 'calendar', icon: Calendar, color: 'bg-gradient-to-br from-red-400 to-red-600', component: CalendarApp },
  photos: { id: 'photos', icon: ImageIcon, color: 'bg-gradient-to-br from-purple-400 to-pink-500', component: PhotosApp },
  calculator: { id: 'calculator', icon: Calculator, color: 'bg-gray-800', component: CalculatorApp, theme: 'dark' },
  settings: { id: 'settings', icon: Settings, color: 'bg-gray-600', component: SettingsApp },
  maps: { id: 'maps', icon: Map, color: 'bg-gradient-to-br from-green-400 to-green-600', component: MapsApp },
  phone: { id: 'phone', icon: Phone, color: 'bg-green-500', component: PhoneApp },
  mail: { id: 'mail', icon: Mail, color: 'bg-wave-cyan', component: MailApp },
  messages: { id: 'messages', icon: MessageCircle, color: 'bg-green-400', component: MessagesApp },
  music: { id: 'music', icon: Music, color: 'bg-gradient-to-br from-rose-500 to-red-600', component: MusicApp, theme: 'dark' },
  surf: { id: 'surf', icon: Compass, color: 'bg-gradient-to-br from-wave-cyan to-wave-deep', component: SurfApp },
};

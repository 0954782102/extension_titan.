
import React from 'react';
import { X, Wallpaper, RefreshCw, UploadCloud, Info, Clock as ClockIcon } from 'lucide-react';
import { WALLPAPERS } from '../constants';
import { ClockStyle } from '../types';

interface SettingsProps {
  onClose: () => void;
  currentWallpaper: string;
  onWallpaperChange: (url: string) => void;
  currentClockStyle: ClockStyle;
  onClockStyleChange: (style: ClockStyle) => void;
  onResetLayout: () => void;
}

const CLOCK_STYLES: { id: ClockStyle; name: string }[] = [
  { id: 'standard', name: 'Класика' },
  { id: 'minimal', name: 'Мінімал' },
  { id: 'analog', name: 'Аналоговий' },
  { id: 'cyber', name: 'Кіберпанк' },
  { id: 'glass-pill', name: 'Скляний' },
];

const Settings: React.FC<SettingsProps> = ({ 
  onClose, 
  currentWallpaper, 
  onWallpaperChange, 
  currentClockStyle,
  onClockStyleChange,
  onResetLayout 
}) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md animate-in fade-in zoom-in-95 duration-300">
      <div className="glass w-full max-w-3xl rounded-[40px] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.5)] border border-white/20">
        <div className="px-10 py-8 flex justify-between items-center border-b border-white/10 bg-white/5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 glass rounded-2xl flex items-center justify-center">
              <Wallpaper className="text-white" size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white tracking-tight">Налаштування</h2>
              <p className="text-xs text-white/40 uppercase tracking-widest font-bold mt-0.5">Air Hrome Ultimate</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-white/10 rounded-full transition-colors text-white/50 hover:text-white">
            <X size={28} />
          </button>
        </div>

        <div className="p-10 space-y-10 max-h-[70vh] overflow-y-auto custom-scrollbar">
          {/* Wallpaper Selection */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-white/60 text-xs font-black uppercase tracking-[0.2em]">Вибір фону</h3>
              <div className="flex items-center gap-2 text-[10px] text-blue-400 font-bold bg-blue-400/10 px-3 py-1 rounded-full border border-blue-400/20">
                <Info size={12} />
                ПІДТРИМКА GIF ТА DRAG-N-DROP
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {WALLPAPERS.map((url, idx) => (
                <button
                  key={idx}
                  onClick={() => onWallpaperChange(url)}
                  className={`group relative aspect-video rounded-2xl overflow-hidden border-4 transition-all duration-300 ${
                    currentWallpaper === url ? 'border-blue-500 scale-95 shadow-[0_0_20px_rgba(59,130,246,0.3)]' : 'border-transparent opacity-60 hover:opacity-100 hover:scale-[1.02]'
                  }`}
                >
                  <img src={url} alt={`Wallpaper ${idx}`} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
              <div className="aspect-video rounded-2xl border-2 border-dashed border-white/20 flex flex-col items-center justify-center gap-2 text-white/30 hover:text-white/60 hover:border-white/40 transition-all bg-white/5 cursor-pointer">
                <UploadCloud size={24} />
                <span className="text-[10px] font-bold uppercase text-center px-4">Перетягніть файл</span>
              </div>
            </div>
          </div>

          {/* Clock Style Selection */}
          <div className="space-y-6">
            <h3 className="text-white/60 text-xs font-black uppercase tracking-[0.2em]">Стиль годинника</h3>
            <div className="grid grid-cols-5 gap-3">
              {CLOCK_STYLES.map((style) => (
                <button
                  key={style.id}
                  onClick={() => onClockStyleChange(style.id)}
                  className={`flex flex-col items-center gap-3 p-4 rounded-2xl border-2 transition-all ${
                    currentClockStyle === style.id 
                      ? 'border-white bg-white/10 shadow-lg' 
                      : 'border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="w-10 h-10 flex items-center justify-center rounded-xl glass">
                    <ClockIcon size={20} className={currentClockStyle === style.id ? 'text-white' : 'text-white/40'} />
                  </div>
                  <span className={`text-[10px] font-black uppercase tracking-widest ${currentClockStyle === style.id ? 'text-white' : 'text-white/40'}`}>
                    {style.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Reset Layout */}
          <div className="pt-8 border-t border-white/10 flex items-center justify-between bg-white/2 p-6 rounded-3xl">
            <div>
              <p className="font-black text-lg">Скинути макет</p>
              <p className="text-sm text-white/40">Повернути всі віджети на початкові позиції</p>
            </div>
            <button
              onClick={onResetLayout}
              className="flex items-center gap-3 bg-white text-black px-8 py-3 rounded-2xl font-black hover:bg-white/90 active:scale-95 transition-all shadow-xl"
            >
              <RefreshCw size={20} />
              Скинути
            </button>
          </div>
        </div>

        <div className="px-10 py-6 bg-white/5 flex justify-between items-center text-[11px] text-white/20 font-bold uppercase tracking-[0.3em]">
          <span>© 2025 Artem Protsko</span>
          <span>AirHrome Ultimate Edition</span>
        </div>
      </div>
    </div>
  );
};

export default Settings;

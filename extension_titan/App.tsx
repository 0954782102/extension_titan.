
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Settings as SettingsIcon, LayoutGrid, Share2 } from 'lucide-react';
import DraggableWidget from './components/DraggableWidget';
import Clock from './components/Clock';
import SearchBar from './components/SearchBar';
import Notepad from './components/Notepad';
import Settings from './components/Settings';
import Dock from './components/Dock';
import AISidebar from './components/AISidebar';
import FocusTimer from './components/FocusTimer';
import { Position, AppSettings, CustomAIService, CustomQuickApp, ClockStyle } from './types';
import { WALLPAPERS } from './constants';

const STORAGE_KEY = 'airhrome_ultimate_v4';

const App: React.FC = () => {
  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : {
      wallpaper: WALLPAPERS[0],
      note: '',
      clockStyle: 'standard',
      widgets: {
        notepad: { id: 'notepad', position: { x: 50, y: 150 }, isVisible: true },
        timer: { id: 'timer', position: { x: 50, y: 520 }, isVisible: true },
      },
      customAIServices: [],
      customQuickApps: []
    };
  });

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const dragCounter = useRef(0);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  const handlePositionChange = useCallback((id: string, pos: Position) => {
    setSettings(prev => ({
      ...prev,
      widgets: { ...prev.widgets, [id]: { ...prev.widgets[id], position: pos } }
    }));
  }, []);

  const handleAddCustomApp = (app: CustomQuickApp) => {
    setSettings(prev => ({
      ...prev,
      customQuickApps: [...(prev.customQuickApps || []), app]
    }));
  };

  const handleRemoveCustomApp = (id: string) => {
    setSettings(prev => ({
      ...prev,
      customQuickApps: (prev.customQuickApps || []).filter(a => a.id !== id)
    }));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingFile(false);
    dragCounter.current = 0;
    const file = e.dataTransfer.files[0];
    if (file && (file.type.startsWith('image/') || file.type === 'image/gif')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setSettings(prev => ({ ...prev, wallpaper: event.target?.result as string }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const resetLayout = () => {
    setSettings(prev => ({
      ...prev,
      widgets: {
        notepad: { id: 'notepad', position: { x: 50, y: 150 }, isVisible: true },
        timer: { id: 'timer', position: { x: 50, y: 520 }, isVisible: true },
      }
    }));
    setIsSettingsOpen(false);
  };

  return (
    <div 
      className={`relative w-screen h-screen overflow-hidden text-white bg-[#050505] ${isDraggingFile ? 'dragging' : ''}`}
      onDragEnter={(e) => { e.preventDefault(); dragCounter.current++; setIsDraggingFile(true); }}
      onDragLeave={(e) => { e.preventDefault(); dragCounter.current--; if(dragCounter.current === 0) setIsDraggingFile(false); }}
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
    >
      <div className="drag-overlay">
        <div className="text-center space-y-6">
          <div className="w-24 h-24 glass rounded-full flex items-center justify-center mx-auto shadow-2xl">
            <Share2 size={32} className="animate-pulse" />
          </div>
          <h2 className="text-3xl font-black">Новий фон активовано</h2>
        </div>
      </div>

      <div 
        className="absolute inset-0 z-0 transition-all duration-1000 ease-in-out"
        style={{
          backgroundImage: `url(${settings.wallpaper})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: (isSettingsOpen || isSidebarOpen) ? 'blur(20px) brightness(0.4)' : 'none'
        }}
      />

      <div className="relative z-10 w-full h-full flex flex-col p-8">
        <div className="absolute top-10 left-10 flex items-center gap-4 drop-shadow-2xl">
          <div className="w-12 h-12 glass flex items-center justify-center rounded-2xl border border-white/20">
            <span className="text-xl font-black">AH</span>
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight">Air Hrome</h1>
            <p className="text-[9px] opacity-40 uppercase tracking-[0.2em] font-bold">Artem Protsko</p>
          </div>
        </div>

        <div className="absolute top-10 right-10 flex items-center gap-4">
          <button onClick={() => setIsSidebarOpen(true)} className="p-4 glass rounded-2xl hover:bg-white/20 transition-all flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-widest hidden sm:block">AI Agents</span>
            <LayoutGrid size={22} />
          </button>
          <button onClick={() => setIsSettingsOpen(true)} className="p-4 glass rounded-2xl hover:bg-white/20 transition-all">
            <SettingsIcon size={22} />
          </button>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="mb-2">
            <Clock styleType={settings.clockStyle || 'standard'} />
          </div>
          <SearchBar />
        </div>

        <DraggableWidget id="notepad" initialPosition={settings.widgets.notepad.position} onPositionChange={handlePositionChange}>
          <Notepad value={settings.note} onChange={(v) => setSettings(p => ({ ...p, note: v }))} />
        </DraggableWidget>

        <DraggableWidget id="timer" initialPosition={settings.widgets.timer.position} onPositionChange={handlePositionChange}>
          <FocusTimer />
        </DraggableWidget>

        <Dock 
          customApps={settings.customQuickApps || []} 
          onAddApp={handleAddCustomApp} 
          onRemoveApp={handleRemoveCustomApp} 
        />
      </div>

      <AISidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        customServices={settings.customAIServices || []}
        onAddService={(s) => setSettings(p => ({ ...p, customAIServices: [...(p.customAIServices || []), s] }))}
        onRemoveService={(id) => setSettings(p => ({ ...p, customAIServices: (p.customAIServices || []).filter(s => s.id !== id) }))}
      />
      
      {isSettingsOpen && (
        <Settings
          onClose={() => setIsSettingsOpen(false)}
          currentWallpaper={settings.wallpaper}
          onWallpaperChange={(url) => setSettings(p => ({ ...p, wallpaper: url }))}
          currentClockStyle={settings.clockStyle || 'standard'}
          onClockStyleChange={(style) => setSettings(p => ({ ...p, clockStyle: style }))}
          onResetLayout={resetLayout}
        />
      )}
    </div>
  );
};

export default App;

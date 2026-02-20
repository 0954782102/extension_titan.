
import React, { useState } from 'react';
import { Plus, X, Globe, History, Download, Bookmark } from 'lucide-react';
import { QUICK_APPS } from '../constants';
import { CustomQuickApp } from '../types';

interface DockProps {
  customApps: CustomQuickApp[];
  onAddApp: (app: CustomQuickApp) => void;
  onRemoveApp: (id: string) => void;
}

const Dock: React.FC<DockProps> = ({ customApps, onAddApp, onRemoveApp }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');

  const systemApps = [
    { name: 'Історія', url: 'chrome://history', icon: <History size={24} /> },
    { name: 'Завантаження', url: 'chrome://downloads', icon: <Download size={24} /> },
    { name: 'Закладки', url: 'chrome://bookmarks', icon: <Bookmark size={24} /> },
  ];

  const handleNavigate = (url: string) => {
    // Chrome internal pages often require chrome.tabs API when in an extension context
    if (url.startsWith('chrome://')) {
      // Accessing chrome via window object to avoid "Cannot find name 'chrome'" error
      const win = window as any;
      if (win.chrome && win.chrome.tabs) {
        win.chrome.tabs.create({ url });
      } else {
        window.location.href = url;
      }
    } else {
      window.open(url, '_blank');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && url) {
      const formattedUrl = url.startsWith('http') || url.startsWith('chrome://') ? url : `https://${url}`;
      onAddApp({ id: Date.now().toString(), name, url: formattedUrl });
      setName('');
      setUrl('');
      setIsAdding(false);
    }
  };

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-4">
      {isAdding && (
        <form onSubmit={handleSubmit} className="glass-dark p-6 rounded-[28px] flex gap-3 shadow-3xl animate-in slide-in-from-bottom-4 duration-300 border border-white/10 mb-2">
          <input 
            autoFocus
            placeholder="Назва"
            value={name}
            onChange={e => setName(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none w-32"
          />
          <input 
            placeholder="URL (google.com)"
            value={url}
            onChange={e => setUrl(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none w-48"
          />
          <button type="submit" className="bg-white text-black px-4 py-2 rounded-xl font-bold text-xs hover:bg-white/90">Додати</button>
          <button type="button" onClick={() => setIsAdding(false)} className="p-2 glass rounded-xl hover:bg-white/10"><X size={16}/></button>
        </form>
      )}

      <div className="glass px-6 py-3 rounded-[32px] flex items-center gap-4 shadow-2xl border border-white/10">
        {/* System Apps */}
        <div className="flex gap-2 pr-4 border-r border-white/10">
           {systemApps.map(app => (
             <button 
                key={app.name} 
                onClick={() => handleNavigate(app.url)} 
                className="dock-item p-3 glass rounded-2xl hover:bg-white/10 transition-all group relative"
              >
                <div className="text-white/40 group-hover:text-white transition-colors">{app.icon}</div>
                <span className="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 glass rounded-lg text-[9px] font-bold opacity-0 group-hover:opacity-100 transition-all pointer-events-none uppercase tracking-tighter whitespace-nowrap">{app.name}</span>
             </button>
           ))}
        </div>

        {/* Default Apps */}
        <div className="flex gap-2">
          {QUICK_APPS.map((app) => (
            <button 
              key={app.name} 
              onClick={() => handleNavigate(app.url)} 
              className={`dock-item p-3 rounded-2xl group relative transition-all ${app.color}`}
            >
              {app.icon}
              <span className="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 glass rounded-lg text-[9px] font-bold opacity-0 group-hover:opacity-100 transition-all pointer-events-none uppercase tracking-tighter whitespace-nowrap">{app.name}</span>
            </button>
          ))}
        </div>

        {/* Custom Apps */}
        <div className="flex gap-2 border-l border-white/10 pl-2">
          {customApps.map((app) => (
            <div key={app.id} className="relative group dock-item">
              <button 
                onClick={() => handleNavigate(app.url)} 
                className="p-3 glass rounded-2xl hover:bg-white/10 flex items-center justify-center w-12 h-12"
              >
                <Globe size={20} className="text-purple-400" />
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); onRemoveApp(app.id); }}
                className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity z-10"
              >
                <X size={8} />
              </button>
              <span className="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 glass rounded-lg text-[9px] font-bold opacity-0 group-hover:opacity-100 transition-all pointer-events-none uppercase tracking-tighter whitespace-nowrap">{app.name}</span>
            </div>
          ))}

          <button 
            onClick={() => setIsAdding(true)}
            className="p-3 glass rounded-2xl hover:bg-white/10 text-white/30 hover:text-white transition-all w-12 h-12 flex items-center justify-center border-2 border-dashed border-white/10 hover:border-white/30"
          >
            <Plus size={24} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dock;

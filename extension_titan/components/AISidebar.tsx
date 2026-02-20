
import React, { useState } from 'react';
import { X, ChevronRight, LayoutGrid, Plus, Globe, Trash2 } from 'lucide-react';
import { AI_SERVICES } from '../constants';
import { CustomAIService } from '../types';

interface AISidebarProps {
  isOpen: boolean;
  onClose: () => void;
  customServices: CustomAIService[];
  onAddService: (service: CustomAIService) => void;
  onRemoveService: (id: string) => void;
}

const AISidebar: React.FC<AISidebarProps> = ({ isOpen, onClose, customServices, onAddService, onRemoveService }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newUrl, setNewUrl] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newName && newUrl) {
      const formattedUrl = newUrl.startsWith('http') ? newUrl : `https://${newUrl}`;
      onAddService({
        id: Date.now().toString(),
        name: newName,
        url: formattedUrl,
        desc: 'Користувацький сервіс'
      });
      setNewName('');
      setNewUrl('');
      setIsAdding(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[75] transition-opacity duration-300"
          onClick={onClose}
        />
      )}
      
      <div 
        className={`fixed top-0 right-0 h-full w-80 glass-dark z-[80] transition-transform duration-500 ease-[cubic-bezier(0.16, 1, 0.3, 1)] border-l border-white/10 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg shadow-lg">
                <LayoutGrid size={18} className="text-white" />
              </div>
              <h2 className="text-lg font-bold tracking-tight text-white">AI Компаньйони</h2>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/50 hover:text-white">
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
            {/* Built-in Services */}
            {AI_SERVICES.map((ai) => (
              <a
                key={ai.id}
                href={ai.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-4 glass rounded-[20px] hover:bg-white/10 transition-all border border-transparent hover:border-white/10 group relative overflow-hidden"
              >
                <div className="w-12 h-12 flex items-center justify-center glass rounded-xl shadow-inner group-hover:scale-110 transition-transform">
                  {ai.icon}
                </div>
                <div className="flex-1">
                  <div className="font-bold text-sm text-white/90">{ai.name}</div>
                  <div className="text-[10px] text-white/40 font-medium uppercase tracking-wider">{ai.desc}</div>
                </div>
                <ChevronRight size={14} className="text-white/20 group-hover:text-white/60 transition-colors" />
              </a>
            ))}

            {/* Custom User Services */}
            {customServices.map((ai) => (
              <div key={ai.id} className="relative group">
                <a
                  href={ai.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-4 glass rounded-[20px] hover:bg-white/10 transition-all border border-transparent hover:border-white/10 relative overflow-hidden"
                >
                  <div className="w-12 h-12 flex items-center justify-center glass rounded-xl shadow-inner group-hover:scale-110 transition-transform">
                    <Globe className="text-purple-400" size={22} />
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-sm text-white/90">{ai.name}</div>
                    <div className="text-[10px] text-white/40 font-medium uppercase tracking-wider">{ai.desc}</div>
                  </div>
                  <ChevronRight size={14} className="text-white/20 group-hover:text-white/60 transition-colors" />
                </a>
                <button 
                  onClick={(e) => { e.preventDefault(); onRemoveService(ai.id); }}
                  className="absolute -top-2 -right-2 p-1.5 bg-red-500/20 hover:bg-red-500 rounded-full text-white opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}

            {/* Add New Button or Form */}
            {!isAdding ? (
              <button
                onClick={() => setIsAdding(true)}
                className="w-full flex items-center justify-center gap-3 p-4 border-2 border-dashed border-white/10 rounded-[20px] text-white/30 hover:text-white hover:border-white/30 hover:bg-white/5 transition-all group"
              >
                <Plus size={20} className="group-hover:rotate-90 transition-transform" />
                <span className="text-xs font-bold uppercase tracking-widest">Додати сервіс</span>
              </button>
            ) : (
              <form onSubmit={handleAdd} className="p-4 glass rounded-[24px] space-y-3 animate-in slide-in-from-top-2 duration-300">
                <input
                  autoFocus
                  type="text"
                  placeholder="Назва сервісу"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-white/30"
                />
                <input
                  type="text"
                  placeholder="URL (напр. chat.openai.com)"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-white/30"
                />
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 bg-white text-black font-bold text-xs py-2 rounded-xl hover:bg-white/90 transition-colors"
                  >
                    Зберегти
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAdding(false)}
                    className="px-4 glass text-white/60 text-xs py-2 rounded-xl hover:text-white transition-colors"
                  >
                    Скасувати
                  </button>
                </div>
              </form>
            )}
          </div>

          <div className="p-6 border-t border-white/10 bg-white/5">
            <div className="text-center text-[10px] text-white/20 font-bold uppercase tracking-[0.3em]">
              Air Hrome Ultimate
            </div>
            <div className="mt-1 text-center text-[9px] text-white/40">
              By Artem Protsko
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AISidebar;

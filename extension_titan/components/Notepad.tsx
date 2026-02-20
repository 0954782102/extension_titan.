
import React from 'react';
import { StickyNote } from 'lucide-react';

interface NotepadProps {
  value: string;
  onChange: (val: string) => void;
}

const Notepad: React.FC<NotepadProps> = ({ value, onChange }) => {
  return (
    <div className="glass-dark w-[280px] h-[340px] rounded-[32px] flex flex-col shadow-3xl overflow-hidden group border border-white/5 hover:border-white/20 transition-colors">
      <div className="px-6 py-5 flex items-center gap-3 border-b border-white/5 bg-white/5">
        <div className="w-8 h-8 glass flex items-center justify-center rounded-lg">
          <StickyNote size={16} className="text-yellow-400" />
        </div>
        <span className="text-white/80 font-bold text-xs uppercase tracking-widest">Нотатки</span>
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Ваші думки тут..."
        className="flex-1 bg-transparent p-6 text-white text-sm leading-relaxed resize-none focus:outline-none placeholder-white/10"
      />
      <div className="px-6 py-4 bg-white/5 text-[9px] text-white/20 font-bold uppercase tracking-[0.2em] text-center border-t border-white/5">
        Local storage secured
      </div>
    </div>
  );
};

export default Notepad;


import React, { useState } from 'react';
import { Search, Globe } from 'lucide-react';

const SearchBar: React.FC = () => {
  const [query, setQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      window.location.href = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
    }
  };

  return (
    <div className="w-full max-w-[650px] mt-10 px-6">
      <form onSubmit={handleSearch} className="relative group">
        <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none text-white/30 group-focus-within:text-white transition-colors">
          <Globe size={20} />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Введіть адресу або пошуковий запит..."
          className="w-full glass-dark py-5 pl-16 pr-20 rounded-[24px] text-white text-lg placeholder-white/20 focus:outline-none focus:ring-4 focus:ring-white/5 transition-all shadow-2xl input-glow border border-white/10"
        />
        <button 
          type="submit" 
          className="absolute right-4 top-1/2 -translate-y-1/2 p-3 hover:bg-white/10 rounded-xl transition-all text-white/40 hover:text-white"
        >
          <Search size={20} />
        </button>
      </form>
    </div>
  );
};

export default SearchBar;

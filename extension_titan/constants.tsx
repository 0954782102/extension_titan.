
import { Youtube, Github, Mail, MessageCircle, ShoppingBag, Search, Sparkles, Brain, Bot, Zap, Chrome, Globe } from 'lucide-react';
import React from 'react';

export const WALLPAPERS = [
  'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?auto=format&fit=crop&q=80&w=2070',
  'https://images.unsplash.com/photo-1477346611705-65d1883cee1e?auto=format&fit=crop&q=80&w=2070',
  'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExbmNraGxlM3YzeXh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/Ym89lUf9rA387O0z3p/giphy.gif',
];

export const QUICK_APPS = [
  { name: 'YouTube', url: 'https://youtube.com', icon: <Youtube className="text-[#FF0000]" size={26} />, color: 'hover:bg-[#FF0000]/10' },
  { name: 'Telegram', url: 'https://web.telegram.org', icon: <MessageCircle className="text-[#26A5E4]" size={26} />, color: 'hover:bg-[#26A5E4]/10' },
  { name: 'WhatsApp', url: 'https://web.whatsapp.com', icon: <Globe className="text-[#25D366]" size={26} />, color: 'hover:bg-[#25D366]/10' },
  { name: 'Gmail', url: 'https://mail.google.com', icon: <Mail className="text-[#EA4335]" size={26} />, color: 'hover:bg-[#EA4335]/10' },
  { name: 'GitHub', url: 'https://github.com', icon: <Github className="text-white" size={26} />, color: 'hover:bg-white/10' },
  { name: 'Chrome Store', url: 'https://chrome.google.com/webstore', icon: <Chrome className="text-[#4285F4]" size={26} />, color: 'hover:bg-[#4285F4]/10' },
];

export const AI_SERVICES = [
  { id: 'gemini', name: 'Gemini', url: 'https://gemini.google.com', icon: <Sparkles className="text-blue-400" size={22} />, desc: 'Google AI Next-Gen' },
  { id: 'chatgpt', name: 'ChatGPT', url: 'https://chat.openai.com', icon: <Bot className="text-emerald-400" size={22} />, desc: 'OpenAI Intelligence' },
  { id: 'claude', name: 'Claude', url: 'https://claude.ai', icon: <Brain className="text-orange-300" size={22} />, desc: 'Safe & Creative AI' },
  { id: 'perplexity', name: 'Perplexity', url: 'https://perplexity.ai', icon: <Search className="text-cyan-400" size={22} />, desc: 'Real-time Search AI' },
  { id: 'grok', name: 'Grok', url: 'https://x.com/i/grok', icon: <Zap className="text-zinc-400" size={22} />, desc: 'X (Twitter) AI' },
];

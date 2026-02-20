
export interface Position {
  x: number;
  y: number;
}

export interface WidgetState {
  id: string;
  position: Position;
  isVisible: boolean;
}

export interface CustomAIService {
  id: string;
  name: string;
  url: string;
  desc: string;
}

export interface CustomQuickApp {
  id: string;
  name: string;
  url: string;
}

export type ClockStyle = 'standard' | 'minimal' | 'analog' | 'cyber' | 'glass-pill';

export interface AppSettings {
  wallpaper: string;
  note: string;
  clockStyle?: ClockStyle;
  widgets: Record<string, WidgetState>;
  customAIServices?: CustomAIService[];
  customQuickApps?: CustomQuickApp[];
}

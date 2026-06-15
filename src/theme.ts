export type ThemeName = 'aurora' | 'midnight' | 'sunset';

export type AppTheme = {
  accent: string;
  assistantBubble: string;
  background: readonly [string, string, string];
  composer: string;
  glow: string;
  name: ThemeName;
  secondary: string;
  userBubble: string;
  white: string;
};

export const themes: Record<ThemeName, AppTheme> = {
  midnight: {
    accent: '#1DD3B0',
    assistantBubble: '#151F33',
    background: ['#07111F', '#0A1224', '#121027'],
    composer: '#101A2C',
    glow: '#4EA8FF',
    name: 'midnight',
    secondary: '#7C5CFF',
    userBubble: '#265D77',
    white: '#F7FAFF',
  },
  sunset: {
    accent: '#FFB000',
    assistantBubble: '#2A1713',
    background: ['#120B08', '#24100B', '#3A160D'],
    composer: '#251611',
    glow: '#FF6B35',
    name: 'sunset',
    secondary: '#FF4D6D',
    userBubble: '#9A3F21',
    white: '#FFF8F1',
  },
  aurora: {
    accent: '#6EF3D6',
    assistantBubble: '#131E35',
    background: ['#041019', '#0B1630', '#190D35'],
    composer: '#101A31',
    glow: '#38BDF8',
    name: 'aurora',
    secondary: '#C084FC',
    userBubble: '#225D79',
    white: '#F7FAFF',
  },
};

export const colors = themes.midnight;

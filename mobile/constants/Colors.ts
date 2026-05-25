/**
 * Colors.ts
 * Sistema de cores com suporte a Light Mode e Dark Mode
 * 
 * Estrutura:
 * - Light Mode: Fundo branco, textos escuros
 * - Dark Mode: Fundo escuro, textos claros
 * - Compatível com WCAG AA para acessibilidade
 */

const tintColorLight = '#8b5cf6';
const tintColorDark = '#a78bfa';

export default {
  light: {
    // Textos
    text: '#1f2937',
    textSecondary: '#6b7280',
    textTertiary: '#9ca3af',
    textInverse: '#ffffff',

    // Backgrounds
    background: '#ffffff',
    backgroundSecondary: '#f9fafb',
    backgroundTertiary: '#f3f4f6',

    // Componentes
    tint: tintColorLight,
    tabIconDefault: '#d1d5db',
    tabIconSelected: tintColorLight,
    
    // Cards
    cardBackground: '#ffffff',
    cardBorder: '#e5e7eb',
    chartCardBackground: '#f9fafb',
    
    // Inputs
    inputBackground: '#f9fafb',
    inputBorder: '#d1d5db',
    inputFocus: '#8b5cf6',
    
    // Status colors
    activeText: '#059669',
    activeBg: '#d1fae5',
    inactiveText: '#b45309',
    inactiveBg: '#fef3c7',
    cancelledText: '#dc2626',
    cancelledBg: '#fee2e2',
    
    // Icons
    iconPrimary: '#8b5cf6',
    iconSecondary: '#6b7280',
    iconDisabled: '#d1d5db',
    iconPlaceholderBg: '#f3e8ff',
    
    // Chart colors
    chartActive: '#0b7a5a',
    chartInactive: '#d97706',
    chartCancelled: '#dc2626',
    chartTrackBg: '#e2e8f0',
    
    // Semantic
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
    
    // Shadows
    shadowColor: '#000000',
  },
  dark: {
    // Textos
    text: '#f3f4f6',
    textSecondary: '#d1d5db',
    textTertiary: '#9ca3af',
    textInverse: '#1f2937',

    // Backgrounds
    background: '#111827',
    backgroundSecondary: '#1f2937',
    backgroundTertiary: '#374151',

    // Componentes
    tint: tintColorDark,
    tabIconDefault: '#6b7280',
    tabIconSelected: tintColorDark,
    
    // Cards
    cardBackground: '#1f2937',
    cardBorder: '#374151',
    chartCardBackground: '#1f2937',
    
    // Inputs
    inputBackground: '#111827',
    inputBorder: '#4b5563',
    inputFocus: '#a78bfa',
    
    // Status colors
    activeText: '#6ee7b7',
    activeBg: '#064e3b',
    inactiveText: '#fbbf24',
    inactiveBg: '#78350f',
    cancelledText: '#fca5a5',
    cancelledBg: '#7f1d1d',
    
    // Icons
    iconPrimary: '#a78bfa',
    iconSecondary: '#9ca3af',
    iconDisabled: '#6b7280',
    iconPlaceholderBg: '#312e81',
    
    // Chart colors
    chartActive: '#10b981',
    chartInactive: '#f59e0b',
    chartCancelled: '#ef4444',
    chartTrackBg: '#4b5563',
    
    // Semantic
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#60a5fa',
    
    // Shadows
    shadowColor: '#000000',
  },
};

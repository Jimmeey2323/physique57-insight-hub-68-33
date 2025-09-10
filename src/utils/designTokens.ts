
export const designTokens = {
  // Modern spacing scale
  spacing: {
    xs: '0.25rem',    // 4px
    sm: '0.5rem',     // 8px
    md: '0.75rem',    // 12px
    lg: '1rem',       // 16px
    xl: '1.5rem',     // 24px
    xxl: '2rem',      // 32px
    xxxl: '3rem',     // 48px
  },
  
  // Professional card styling
  card: {
    padding: 'p-6',
    shadow: 'shadow-[0_4px_20px_rgba(0,0,0,0.08)]',
    border: 'border border-slate-200/60',
    background: 'bg-white/95 backdrop-blur-md',
    radius: 'rounded-2xl',
    hover: 'hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] hover:scale-[1.02] transition-all duration-300',
  },
  
  // Modern color palette
  colors: {
    primary: {
      50: '#f0f9ff',
      100: '#e0f2fe', 
      500: '#0ea5e9',
      600: '#0284c7',
      700: '#0369a1',
      900: '#0c4a6e',
    },
    slate: {
      50: '#f8fafc',
      100: '#f1f5f9',
      200: '#e2e8f0',
      300: '#cbd5e1',
      400: '#94a3b8',
      500: '#64748b',
      600: '#475569',
      700: '#334155',
      800: '#1e293b',
      900: '#0f172a',
    },
    success: {
      50: '#f0fdf4',
      500: '#22c55e',
      600: '#16a34a',
      700: '#15803d',
    },
    warning: {
      50: '#fffbeb',
      500: '#f59e0b',
      600: '#d97706',
      700: '#b45309',
    },
    error: {
      50: '#fef2f2',
      500: '#ef4444',
      600: '#dc2626',
      700: '#b91c1c',
    }
  },
  
  // Typography scale
  typography: {
    display: 'text-4xl md:text-5xl lg:text-6xl font-black tracking-tight',
    h1: 'text-3xl md:text-4xl font-bold tracking-tight',
    h2: 'text-2xl md:text-3xl font-semibold tracking-tight',
    h3: 'text-xl md:text-2xl font-semibold',
    h4: 'text-lg md:text-xl font-semibold',
    body: 'text-sm md:text-base text-slate-700',
    caption: 'text-xs md:text-sm text-slate-500',
    label: 'text-sm font-medium text-slate-900',
  },
  
  // Modern table styling
  table: {
    header: 'bg-gradient-to-r from-slate-50 to-slate-100 border-b-2 border-slate-200',
    headerText: 'text-xs font-bold text-slate-700 uppercase tracking-wider',
    row: 'hover:bg-slate-50/80 transition-colors border-b border-slate-100',
    cell: 'px-4 py-2 text-sm text-slate-800 font-medium whitespace-nowrap overflow-hidden text-ellipsis',
    maxHeight: 'max-h-[25px]',
  },
  
  // Professional button styles
  button: {
    primary: 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-200',
    secondary: 'bg-white border-2 border-slate-200 hover:border-slate-300 text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition-all duration-200',
    ghost: 'hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-all duration-200',
  },
  
  // Modern gradients
  gradients: {
    blue: 'bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700',
    purple: 'bg-gradient-to-br from-purple-500 via-purple-600 to-indigo-700',
    green: 'bg-gradient-to-br from-emerald-500 via-green-600 to-teal-700',
    orange: 'bg-gradient-to-br from-orange-500 via-red-500 to-red-600',
    pink: 'bg-gradient-to-br from-pink-500 via-rose-500 to-red-600',
    teal: 'bg-gradient-to-br from-teal-500 via-cyan-600 to-blue-700',
    slate: 'bg-gradient-to-br from-slate-600 via-slate-700 to-slate-800',
  },
  
  // Animation system
  animations: {
    fadeIn: 'animate-fade-in',
    slideUp: 'animate-slide-up',
    scaleIn: 'animate-scale-in',
    hover: 'hover:scale-105 transition-transform duration-200',
  }
};

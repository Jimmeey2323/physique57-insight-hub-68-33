import React, { useEffect, useState } from 'react';
import { BarChart3, TrendingUp, Activity, Zap } from 'lucide-react';

interface ProfessionalLoaderProps {
  title?: string;
  subtitle?: string;
  variant?: 'default' | 'analytics' | 'sales' | 'conversion';
}

export const ProfessionalLoader: React.FC<ProfessionalLoaderProps> = ({
  title = "Physique 57 Analytics",
  subtitle = "Loading your dashboard...",
  variant = 'default'
}) => {
  const [progress, setProgress] = useState(0);
  const [loadingPhase, setLoadingPhase] = useState(0);

  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          return 0; // Reset to create smooth continuous animation
        }
        return prev + 2;
      });
    }, 50); // Faster, smoother progress updates

    const phaseInterval = setInterval(() => {
      setLoadingPhase(prev => (prev + 1) % 4);
    }, 800); // Change phase every 800ms

    return () => {
      clearInterval(progressInterval);
      clearInterval(phaseInterval);
    };
  }, []);

  const getIcon = () => {
    switch (variant) {
      case 'analytics': return BarChart3;
      case 'sales': return TrendingUp;
      case 'conversion': return Zap;
      default: return Activity;
    }
  };

  const getGradient = () => {
    switch (variant) {
      case 'analytics': return 'from-blue-600 to-indigo-600';
      case 'sales': return 'from-green-600 to-emerald-600';
      case 'conversion': return 'from-purple-600 to-pink-600';
      default: return 'from-blue-600 to-purple-600';
    }
  };

  const getLoadingMessages = () => {
    const messages = [
      'Fetching data from Google Sheets...',
      'Processing analytics information...',
      'Building interactive visualizations...',
      'Almost ready...'
    ];
    return messages[loadingPhase];
  };

  const Icon = getIcon();
  const gradient = getGradient();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Optimized Animated Background with GPU acceleration */}
      <div className="absolute inset-0 overflow-hidden will-change-transform">
        <div 
          className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"
          style={{ 
            animation: 'float1 6s ease-in-out infinite',
            transform: 'translate3d(0, 0, 0)' // Force hardware acceleration
          }}
        ></div>
        <div 
          className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-r from-purple-400/15 to-pink-400/15 rounded-full blur-3xl"
          style={{ 
            animation: 'float2 8s ease-in-out infinite 2s',
            transform: 'translate3d(0, 0, 0)'
          }}
        ></div>
        <div 
          className="absolute top-1/2 left-1/2 w-64 h-64 bg-gradient-to-r from-indigo-400/10 to-blue-400/10 rounded-full blur-3xl"
          style={{ 
            animation: 'float3 7s ease-in-out infinite 1s',
            transform: 'translate3d(-50%, -50%, 0)'
          }}
        ></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center space-y-8 text-center">
        {/* Logo Container */}
        <div className="relative transform will-change-transform">
          <div 
            className={`w-28 h-28 bg-gradient-to-br ${gradient} rounded-3xl flex items-center justify-center shadow-2xl shadow-blue-500/20`}
            style={{ 
              animation: 'logoFloat 3s ease-in-out infinite',
              transform: 'translate3d(0, 0, 0)'
            }}
          >
            <Icon 
              className="w-14 h-14 text-white" 
              style={{ 
                animation: 'iconSpin 4s linear infinite',
                transform: 'translate3d(0, 0, 0)'
              }} 
            />
          </div>
          
          {/* Optimized Floating Elements */}
          <div 
            className="absolute -top-3 -right-3 w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center shadow-lg"
            style={{ animation: 'smallFloat1 2s ease-in-out infinite' }}
          >
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div 
            className="absolute -bottom-2 -left-2 w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center"
            style={{ animation: 'smallFloat2 2.5s ease-in-out infinite 0.5s' }}
          >
            <BarChart3 className="w-4 h-4 text-white" />
          </div>
        </div>

        {/* Loading Dots with controlled timing */}
        <div className="flex items-center space-x-2">
          {[0, 1, 2, 3].map(i => (
            <div
              key={i}
              className={`w-3 h-3 ${i === 0 ? 'bg-blue-600' : i === 1 ? 'bg-purple-600' : i === 2 ? 'bg-indigo-600' : 'bg-pink-600'} rounded-full`}
              style={{ 
                animation: `dotBounce 1.2s ease-in-out infinite`,
                animationDelay: `${i * 0.15}s`,
                transform: 'translate3d(0, 0, 0)'
              }}
            ></div>
          ))}
        </div>

        {/* Text Content */}
        <div className="space-y-3 max-w-md">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-700 via-slate-800 to-slate-900 bg-clip-text text-transparent">
            {title}
          </h1>
          <p className="text-slate-600 text-lg leading-relaxed">
            {subtitle}
          </p>
        </div>

        {/* Smooth Progress Bar */}
        <div className="w-80 h-2 bg-slate-200 rounded-full overflow-hidden shadow-inner">
          <div 
            className={`h-full bg-gradient-to-r ${gradient} rounded-full shadow-sm transition-all duration-100 ease-out`} 
            style={{ 
              width: `${Math.min(progress, 100)}%`,
              transform: 'translate3d(0, 0, 0)'
            }}
          ></div>
        </div>

        {/* Dynamic Status Text */}
        <div className="text-sm text-slate-500 flex items-center space-x-2 h-6">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
          <span className="transition-opacity duration-300">{getLoadingMessages()}</span>
        </div>
      </div>

      <style>{`
        @keyframes float1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(20px, -30px) scale(1.1); }
        }
        @keyframes float2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-25px, 20px) scale(0.9); }
        }
        @keyframes float3 {
          0%, 100% { transform: translate(-50%, -50%) scale(1); }
          50% { transform: translate(-50%, -60%) scale(1.05); }
        }
        @keyframes logoFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes iconSpin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes smallFloat1 {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        @keyframes smallFloat2 {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        @keyframes dotBounce {
          0%, 20%, 53%, 80%, 100% { transform: translateY(0); }
          40%, 43% { transform: translateY(-8px); }
        }
      `}</style>
    </div>
  );
};
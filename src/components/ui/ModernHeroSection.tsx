import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Home, Download, TrendingUp, Users, UserCheck, Calendar, Percent, Filter, CheckCircle, Zap, Calendar as CalendarIcon, X, BarChart3, DollarSign, Target, Clock, Trophy, Star, Award, Activity, Sparkles, Play, Pause } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
interface MetricData {
  label: string;
  value: string;
  location: string;
}
interface ModernHeroSectionProps {
  title: string;
  subtitle: string;
  variant: 'sales' | 'client' | 'trainer' | 'sessions' | 'discounts' | 'funnel' | 'attendance' | 'powercycle' | 'expiration' | 'cancellations' | 'summary';
  onExport?: () => void;
  showHomeButton?: boolean;
  metrics?: MetricData[];
  exportButton?: React.ReactNode;
}
const gradientVariants = {
  sales: 'from-slate-900 via-purple-900 to-slate-800',
  client: 'from-gray-900 via-blue-900 to-gray-800',
  trainer: 'from-zinc-900 via-indigo-900 to-zinc-800',
  sessions: 'from-neutral-900 via-orange-900 to-neutral-800',
  discounts: 'from-stone-900 via-amber-900 to-stone-800',
  funnel: 'from-slate-900 via-violet-900 to-slate-800',
  attendance: 'from-gray-900 via-emerald-900 to-gray-800',
  powercycle: 'from-zinc-900 via-cyan-900 to-zinc-800',
  expiration: 'from-neutral-900 via-red-900 to-neutral-800',
  cancellations: 'from-stone-900 via-rose-900 to-stone-800',
  summary: 'from-slate-900 via-teal-900 to-slate-800'
};
const iconVariants = {
  sales: [TrendingUp, DollarSign, BarChart3, Target],
  client: [Users, UserCheck, Award, Star],
  trainer: [UserCheck, Trophy, Activity, Award],
  sessions: [Calendar, Clock, CalendarIcon, CheckCircle],
  discounts: [Percent, Star, Target, Sparkles],
  funnel: [Filter, Target, TrendingUp, BarChart3],
  attendance: [CheckCircle, Users, Activity, Calendar],
  powercycle: [Zap, Activity, TrendingUp, Target],
  expiration: [Clock, CalendarIcon, Target, Star],
  cancellations: [X, Calendar, Clock, Target],
  summary: [BarChart3, TrendingUp, Award, Star]
};
const FloatingIcon: React.FC<{
  Icon: React.ComponentType<any>;
  className: string;
  delay?: number;
}> = ({
  Icon,
  className,
  delay = 0
}) => <div className={`absolute ${className} animate-float opacity-20 hover:opacity-40 transition-opacity duration-300`} style={{
  animationDelay: `${delay}s`
}}>
    <Icon className="w-full h-full text-white drop-shadow-lg" />
  </div>;
const AnimatedFloatingElements: React.FC<{
  variant: string;
}> = ({
  variant
}) => {
  const icons = iconVariants[variant as keyof typeof iconVariants] || iconVariants.summary;
  return <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Primary floating icons */}
      <FloatingIcon Icon={icons[0]} className="top-10 left-10 w-16 h-16" delay={0} />
      <FloatingIcon Icon={icons[1]} className="top-32 right-20 w-12 h-12" delay={0.5} />
      <FloatingIcon Icon={icons[2]} className="bottom-20 left-32 w-20 h-20" delay={1} />
      <FloatingIcon Icon={icons[3]} className="bottom-32 right-1/3 w-14 h-14" delay={1.5} />
      
      {/* Secondary floating icons */}
      <FloatingIcon Icon={icons[0]} className="top-1/2 left-1/4 w-10 h-10" delay={0.8} />
      <FloatingIcon Icon={icons[1]} className="top-20 right-1/2 w-8 h-8" delay={1.2} />
      <FloatingIcon Icon={icons[2]} className="top-3/4 right-1/4 w-6 h-6" delay={0.3} />
      <FloatingIcon Icon={icons[3]} className="bottom-1/2 left-1/6 w-8 h-8" delay={1.8} />
      
      {/* Tertiary floating elements */}
      <div className="absolute top-1/4 left-1/3 w-3 h-3 bg-white/30 rounded-full animate-pulse" style={{
      animationDelay: '0.5s'
    }}></div>
      <div className="absolute top-1/3 right-1/5 w-2 h-2 bg-white/40 rounded-full animate-ping" style={{
      animationDelay: '1s'
    }}></div>
      <div className="absolute bottom-1/4 left-1/2 w-4 h-4 bg-white/20 rounded-full animate-bounce" style={{
      animationDelay: '1.5s'
    }}></div>
      <div className="absolute top-2/3 right-2/3 w-2 h-2 bg-white/50 rounded-full animate-pulse" style={{
      animationDelay: '2s'
    }}></div>
      <div className="absolute bottom-1/6 right-1/6 w-3 h-3 bg-white/30 rounded-full animate-ping" style={{
      animationDelay: '0.2s'
    }}></div>
      
      {/* Grid pattern overlay */}
      <div className="absolute inset-0 opacity-5">
        <div className="h-full w-full bg-grid-white/[0.05] [mask-image:radial-gradient(ellipse_at_center,white,transparent_75%)]" />
      </div>
    </div>;
};
export const ModernHeroSection: React.FC<ModernHeroSectionProps> = ({
  title,
  subtitle,
  variant,
  onExport,
  showHomeButton = true,
  metrics = [],
  exportButton
}) => {
  const navigate = useNavigate();
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const handlePlayAudio = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
  };
  return <div className={`relative min-h-[732px] overflow-hidden bg-gradient-to-br ${gradientVariants[variant]} text-white`}>
      {/* Hidden audio element */}
      <audio ref={audioRef} onEnded={() => setIsPlaying(false)} preload="metadata">
        {/* Audio file placeholder - user needs to add their audio file */}
        <source src="/placeholder-audio.mp3" type="audio/mpeg" />
        Your browser does not support the audio element.
      </audio>
      {/* Background overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/20" />
      
      {/* Animated floating elements */}
      <AnimatedFloatingElements variant={variant} />
      
      {/* Corner buttons */}
      <div className="absolute top-6 left-6 z-20">
        {showHomeButton && <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="text-white/90 hover:text-white hover:bg-white/20 backdrop-blur-sm border border-white/20 transition-all duration-300 hover:scale-105">
            <Home className="w-4 h-4 mr-2" />
            Dashboard
          </Button>}
      </div>
      
      <div className="absolute top-6 right-6 z-20 flex gap-3">
        {/* Audio Play Button */}
        <Button variant="ghost" size="sm" onClick={handlePlayAudio} className="text-white/90 hover:text-white hover:bg-white/20 backdrop-blur-sm border border-white/20 transition-all duration-300 hover:scale-105">
          {isPlaying ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
          {isPlaying ? 'Pause' : 'Play'}
        </Button>
        
        {exportButton || onExport && <Button variant="ghost" size="sm" onClick={onExport} className="text-white/90 hover:text-white hover:bg-white/20 backdrop-blur-sm border border-white/20 transition-all duration-300 hover:scale-105">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>}
      </div>
      
      {/* Content */}
      <div className="relative z-10 flex items-center justify-center min-h-[732px] p px-[12px] py-12">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-in bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent drop-shadow-lg">
            {title}
          </h1>
          <p className="text-lg md:text-xl text-white/90 animate-slide-up delay-200 max-w-2xl mx-auto leading-relaxed mb-8">
            {subtitle}
          </p>
          
          {/* Top 3 Metrics Display */}
          {metrics.length > 0 && <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto animate-fade-in delay-300">
              {metrics.slice(0, 3).map((metric, index) => <div key={index} className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300">
                  <div className="text-sm text-white/70 font-medium mb-2">{metric.location}</div>
                  <div className="text-2xl md:text-3xl font-bold text-white mb-1">{metric.value}</div>
                  <div className="text-sm text-white/80">{metric.label}</div>
                </div>)}
            </div>}
          
          {/* Decorative elements */}
          <div className="mt-8 flex justify-center space-x-2 animate-scale-in delay-500">
            <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-white/40 rounded-full animate-pulse delay-200"></div>
            <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse delay-500"></div>
          </div>
        </div>
      </div>
      
      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/40 to-transparent" />
    </div>;
};
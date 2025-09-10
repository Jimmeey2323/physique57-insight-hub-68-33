import React, { memo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Footer } from '@/components/ui/footer';
import { DashboardGrid } from '@/components/dashboard/DashboardGrid';
import { useGoogleSheets } from '@/hooks/useGoogleSheets';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import { designTokens } from '@/utils/designTokens';

// Memoized stats card component
const StatsCard = memo(({
  title,
  subtitle
}: {
  title: string;
  subtitle: string;
}) => <div className={`${designTokens.card.background} backdrop-blur-sm rounded-xl px-6 py-4 ${designTokens.card.shadow} border border-slate-200/50 transform hover:scale-105 transition-all duration-300`}>
    <div className="text-2xl font-bold text-slate-900">{title}</div>
    <div className="text-xs text-slate-600 font-medium">{subtitle}</div>
  </div>);
const Index = () => {
  const navigate = useNavigate();
  const {
    data,
    loading,
    error,
    refetch
  } = useGoogleSheets();
  const handleSectionClick = useCallback((sectionId: string) => {
    if (sectionId === 'class-performance-series') {
      window.open('https://class-performance-series-001.vercel.app/', '_blank');
    } else if (sectionId === 'late-cancellations') {
      navigate('/late-cancellations');
    } else {
      navigate(`/${sectionId}`);
    }
  }, [navigate]);
  const handleRetry = useCallback(() => {
    refetch();
  }, [refetch]);
  if (loading) {
    return <div className="min-h-screen bg-white relative overflow-hidden">
        <div className="container mx-auto px-8 py-8">
          <LoadingSkeleton type="full-page" />
        </div>
      </div>;
  }
  if (error) {
    return <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-50 flex items-center justify-center p-4">
        <Card className={`p-12 ${designTokens.card.background} backdrop-blur-sm ${designTokens.card.shadow} ${designTokens.card.border} rounded-2xl max-w-lg`}>
          <CardContent className="text-center space-y-6">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto" />
            <div>
              <p className="text-xl font-semibold text-slate-800">Connection Error</p>
              <p className="text-sm text-slate-600 mt-2">{error}</p>
            </div>
            <Button onClick={handleRetry} className="gap-2 bg-slate-800 hover:bg-slate-900 text-white">
              <RefreshCw className="w-4 h-4" />
              Retry Connection
            </Button>
          </CardContent>
        </Card>
      </div>;
  }
  return <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Simplified Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-rose-50/20 via-purple-50/10 to-pink-50/20"></div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        <div className="container mx-auto px-6 py-8">
          {/* Compact Header Section */}
          <header className="mb-8 text-center">
            <div className="inline-flex items-center justify-center mb-4">
              <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white px-4 py-2 text-sm font-medium shadow-lg tracking-wide min-w-full w-full fixed top-0 left-0 z-50 rounded-none">
                Business Intelligence Dashboard
              </div>
            </div>
            
            <h1 className="text-4xl md:text-xl font-light text-slate-900 mb-2 tracking-tight font-serif text-center mb-4">
              <span className="font-extralight text-8xl">Physique</span>{' '}
              <span className="font-bold animate-color-cycle text-9xl">57</span>
              <span className="text-slate-600 font-light text-7xl">, India</span>
            </h1>
            
            <p className="text-lg text-slate-600 font-light mb-6 max-w-3xl mx-auto leading-relaxed mt-8">
              Advanced Business Analytics
            </p>
            
            {/* Compact Stats Cards */}
            <div className="flex flex-wrap justify-center gap-4 mb-6">
              <StatsCard title="Real-time" subtitle="Data Insights" />
              <StatsCard title="8+" subtitle="Analytics Modules" />
              <StatsCard title="Precision" subtitle="Data Accuracy" />
            </div>

            <div className="w-16 h-px bg-slate-300 mx-auto mb-4"></div>
          </header>

          {/* Dashboard Grid - More Prominent */}
          <main className="max-w-7xl mx-auto">
            <div className="min-w-full ">
              <DashboardGrid onButtonClick={handleSectionClick} />
            </div>
          </main>
        </div>
      </div>
      
      <Footer />
      
      <style>{`
        @keyframes color-cycle {
          0% { color: #3b82f6; }
          25% { color: #ef4444; }
          50% { color: #6366f1; }
          75% { color: #8b5cf6; }
          100% { color: #3b82f6; }
        }
        
        .animate-color-cycle {
          animation: color-cycle 4s infinite ease-in-out;
        }
      `}</style>
    </div>;
};
export default Index;
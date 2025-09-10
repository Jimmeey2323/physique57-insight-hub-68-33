
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Home } from 'lucide-react';
import { Footer } from '@/components/ui/footer';

interface SectionLayoutProps {
  title: string;
  children: React.ReactNode;
}

export const SectionLayout: React.FC<SectionLayoutProps> = ({
  title,
  children
}) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Enhanced Header */}
      <div className="border-b border-gray-200 bg-white/95 backdrop-blur-sm sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Button 
                onClick={() => navigate('/')} 
                variant="outline" 
                size="sm" 
                className="gap-2 hover:bg-blue-50 border-blue-200 text-blue-700 hover:border-blue-300 transition-all duration-200"
              >
                <Home className="w-4 h-4" />
                Dashboard
              </Button>
              
              {/* Modern Title with Gradient */}
              <div className="flex items-center gap-3">
                <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"></div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent">
                  {title}
                </h1>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Content Area */}
      <div className="container mx-auto px-6 py-8">
        <main className="space-y-8">
          {children}
        </main>
      </div>
      
      <Footer />
    </div>
  );
};

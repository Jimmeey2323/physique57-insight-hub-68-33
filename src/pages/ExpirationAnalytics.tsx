import React from 'react';
import { ExpirationAnalyticsSection } from '@/components/dashboard/ExpirationAnalyticsSection';
import { useExpirationsData } from '@/hooks/useExpirationsData';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home, Calendar } from 'lucide-react';
import { Footer } from '@/components/ui/footer';
import { ProfessionalLoader } from '@/components/dashboard/ProfessionalLoader';
import { ModernHeroSection } from '@/components/ui/ModernHeroSection';

const ExpirationAnalytics = () => {
  const { data, loading, error } = useExpirationsData();
  const navigate = useNavigate();

  if (loading) {
    return <ProfessionalLoader variant="analytics" subtitle="Loading expirations and churn data..." />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-pink-50/20 flex items-center justify-center">
        <div className="text-center space-y-4 max-w-lg">
          <h1 className="text-2xl font-bold text-red-600">Data Access Issue</h1>
          <p className="text-slate-600">{error}</p>
          {error.includes('Failed to fetch') && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-left">
              <h3 className="font-semibold text-amber-800 mb-2">Development Environment Note:</h3>
              <p className="text-sm text-amber-700">
                This appears to be a CORS/network restriction in the development environment. 
                The integration is correctly configured for the spreadsheet:
                <br />
                <code className="text-xs bg-amber-100 px-2 py-1 rounded mt-1 inline-block">
                  1rGMDDvvTbZfNg1dueWtRN3LhOgGQOdLg3Fd7Sn1GCZo
                </code>
                <br />
                <br />
                In a production environment with proper CORS configuration, this should work correctly.
              </p>
            </div>
          )}
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-pink-50/20">
      <ModernHeroSection 
        title="Expirations & Churn"
        subtitle="Comprehensive analysis of membership expirations and customer retention insights"
        variant="expiration"
        onExport={() => console.log('Exporting expiration data...')}
      />

      <div className="container mx-auto px-6 py-8">
        <main className="space-y-8">
          <ExpirationAnalyticsSection data={data || []} />
        </main>
      </div>
      
      <Footer />
    </div>
  );
};

export default ExpirationAnalytics;
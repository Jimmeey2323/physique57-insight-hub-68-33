import React, { useState } from 'react';
import { ModernHeroSection } from '@/components/ui/ModernHeroSection';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const variants = [
  { key: 'sales', title: 'Sales Analytics', subtitle: 'Comprehensive sales performance insights with advanced metrics and forecasting' },
  { key: 'client', title: 'Client Management', subtitle: 'Track client engagement, retention rates, and conversion analytics in real-time' },
  { key: 'trainer', title: 'Trainer Performance', subtitle: 'Monitor trainer effectiveness, client satisfaction, and performance metrics' },
  { key: 'sessions', title: 'Session Analytics', subtitle: 'Detailed session attendance, booking patterns, and utilization insights' },
  { key: 'discounts', title: 'Promotions Hub', subtitle: 'Analyze discount effectiveness, promotional campaigns, and pricing strategies' },
  { key: 'funnel', title: 'Leads & Funnel', subtitle: 'Conversion funnel analysis, lead tracking, and sales pipeline optimization' },
  { key: 'attendance', title: 'Class Attendance', subtitle: 'Real-time attendance tracking, capacity utilization, and engagement metrics' },
  { key: 'powercycle', title: 'Power Cycle vs Barre', subtitle: 'Comparative analysis between class formats and performance insights' },
  { key: 'expiration', title: 'Membership Expiration', subtitle: 'Track membership lifecycles, renewal rates, and retention strategies' },
  { key: 'cancellations', title: 'Late Cancellations', subtitle: 'Monitor cancellation patterns, policy compliance, and revenue impact' },
  { key: 'summary', title: 'Executive Summary', subtitle: 'High-level overview of all key performance indicators and business metrics' }
] as const;

export default function HeroDemo() {
  const [currentVariant, setCurrentVariant] = useState(0);
  
  const handleExport = () => {
    console.log('Export triggered for variant:', variants[currentVariant].key);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <ModernHeroSection
        title={variants[currentVariant].title}
        subtitle={variants[currentVariant].subtitle}
        variant={variants[currentVariant].key}
        onExport={handleExport}
      />
      
      <div className="container mx-auto px-6 py-12">
        <Card className="glass-card">
          <CardContent className="p-8">
            <h2 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              Hero Section Variants
            </h2>
            <p className="text-center text-muted-foreground mb-8">
              Switch between different variants to see unique gradients and animated icons
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {variants.map((variant, index) => (
                <Button
                  key={variant.key}
                  variant={currentVariant === index ? "default" : "outline"}
                  onClick={() => setCurrentVariant(index)}
                  className={`text-sm font-medium transition-all duration-300 ${
                    currentVariant === index 
                      ? 'bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70' 
                      : 'hover:bg-muted/50'
                  }`}
                >
                  {variant.title}
                </Button>
              ))}
            </div>
            
            <div className="mt-8 p-4 bg-muted/30 rounded-lg">
              <h3 className="font-semibold mb-2">Current Variant: {variants[currentVariant].key}</h3>
              <p className="text-sm text-muted-foreground">
                Each variant features unique dark gradients, themed floating icons, and smooth animations. 
                The corner buttons provide navigation and export functionality.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
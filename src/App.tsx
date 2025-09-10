
import React, { Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { GlobalNoteTaker } from "@/components/ui/GlobalNoteTaker";
import { ProfessionalLoader } from "@/components/dashboard/ProfessionalLoader";

// Lazy load pages for better performance
const Index = React.lazy(() => import("./pages/Index"));
const ExecutiveSummary = React.lazy(() => import("./pages/ExecutiveSummary"));
const SalesAnalytics = React.lazy(() => import("./pages/SalesAnalytics"));
const FunnelLeads = React.lazy(() => import("./pages/FunnelLeads"));
const ClientRetention = React.lazy(() => import("./pages/ClientRetention"));
const TrainerPerformance = React.lazy(() => import("./pages/TrainerPerformance"));
const ClassAttendance = React.lazy(() => import("./pages/ClassAttendance"));
const DiscountsPromotions = React.lazy(() => import("./pages/DiscountsPromotions"));
const Sessions = React.lazy(() => import("./pages/Sessions"));
const PowerCycleVsBarre = React.lazy(() => import("./pages/PowerCycleVsBarre"));
const ExpirationAnalytics = React.lazy(() => import("./pages/ExpirationAnalytics"));
const LateCancellations = React.lazy(() => import("./pages/LateCancellations"));
const HeroDemo = React.lazy(() => import("./pages/HeroDemo"));
const NotFound = React.lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <GlobalNoteTaker />
        <Suspense fallback={<ProfessionalLoader variant="analytics" subtitle="Loading page..." />}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/executive-summary" element={<ExecutiveSummary />} />
            <Route path="/sales-analytics" element={<SalesAnalytics />} />
            <Route path="/funnel-leads" element={<FunnelLeads />} />
            <Route path="/client-retention" element={<ClientRetention />} />
            <Route path="/trainer-performance" element={<TrainerPerformance />} />
            <Route path="/class-attendance" element={<ClassAttendance />} />
            <Route path="/discounts-promotions" element={<DiscountsPromotions />} />
            <Route path="/sessions" element={<Sessions />} />
            <Route path="/powercycle-vs-barre" element={<PowerCycleVsBarre />} />
            <Route path="/expiration-analytics" element={<ExpirationAnalytics />} />
            <Route path="/late-cancellations" element={<LateCancellations />} />
            <Route path="/hero-demo" element={<HeroDemo />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider } from "@/contexts/AuthContext";

import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import PredictYield from "./pages/PredictYield";
import RecommendCrop from "./pages/RecommendCrop";
import OptimizeYield from "./pages/OptimizeYield";
import AIChat from "./pages/AIChat";
import BestMarket from "./pages/BestMarket";
import DiseaseDetection from "./pages/DiseaseDetection";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/admin-login" element={<AdminLogin />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route element={<Dashboard />}>
                <Route path="/predict" element={<PredictYield />} />
                <Route path="/recommend" element={<RecommendCrop />} />
                <Route path="/optimize" element={<OptimizeYield />} />
                <Route path="/chat" element={<AIChat />} />
                <Route path="/market" element={<BestMarket />} />
                <Route path="/disease" element={<DiseaseDetection />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;

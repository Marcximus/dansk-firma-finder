
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import CompanyPage from "./pages/CompanyPage";
import FAQPage from "./pages/FAQPage";
import ServicevilkaarPage from "./pages/ServicevilkaarPage";
import PrivatlivspolitikPage from "./pages/PrivatlivspolitikPage";
import HjaelpecenterPage from "./pages/HjaelpecenterPage";
import SearchGuidePage from "./pages/SearchGuidePage";
import DatabehandlingPage from "./pages/DatabehandlingPage";
import KontaktOsPage from "./pages/KontaktOsPage";
import VirksomhedsrapporterPage from "./pages/VirksomhedsrapporterPage";
import DatakilderPage from "./pages/DatakilderPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/company/:id" element={<CompanyPage />} />
          <Route path="/faq" element={<FAQPage />} />
          <Route path="/servicevilkaar" element={<ServicevilkaarPage />} />
          <Route path="/privatlivspolitik" element={<PrivatlivspolitikPage />} />
          <Route path="/hjaelpecenter" element={<HjaelpecenterPage />} />
          <Route path="/soegeguide" element={<SearchGuidePage />} />
          <Route path="/databehandling" element={<DatabehandlingPage />} />
          <Route path="/kontakt-os" element={<KontaktOsPage />} />
          <Route path="/virksomhedsrapporter" element={<VirksomhedsrapporterPage />} />
          <Route path="/datakilder" element={<DatakilderPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

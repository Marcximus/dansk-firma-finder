
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SubscriptionProvider } from "@/contexts/SubscriptionContext";
import Analytics from "@/components/Analytics";
import Index from "./pages/Index";
import CompanyPage from "./pages/CompanyPage";
import FAQPage from "./pages/FAQPage";
import ServicevilkaarPage from "./pages/ServicevilkaarPage";
import PrivatlivspolitikPage from "./pages/PrivatlivspolitikPage";
import HjaelpecenterPage from "./pages/HjaelpecenterPage";
import SearchGuidePage from "./pages/SearchGuidePage";
import TrackFoelgPage from "./pages/TrackFoelgPage";
import CheckoutPage from "./pages/CheckoutPage";
import AuthPage from "./pages/AuthPage";
import ProfilePage from "./pages/ProfilePage";
import KontaktOsPage from "./pages/KontaktOsPage";
import VirksomhedsrapporterPage from "./pages/VirksomhedsrapporterPage";
import PaymentSuccessPage from "./pages/PaymentSuccessPage";
import DatakilderPage from "./pages/DatakilderPage";
import NotFound from "./pages/NotFound";
import ScrollToTop from "./components/ScrollToTop";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <SubscriptionProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <Analytics />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/company/:id" element={<CompanyPage />} />
            <Route path="/faq" element={<FAQPage />} />
            <Route path="/servicevilkaar" element={<ServicevilkaarPage />} />
            <Route path="/privatlivspolitik" element={<PrivatlivspolitikPage />} />
            <Route path="/hjaelpecenter" element={<HjaelpecenterPage />} />
            <Route path="/soegeguide" element={<SearchGuidePage />} />
            <Route path="/track-foelg" element={<TrackFoelgPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/profil" element={<ProfilePage />} />
            <Route path="/kontakt-os" element={<KontaktOsPage />} />
            <Route path="/virksomhedsrapporter" element={<VirksomhedsrapporterPage />} />
            <Route path="/payment-success" element={<PaymentSuccessPage />} />
            <Route path="/datakilder" element={<DatakilderPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </SubscriptionProvider>
  </QueryClientProvider>
);

export default App;

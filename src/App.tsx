
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from 'react-helmet-async';
import { SubscriptionProvider } from "@/contexts/SubscriptionContext";
import Analytics from "@/components/Analytics";
import Index from "./pages/Index";
import CompanyPage from "./pages/CompanyPage";
import CompanyChangesPage from "./pages/CompanyChangesPage";
import PersonPage from "./pages/PersonPage";
import FAQPage from "./pages/FAQPage";
import ServicevilkaarPage from "./pages/ServicevilkaarPage";
import PrivatlivspolitikPage from "./pages/PrivatlivspolitikPage";
import HandelsbetingelserPage from "./pages/HandelsbetingelserPage";
import HjaelpecenterPage from "./pages/HjaelpecenterPage";

import TrackFoelgPage from "./pages/TrackFoelgPage";
import CheckoutPage from "./pages/CheckoutPage";
import AuthPage from "./pages/AuthPage";
import ProfilePage from "./pages/ProfilePage";
import KontaktOsPage from "./pages/KontaktOsPage";
import VirksomhedsrapporterPage from "./pages/VirksomhedsrapporterPage";
import PaymentSuccessPage from "./pages/PaymentSuccessPage";
import DatakilderPage from "./pages/DatakilderPage";
import CvrApiPage from "./pages/CvrApiPage";
import FremhaevVirksomhedPage from "./pages/FremhaevVirksomhedPage";
import NotFound from "./pages/NotFound";
import ScrollToTop from "./components/ScrollToTop";
import { AdminLayout } from "./components/admin/AdminLayout";
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { UserManagement } from "./pages/admin/UserManagement";
import { CompanyInsights } from "./pages/admin/CompanyInsights";
import { RevenueAnalytics } from "./pages/admin/RevenueAnalytics";
import { ReportsOrders } from "./pages/admin/ReportsOrders";
import { SystemHealth } from "./pages/admin/SystemHealth";
import { LeadManagement } from "./pages/admin/LeadManagement";
import CompanySync from "./pages/admin/CompanySync";
import SitemapStatus from "./pages/admin/SitemapStatus";
import SitemapPage from "./pages/SitemapPage";
import RobotsTxtPage from "./pages/RobotsTxtPage";

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
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
            {/* New SEO-friendly Danish URLs */}
            <Route path="/virksomhed/:slug/:cvr" element={<CompanyPage />} />
            <Route path="/virksomhed/:slug/:cvr/aendringer" element={<CompanyChangesPage />} />
            <Route path="/person/:slug" element={<PersonPage />} />
            {/* Legacy redirects for old URLs */}
            <Route path="/company/:id" element={<CompanyPage />} />
            <Route path="/company/:id/changes" element={<CompanyChangesPage />} />
            <Route path="/faq" element={<FAQPage />} />
            <Route path="/servicevilkaar" element={<ServicevilkaarPage />} />
            <Route path="/privatlivspolitik" element={<PrivatlivspolitikPage />} />
            <Route path="/handelsbetingelser" element={<HandelsbetingelserPage />} />
            <Route path="/hjaelpecenter" element={<HjaelpecenterPage />} />
            
            <Route path="/track-foelg" element={<TrackFoelgPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/profil" element={<ProfilePage />} />
            <Route path="/kontakt-os" element={<KontaktOsPage />} />
            <Route path="/virksomhedsrapporter" element={<VirksomhedsrapporterPage />} />
            <Route path="/payment-success" element={<PaymentSuccessPage />} />
            <Route path="/datakilder" element={<DatakilderPage />} />
            <Route path="/cvr-api" element={<CvrApiPage />} />
            <Route path="/fremhaev-virksomhed" element={<FremhaevVirksomhedPage />} />
            
            {/* Sitemap Routes */}
            <Route path="/sitemap.xml" element={<SitemapPage />} />
            <Route path="/sitemap-static.xml" element={<SitemapPage type="static" />} />
            <Route path="/sitemap-companies-:page.xml" element={<SitemapPage type="companies" />} />
            <Route path="/robots.txt" element={<RobotsTxtPage />} />
            
            {/* Admin Routes */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="users" element={<UserManagement />} />
              <Route path="companies" element={<CompanyInsights />} />
              <Route path="revenue" element={<RevenueAnalytics />} />
              <Route path="reports" element={<ReportsOrders />} />
              <Route path="leads" element={<LeadManagement />} />
              <Route path="sync" element={<CompanySync />} />
              <Route path="sitemaps" element={<SitemapStatus />} />
              <Route path="system" element={<SystemHealth />} />
            </Route>
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </SubscriptionProvider>
  </QueryClientProvider>
  </HelmetProvider>
);

export default App;

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { ThemeProvider } from "@/components/ThemeProvider";
import Onboarding from "@/pages/Onboarding";
import Login from "@/pages/Login";
import Home from "@/pages/Home";
import BanksList from "@/pages/BanksList";
import BanksNew from "@/pages/BanksNew";
import BanksEdit from "@/pages/BanksEdit";
import CardsList from "@/pages/CardsList";
import CardsNew from "@/pages/CardsNew";
import CardsEdit from "@/pages/CardsEdit";
import PoliciesList from "@/pages/PoliciesList";
import PoliciesNew from "@/pages/PoliciesNew";
import PoliciesEdit from "@/pages/PoliciesEdit";
import Recover from "@/pages/Recover";
import NotFound from "./pages/NotFound";
import { hasVaultSetup, isLoggedIn, isVaultUnlocked } from "@/lib/storage";
import InactivityLogout from "@/components/InactivityLogout";
import AadharsList from "@/pages/AadharsList";
import AadharsNew from "@/pages/AadharsNew";
import AadharsEdit from "@/pages/AadharsEdit";
import Settings from "@/pages/Settings";
import RequireAuth from "@/components/RequireAuth";
import AutoUnlock from "@/components/AutoUnlock";
const queryClient = new QueryClient();

function StartGate() {
  const navigate = useNavigate();
  useEffect(() => {
    (async () => {
      const setup = await hasVaultSetup();
      const logged = await isLoggedIn();
      if (!setup) navigate('/onboarding');
      else if (!logged || !isVaultUnlocked()) navigate('/login');
      else navigate('/home');
    })();
  }, [navigate]);
  return null;
}

function ScrollToTop() {
  const location = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [location.pathname]);
  return null;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <InactivityLogout />
          <AutoUnlock />
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<StartGate />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/login" element={<Login />} />
            <Route path="/recover" element={<Recover />} />
            <Route path="/home" element={<RequireAuth><Home /></RequireAuth>} />
            <Route path="/banks" element={<RequireAuth><BanksList /></RequireAuth>} />
            <Route path="/banks/new" element={<RequireAuth><BanksNew /></RequireAuth>} />
            <Route path="/banks/:id/edit" element={<RequireAuth><BanksEdit /></RequireAuth>} />
            <Route path="/cards" element={<RequireAuth><CardsList /></RequireAuth>} />
            <Route path="/cards/new" element={<RequireAuth><CardsNew /></RequireAuth>} />
            <Route path="/cards/:id/edit" element={<RequireAuth><CardsEdit /></RequireAuth>} />
            <Route path="/policies" element={<RequireAuth><PoliciesList /></RequireAuth>} />
            <Route path="/policies/new" element={<RequireAuth><PoliciesNew /></RequireAuth>} />
            <Route path="/policies/:id/edit" element={<RequireAuth><PoliciesEdit /></RequireAuth>} />
            <Route path="/aadhars" element={<RequireAuth><AadharsList /></RequireAuth>} />
            <Route path="/aadhars/new" element={<RequireAuth><AadharsNew /></RequireAuth>} />
            <Route path="/aadhars/:id/edit" element={<RequireAuth><AadharsEdit /></RequireAuth>} />
            <Route path="/settings" element={<RequireAuth><Settings /></RequireAuth>} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <footer className="py-6 text-center text-xs text-muted-foreground">
            Designed &amp; Created by Gopinath Kumbha
          </footer>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { ThemeProvider } from "@/components/ThemeProvider";
import Onboarding from "@/pages/Onboarding";
import Login from "@/pages/Login";
import Home from "@/pages/Home";
import BanksList from "@/pages/BanksList";
import BanksNew from "@/pages/BanksNew";
import CardsList from "@/pages/CardsList";
import CardsNew from "@/pages/CardsNew";
import NotFound from "./pages/NotFound";
import { getMasterHash, isLoggedIn } from "@/lib/storage";

const queryClient = new QueryClient();

function StartGate() {
  const navigate = useNavigate();
  useEffect(() => {
    (async () => {
      const master = await getMasterHash();
      const logged = await isLoggedIn();
      if (!master) navigate('/onboarding');
      else if (!logged) navigate('/login');
      else navigate('/home');
    })();
  }, [navigate]);
  return null;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<StartGate />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/login" element={<Login />} />
            <Route path="/home" element={<Home />} />
            <Route path="/banks" element={<BanksList />} />
            <Route path="/banks/new" element={<BanksNew />} />
            <Route path="/cards" element={<CardsList />} />
            <Route path="/cards/new" element={<CardsNew />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;


import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import AuthLoadingScreen from "@/components/AuthLoadingScreen";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import CreateProject from "./pages/CreateProject";
import AdminDashboard from "./pages/AdminDashboard";
import Dashboard from "./pages/Dashboard";
import MyProjects from "./pages/MyProjects";
import Chat from "./pages/Chat";
import Profile from "./pages/Profile";
import Services from "./pages/Services";
import Contact from "./pages/Contact";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppContent = () => {
  const { loading, error, loadingStep } = useAuth();

  // Mostra la schermata di loading con feedback dettagliato durante l'inizializzazione
  if (loading) {
    return <AuthLoadingScreen loadingStep={loadingStep} error={error} />;
  }

  // Se c'è un errore critico nell'auth, mostra la schermata di errore
  if (error) {
    return <AuthLoadingScreen loadingStep="Errore di sistema" error={error} />;
  }

  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/create-project" element={<CreateProject />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/my-projects" element={<MyProjects />} />
      <Route path="/chat" element={<Chat />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/services" element={<Services />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/services/websites" element={<Services />} />
      <Route path="/services/apps" element={<Services />} />
      <Route path="/services/ecommerce" element={<Services />} />
      <Route path="/services/ai-consulting" element={<Services />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

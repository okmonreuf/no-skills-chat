import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

// Pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import Chat from "./pages/Chat";
import Admin from "./pages/Admin";
import Moderator from "./pages/Moderator";
import Banned from "./pages/Banned";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import AgeRestricted from "./pages/AgeRestricted";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Composant pour protéger les routes
function ProtectedRoute({
  children,
  requiredRole,
}: {
  children: React.ReactNode;
  requiredRole?: string[];
}) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.isBanned) {
    return <Navigate to="/banned" replace />;
  }

  if (requiredRole && !requiredRole.includes(user.role)) {
    return <Navigate to="/chat" replace />;
  }

  return <>{children}</>;
}

// Composant pour rediriger si déjà connecté
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  if (user && !user.isBanned) {
    return <Navigate to="/chat" replace />;
  }

  if (user?.isBanned) {
    return <Navigate to="/banned" replace />;
  }

  return <>{children}</>;
}

const App = () => {
  const { initializeAuth } = useAuth();

  useEffect(() => {
    initializeAuth();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Routes publiques */}
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              }
            />
            <Route
              path="/register"
              element={
                <PublicRoute>
                  <Register />
                </PublicRoute>
              }
            />

            {/* Route de bannissement */}
            <Route path="/banned" element={<Banned />} />

            {/* Pages légales (accessibles à tous) */}
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/age-restricted" element={<AgeRestricted />} />

            {/* Routes protégées */}
            <Route
              path="/chat"
              element={
                <ProtectedRoute>
                  <Chat />
                </ProtectedRoute>
              }
            />

            {/* Routes d'administration */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute requiredRole={["admin"]}>
                  <Admin />
                </ProtectedRoute>
              }
            />

            <Route
              path="/moderator"
              element={
                <ProtectedRoute requiredRole={["admin", "moderator"]}>
                  <Moderator />
                </ProtectedRoute>
              }
            />

            {/* Redirection par défaut */}
            <Route
              path="/"
              element={
                <PublicRoute>
                  <Navigate to="/login" replace />
                </PublicRoute>
              }
            />

            {/* Route 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;

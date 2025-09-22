import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "./components/layout/Layout";
import Dashboard from "./pages/Dashboard";
import ProjectDetails from "./pages/ProjectDetails";
import Calendar from "./pages/Calendar";
import Team from "./pages/Team";
import SearchPage from "./pages/SearchPage";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import useAuthStore from "./lib/stores/auth-store";
import { useEffect } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import socketService from "./lib/socket";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export default function App() {
  console.log('App rendering');
  
  const { initializeAuth, initialized, isAuthenticated, token } = useAuthStore();

  useEffect(() => {
    console.log('App effect running', { initialized });
    if (!initialized) {
      initializeAuth();
    }
  }, [initialized, initializeAuth]);

  useEffect(() => {
    if (isAuthenticated && token) {
      socketService.connect(token);
    } else {
      socketService.disconnect();
    }

    return () => {
      socketService.disconnect();
    };
  }, [isAuthenticated, token]);

  if (!initialized) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <SidebarProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Auth Routes */}
              <Route
                path="/login"
                element={isAuthenticated ? <Navigate to="/" replace /> : <Login />}
              />
              <Route
                path="/register"
                element={isAuthenticated ? <Navigate to="/" replace /> : <Register />}
              />

              {/* Protected Routes */}
              <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                <Route index element={<Dashboard />} />
                <Route path="projects/:id" element={<ProjectDetails />} />
                <Route path="calendar" element={<Calendar />} />
                <Route path="team" element={<Team />} />
                <Route path="search" element={<SearchPage />} />
              </Route>

              {/* 404 Route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </SidebarProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}
import { Navigate, useLocation } from "react-router-dom";
import useAuthStore from "@/lib/stores/auth-store";
import { useEffect } from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, loading, initialized, initializeAuth } = useAuthStore();
  const location = useLocation();

  useEffect(() => {
    if (!initialized) {
      initializeAuth();
    }
  }, [initialized, initializeAuth]);

  if (!initialized || loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Save the attempted location for redirect after login
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return <>{children}</>;
}
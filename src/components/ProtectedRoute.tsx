import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

const ProtectedRoute = ({ children, requireAuth = true }: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Show loading state or spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-navy border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (requireAuth) {
    // Protected route - redirect to login if not authenticated
    if (!isAuthenticated) {
      return <Navigate to="/login" state={{ from: location.pathname }} replace />;
    }
  } else {
    // Auth-only route (login/register) - redirect to home if already authenticated
    if (isAuthenticated) {
      return <Navigate to="/" replace />;
    }
  }

  // Render the content
  return <>{children}</>;
};

export default ProtectedRoute;

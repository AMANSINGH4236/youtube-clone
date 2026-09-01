// components/auth/ProtectedRoute.jsx — FE-09
import { Navigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.js";

function ProtectedRoute({ children }) {
  const { isAuthed, loading } = useAuth();

  if (loading) return null;

  return isAuthed ? children : <Navigate to="/login" replace />;
}

export default ProtectedRoute;
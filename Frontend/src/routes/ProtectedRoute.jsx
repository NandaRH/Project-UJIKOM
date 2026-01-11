import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, onlyAdmin = false }) {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;
  if (onlyAdmin && user.role !== "admin")
    return <Navigate to="/user/dashboard" replace />;
  return children;
}

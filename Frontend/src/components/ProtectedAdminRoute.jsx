import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedAdminRoute({ children }) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return (
      <Navigate
        to="/login/admin"
        replace
        state={{ from: location.pathname + location.search }}
      />
    );
  }

  if (user.role !== "admin") {
    return <Navigate to="/user/dashboard" replace />;
  }

  return children || <Outlet />;
}


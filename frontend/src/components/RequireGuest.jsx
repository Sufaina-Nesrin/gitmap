import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function RequireGuest({ children }) {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (user) {
    return <Navigate to="/" replace />;
  }

  return children;
}
export default RequireGuest
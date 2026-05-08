import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const AdminRoute = ({ children }) => {
  const { isLoggedIn, isAdmin } = useAuth();
  if (!isLoggedIn) return <Navigate to="/signin" replace />;
  if (!isAdmin)    return <Navigate to="/"       replace />;
  return children;
};

export default AdminRoute;

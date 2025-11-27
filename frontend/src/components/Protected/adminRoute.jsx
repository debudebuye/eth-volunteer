import { Navigate } from "react-router-dom";
import useAuthStore from "../../store/authStore";

const AdminRoute = ({ children, role }) => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated || !user) {
    return <Navigate to="/admin" replace />;
  }

  if (role && user.role !== role) {
    return <Navigate to="/admin" replace />;
  }

  return children;
};

export default AdminRoute;
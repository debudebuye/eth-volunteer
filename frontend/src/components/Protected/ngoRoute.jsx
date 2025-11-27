import { Navigate } from "react-router-dom";
import useAuthStore from "../../store/authStore";

const NgoRoute = ({ children, role }) => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login-ngo" replace />;
  }

  if (role && user.role !== role) {
    return <Navigate to="/ngo" replace />;
  }

  return children;
};

export default NgoRoute;

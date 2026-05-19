import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Login from './Login';

const Index = () => {
  const { isLoggedIn, user } = useAuth();

  if (isLoggedIn) {
    if (user?.isAdmin) {
      return <Navigate to="/admin" replace />;
    }
    return <Navigate to="/predict" replace />;
  }

  return <Login />;
};

export default Index;

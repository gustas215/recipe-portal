import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { ErrorState } from './States.jsx';

// Puslapis tik prisijungusiems (role = 'admin' reiškia, kad tik administratoriui)
export default function ProtectedRoute({ role, children }) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (role && user.role !== role) {
    return (
      <div className="container section">
        <ErrorState title="Neturite teisių" message="Šis puslapis skirtas tik administratoriui." />
      </div>
    );
  }

  return children;
}

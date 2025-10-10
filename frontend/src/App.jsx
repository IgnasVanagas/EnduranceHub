import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './hooks/useAuth.js';
import Layout from './components/Layout.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import AthleteProfilePage from './pages/AthleteProfilePage.jsx';
import TrainingPlansPage from './pages/TrainingPlansPage.jsx';
import NutritionPlansPage from './pages/NutritionPlansPage.jsx';
import MessagesPage from './pages/MessagesPage.jsx';
import Loader from './components/Loader.jsx';

const ProtectedLayout = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <Loader fullscreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Layout />;
};

const GuestRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <Loader fullscreen />;
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <GuestRoute>
            <LoginPage />
          </GuestRoute>
        }
      />
      <Route
        path="/register"
        element={
          <GuestRoute>
            <RegisterPage />
          </GuestRoute>
        }
      />
      <Route path="/" element={<ProtectedLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="athlete" element={<AthleteProfilePage />} />
        <Route path="training-plans" element={<TrainingPlansPage />} />
        <Route path="nutrition-plans" element={<NutritionPlansPage />} />
        <Route path="messages" element={<MessagesPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;

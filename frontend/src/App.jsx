import { Route, Routes } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import Footer from './components/Footer.jsx';
import Header from './components/Header.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import ScrollToTop from './components/ScrollToTop.jsx';
import SplashScreen from './components/SplashScreen.jsx';
import Admin from './pages/Admin.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import NotFound from './pages/NotFound.jsx';
import Recipe from './pages/Recipe.jsx';
import Recipes from './pages/Recipes.jsx';
import Register from './pages/Register.jsx';
import './pages/pages.css';

export default function App() {
  const { loading } = useAuth();

  // Kol bandoma atkurti sesiją, rodome kraunimo ekraną
  if (loading) {
    return <SplashScreen />;
  }

  return (
    <div className="app">
      <ScrollToTop />
      <Header />
      <main className="site-main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/recipes" element={<Recipes />} />
          <Route path="/categories/:categoryId" element={<Recipes />} />
          <Route path="/categories/:categoryId/recipes/:recipeId" element={<Recipe />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute role="admin">
                <Admin />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

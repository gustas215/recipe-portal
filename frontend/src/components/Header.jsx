import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FaUtensils } from 'react-icons/fa';
import {
  FiBookOpen,
  FiHome,
  FiLogIn,
  FiLogOut,
  FiMenu,
  FiSettings,
  FiUser,
  FiUserPlus,
  FiX,
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext.jsx';
import './Header.css';

export default function Header() {
  const { user, isAdmin, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Pakeitus puslapį mobilus meniu užsidaro
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  async function handleLogout() {
    await logout();
    toast.success('Atsijungta');
    navigate('/');
  }

  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link to="/" className="logo">
          <FaUtensils aria-hidden="true" />
          <span>Receptų portalas</span>
        </Link>

        <button
          type="button"
          className="nav-toggle"
          aria-label={open ? 'Uždaryti meniu' : 'Atidaryti meniu'}
          aria-expanded={open}
          aria-controls="main-nav"
          onClick={() => setOpen(!open)}
        >
          {open ? <FiX /> : <FiMenu />}
        </button>

        <nav id="main-nav" className={`nav ${open ? 'nav-open' : ''}`} aria-label="Pagrindinė navigacija">
          <NavLink to="/" end className="nav-link">
            <FiHome aria-hidden="true" /> Pradžia
          </NavLink>
          <NavLink to="/recipes" className="nav-link">
            <FiBookOpen aria-hidden="true" /> Receptai
          </NavLink>

          {user ? (
            <>
              <NavLink to="/dashboard" className="nav-link">
                <FiUser aria-hidden="true" /> Mano skydelis
              </NavLink>
              {isAdmin && (
                <NavLink to="/admin" className="nav-link">
                  <FiSettings aria-hidden="true" /> Administravimas
                </NavLink>
              )}
              <button type="button" className="nav-link nav-button" onClick={handleLogout}>
                <FiLogOut aria-hidden="true" /> Atsijungti ({user.username})
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className="nav-link">
                <FiLogIn aria-hidden="true" /> Prisijungti
              </NavLink>
              <NavLink to="/register" className="nav-link nav-cta">
                <FiUserPlus aria-hidden="true" /> Registruotis
              </NavLink>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

import { Link } from 'react-router-dom';
import { FaGithub, FaUtensils } from 'react-icons/fa';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div>
          <p className="footer-brand">
            <FaUtensils aria-hidden="true" /> Receptų portalas
          </p>
          <p>Platforma, kurioje dalijamasi maisto gaminimo receptais, jie komentuojami ir vertinami.</p>
        </div>

        <div>
          <h3>Naršyti</h3>
          <ul>
            <li>
              <Link to="/">Pradžia</Link>
            </li>
            <li>
              <Link to="/recipes">Visi receptai</Link>
            </li>
            <li>
              <Link to="/register">Registracija</Link>
            </li>
          </ul>
        </div>

        <div>
          <h3>Apie projektą</h3>
          <ul>
            <li>KTU, T120B165 Saityno taikomųjų programų projektavimas</li>
            <li>Gustas Valaika, IF-4</li>
            <li>
              <a href="https://github.com/gustas215/recipe-portal" target="_blank" rel="noreferrer">
                <FaGithub aria-hidden="true" /> Kodas GitHub
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <div className="container">© {new Date().getFullYear()} Receptų portalas</div>
      </div>
    </footer>
  );
}

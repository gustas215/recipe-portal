import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiArrowRight, FiSearch } from 'react-icons/fi';
import RecipeCard from '../components/RecipeCard.jsx';
import { EmptyState, ErrorState, Loader } from '../components/States.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import useFetch from '../hooks/useFetch.js';

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const categories = useFetch('/categories', { limit: 50 });
  const latest = useFetch('/recipes', { limit: 6 });

  function handleSearch(event) {
    event.preventDefault();
    navigate(`/recipes?search=${encodeURIComponent(search.trim())}`);
  }

  return (
    <>
      <section className="hero">
        <div className="container hero-inner">
          <div className="hero-text">
            <h1>Dalinkitės receptais ir atraskite naujų skonių</h1>
            <p>Kurkite savo receptus, vertinkite kitų patiekalus ir kaupkite mėgstamiausius vienoje vietoje.</p>
            <form className="hero-search" onSubmit={handleSearch} role="search">
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Ieškoti recepto pagal pavadinimą"
                aria-label="Ieškoti recepto pagal pavadinimą"
              />
              <button type="submit" className="btn btn-primary">
                <FiSearch aria-hidden="true" /> Ieškoti
              </button>
            </form>
            {!user && (
              <Link to="/register" className="hero-link">
                Registruokitės ir pradėkite dalintis <FiArrowRight aria-hidden="true" />
              </Link>
            )}
          </div>
          <img className="hero-image" src="/images/hero.svg" alt="Garuojantis dubuo su pomidorų sriuba" />
        </div>
      </section>

      <section className="container section fade-in">
        <h2 className="section-title">Kategorijos</h2>
        {categories.loading && !categories.data ? (
          <Loader />
        ) : categories.error ? (
          <ErrorState error={categories.error} onRetry={categories.reload} />
        ) : (
          <div className="category-grid">
            {categories.data.data.map((category) => (
              <Link key={category.id} to={`/categories/${category.id}`} className="category-card card">
                <img src={category.imageUrl || '/images/category.svg'} alt="" loading="lazy" />
                <div className="category-card-body">
                  <h3>{category.name}</h3>
                  <p>{category.description}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="container section fade-in">
        <div className="section-head">
          <h2 className="section-title">Naujausi receptai</h2>
          <Link to="/recipes" className="link-arrow">
            Visi receptai <FiArrowRight aria-hidden="true" />
          </Link>
        </div>
        {latest.loading && !latest.data ? (
          <Loader />
        ) : latest.error ? (
          <ErrorState error={latest.error} onRetry={latest.reload} />
        ) : latest.data.data.length === 0 ? (
          <EmptyState title="Receptų dar nėra" text="Būkite pirmas, kuris paskelbs receptą." />
        ) : (
          <div className="recipe-grid">
            {latest.data.data.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}

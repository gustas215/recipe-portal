import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { FiPlus, FiSearch, FiX } from 'react-icons/fi';
import Pagination from '../components/Pagination.jsx';
import RecipeCard from '../components/RecipeCard.jsx';
import RecipeFormModal from '../components/RecipeFormModal.jsx';
import { EmptyState, ErrorState, Loader } from '../components/States.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import useFetch from '../hooks/useFetch.js';
import { DIFFICULTY_LABELS } from '../utils/labels.js';

// Receptų sąrašas su filtrais ir puslapiavimu.
// Adresas /categories/:categoryId rodo vienos kategorijos receptus, /recipes visus.
export default function Recipes() {
  const { categoryId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();

  // Filtrai ir puslapis laikomi adreso parametruose (veikia naršyklės mygtukas "atgal")
  const page = Number(params.get('page')) || 1;
  const applied = {
    search: params.get('search') || '',
    difficulty: params.get('difficulty') || '',
    maxTime: params.get('maxTime') || '',
  };

  // Formos laukų juodraštis, pritaikomas paspaudus "Filtruoti"
  const [draft, setDraft] = useState(applied);
  const [showForm, setShowForm] = useState(false);

  // Pakeitus kategoriją ar adreso parametrus formos laukai atnaujinami pagal adresą
  useEffect(() => {
    setDraft({
      search: params.get('search') || '',
      difficulty: params.get('difficulty') || '',
      maxTime: params.get('maxTime') || '',
    });
  }, [params, categoryId]);

  const category = useFetch(`/categories/${categoryId}`, undefined, Boolean(categoryId));
  const listUrl = categoryId ? `/categories/${categoryId}/recipes` : '/recipes';
  const recipes = useFetch(listUrl, {
    page,
    limit: 9,
    search: applied.search || undefined,
    difficulty: applied.difficulty || undefined,
    maxTime: applied.maxTime || undefined,
  });

  function updateParams(values) {
    const next = {};
    for (const [key, value] of Object.entries(values)) {
      if (value) next[key] = value;
    }
    setParams(next);
  }

  function handleFilter(event) {
    event.preventDefault();
    updateParams({ search: draft.search.trim(), difficulty: draft.difficulty, maxTime: draft.maxTime });
  }

  function handleReset() {
    setDraft({ search: '', difficulty: '', maxTime: '' });
    setParams({});
  }

  function handlePage(newPage) {
    updateParams({ ...applied, page: newPage > 1 ? String(newPage) : '' });
  }

  function handleSaved(recipe) {
    setShowForm(false);
    navigate(`/categories/${recipe.categoryId}/recipes/${recipe.id}`);
  }

  if (categoryId && category.error) {
    return (
      <div className="container section">
        <ErrorState error={category.error} title="Kategorija nerasta" />
      </div>
    );
  }

  const title = categoryId ? category.data?.name || 'Kategorija' : 'Visi receptai';
  const hasFilters = applied.search || applied.difficulty || applied.maxTime;

  return (
    <div className="container section fade-in">
      <nav className="breadcrumb" aria-label="Kelias">
        <Link to="/">Pradžia</Link> / <span>{title}</span>
      </nav>

      <div className="section-head">
        <div>
          <h1>{title}</h1>
          {categoryId && category.data && <p className="lead">{category.data.description}</p>}
        </div>
        {user && (
          <button type="button" className="btn btn-primary" onClick={() => setShowForm(true)}>
            <FiPlus aria-hidden="true" /> Naujas receptas
          </button>
        )}
      </div>

      <form className="filters" onSubmit={handleFilter} role="search">
        <label className="filter">
          <span>Paieška</span>
          <input
            type="text"
            value={draft.search}
            onChange={(event) => setDraft({ ...draft, search: event.target.value })}
            placeholder="Recepto pavadinimas"
          />
        </label>
        <label className="filter">
          <span>Sudėtingumas</span>
          <select
            value={draft.difficulty}
            onChange={(event) => setDraft({ ...draft, difficulty: event.target.value })}
          >
            <option value="">Visi</option>
            {Object.entries(DIFFICULTY_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label className="filter">
          <span>Laikas iki (min.)</span>
          <input
            type="number"
            min="1"
            value={draft.maxTime}
            onChange={(event) => setDraft({ ...draft, maxTime: event.target.value })}
            placeholder="pvz. 60"
          />
        </label>
        <div className="filter-actions">
          <button type="submit" className="btn btn-primary">
            <FiSearch aria-hidden="true" /> Filtruoti
          </button>
          {hasFilters && (
            <button type="button" className="btn btn-ghost" onClick={handleReset}>
              <FiX aria-hidden="true" /> Išvalyti
            </button>
          )}
        </div>
      </form>

      {recipes.loading && !recipes.data ? (
        <Loader />
      ) : recipes.error ? (
        <ErrorState error={recipes.error} onRetry={recipes.reload} />
      ) : recipes.data.data.length === 0 ? (
        <EmptyState
          title="Receptų nerasta"
          text={hasFilters ? 'Pabandykite pakeisti filtrus.' : 'Šioje vietoje receptų dar nėra.'}
        />
      ) : (
        <>
          <p className="result-count">Rasta receptų: {recipes.data.pagination.totalItems}</p>
          <div className={`recipe-grid ${recipes.loading ? 'is-loading' : ''}`}>
            {recipes.data.data.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
          <Pagination pagination={recipes.data.pagination} onChange={handlePage} />
        </>
      )}

      {showForm && (
        <RecipeFormModal
          defaultCategoryId={categoryId ? Number(categoryId) : undefined}
          onClose={() => setShowForm(false)}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}

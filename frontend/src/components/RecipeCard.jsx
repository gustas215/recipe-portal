import { Link } from 'react-router-dom';
import { FiClock, FiUsers, FiUser } from 'react-icons/fi';
import { StarRating } from './StarRating.jsx';
import { DIFFICULTY_LABELS, formatMinutes } from '../utils/labels.js';
import './RecipeCard.css';

const PLACEHOLDER = '/images/placeholder.svg';

// Recepto kortelė sąrašuose. actions rodomi apačioje (redagavimo ir trynimo mygtukai).
export default function RecipeCard({ recipe, actions }) {
  const link = `/categories/${recipe.categoryId}/recipes/${recipe.id}`;

  function showFallbackImage(event) {
    // dataset žymė apsaugo nuo begalinio ciklo, jei ir pakaitinė nuotrauka nepavyktų
    if (!event.currentTarget.dataset.fallback) {
      event.currentTarget.dataset.fallback = 'true';
      event.currentTarget.src = PLACEHOLDER;
    }
  }

  return (
    <article className="recipe-card card">
      <Link to={link} className="recipe-card-image" tabIndex={-1} aria-hidden="true">
        <img src={recipe.imageUrl || PLACEHOLDER} alt="" loading="lazy" onError={showFallbackImage} />
        <span className={`badge badge-${recipe.difficulty}`}>{DIFFICULTY_LABELS[recipe.difficulty]}</span>
      </Link>

      <div className="recipe-card-body">
        {recipe.category && <span className="recipe-card-category">{recipe.category.name}</span>}
        <h3>
          <Link to={link}>{recipe.title}</Link>
        </h3>
        <StarRating value={recipe.averageRating} count={recipe.commentCount} />
        <ul className="recipe-meta">
          <li>
            <FiClock aria-hidden="true" /> {formatMinutes(recipe.prepTimeMinutes)}
          </li>
          <li>
            <FiUsers aria-hidden="true" /> {recipe.servings} porc.
          </li>
          {recipe.author && (
            <li>
              <FiUser aria-hidden="true" /> {recipe.author.username}
            </li>
          )}
        </ul>
      </div>

      {actions && <div className="recipe-card-actions">{actions}</div>}
    </article>
  );
}

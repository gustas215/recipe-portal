import { FaStar, FaRegStar, FaStarHalfAlt } from 'react-icons/fa';
import './StarRating.css';

// Įvertinimo rodymas (tik skaitymui)
export function StarRating({ value, count }) {
  if (value === null || value === undefined) {
    return <span className="stars stars-empty">Dar nevertinta</span>;
  }

  const stars = [1, 2, 3, 4, 5].map((n) => {
    if (value >= n) return <FaStar key={n} />;
    if (value >= n - 0.5) return <FaStarHalfAlt key={n} />;
    return <FaRegStar key={n} />;
  });

  return (
    <span className="stars" aria-label={`Įvertinimas ${value} iš 5`}>
      {stars}
      <span className="stars-value">{value.toFixed(1)}</span>
      {count !== undefined && <span className="stars-count">({count})</span>}
    </span>
  );
}

// Įvertinimo pasirinkimas 1-5 žvaigždutėmis (formoms)
export function StarInput({ value, onChange }) {
  return (
    <div className="star-input" role="radiogroup" aria-label="Įvertinimas">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={value === n}
          aria-label={`${n} iš 5`}
          className={n <= value ? 'active' : ''}
          onClick={() => onChange(n)}
        >
          {n <= value ? <FaStar /> : <FaRegStar />}
        </button>
      ))}
    </div>
  );
}

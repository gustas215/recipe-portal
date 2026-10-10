import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

// Puslapiavimas pagal API pagination objektą { page, totalPages }
export default function Pagination({ pagination, onChange }) {
  if (!pagination || pagination.totalPages <= 1) {
    return null;
  }

  const { page, totalPages } = pagination;
  const pages = [];
  for (let p = Math.max(1, page - 2); p <= Math.min(totalPages, page + 2); p += 1) {
    pages.push(p);
  }

  return (
    <nav className="pagination" aria-label="Puslapiavimas">
      <button type="button" disabled={page === 1} onClick={() => onChange(page - 1)}>
        <FiChevronLeft aria-hidden="true" /> Atgal
      </button>
      {pages.map((p) => (
        <button
          key={p}
          type="button"
          className={p === page ? 'active' : ''}
          aria-current={p === page ? 'page' : undefined}
          onClick={() => onChange(p)}
        >
          {p}
        </button>
      ))}
      <button type="button" disabled={page === totalPages} onClick={() => onChange(page + 1)}>
        Pirmyn <FiChevronRight aria-hidden="true" />
      </button>
    </nav>
  );
}

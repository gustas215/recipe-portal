import { getErrorMessage } from '../api/errors.js';

// Krovimo, tuščio sąrašo ir klaidos būsenos, naudojamos visuose puslapiuose

export function Loader({ text = 'Kraunama...' }) {
  return (
    <div className="state state-loading" role="status">
      <span className="spinner" aria-hidden="true" />
      <p>{text}</p>
    </div>
  );
}

export function EmptyState({ title, text, action }) {
  return (
    <div className="state">
      <img src="/images/empty.svg" alt="" className="state-image" />
      <h3>{title}</h3>
      {text && <p>{text}</p>}
      {action}
    </div>
  );
}

export function ErrorState({ error, title = 'Nepavyko įkelti duomenų', message, onRetry }) {
  return (
    <div className="state state-error" role="alert">
      <h3>{title}</h3>
      <p>{message || (error ? getErrorMessage(error) : '')}</p>
      {onRetry && (
        <button type="button" className="btn btn-outline" onClick={onRetry}>
          Bandyti dar kartą
        </button>
      )}
    </div>
  );
}

// Formos laukas su pavadinimu ir klaidos žinute. Etiketė apgaubia lauką, todėl jie susieti automatiškai.
export default function FormField({ label, error, hint, children }) {
  return (
    <div className={`field ${error ? 'field-invalid' : ''}`}>
      <label>
        <span className="field-label">{label}</span>
        {children}
      </label>
      {hint && !error && <small className="field-hint">{hint}</small>}
      {error && (
        <small className="field-error" role="alert">
          {error}
        </small>
      )}
    </div>
  );
}

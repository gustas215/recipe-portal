import { useState } from 'react';
import { getErrorMessage, getFieldErrors } from '../api/errors.js';
import FormField from './FormField.jsx';
import { StarInput } from './StarRating.jsx';

// Atsiliepimo forma (kūrimui ir redagavimui). onSubmit gauna { rating, text } ir meta klaidą, jei nepavyksta.
export default function ReviewForm({ initial, submitLabel, onSubmit, onCancel }) {
  const [rating, setRating] = useState(initial?.rating ?? 0);
  const [text, setText] = useState(initial?.text ?? '');
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    if (rating === 0) {
      setErrors({ rating: 'Pasirinkite įvertinimą' });
      return;
    }

    setSaving(true);
    setErrors({});
    setFormError('');
    try {
      await onSubmit({ rating, text });
      if (!initial) {
        // Sukūrus naują atsiliepimą forma išvaloma
        setRating(0);
        setText('');
      }
    } catch (error) {
      if (error.response?.status === 422) {
        setErrors(getFieldErrors(error));
      } else {
        setFormError(getErrorMessage(error));
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="review-form" onSubmit={handleSubmit} noValidate>
      {formError && (
        <p className="form-error" role="alert">
          {formError}
        </p>
      )}

      <div className="field">
        <span className="field-label">Jūsų įvertinimas</span>
        <StarInput value={rating} onChange={setRating} />
        {errors.rating && (
          <small className="field-error" role="alert">
            {errors.rating}
          </small>
        )}
      </div>

      <FormField label="Komentaras" error={errors.text}>
        <textarea rows={3} value={text} onChange={(event) => setText(event.target.value)} />
      </FormField>

      <div className="form-actions">
        {onCancel && (
          <button type="button" className="btn btn-ghost" onClick={onCancel} disabled={saving}>
            Atšaukti
          </button>
        )}
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? 'Saugoma...' : submitLabel}
        </button>
      </div>
    </form>
  );
}

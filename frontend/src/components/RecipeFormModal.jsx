import { useState } from 'react';
import toast from 'react-hot-toast';
import api from '../api/client.js';
import { getErrorMessage, getFieldErrors } from '../api/errors.js';
import useFetch from '../hooks/useFetch.js';
import { DIFFICULTY_LABELS } from '../utils/labels.js';
import FormField from './FormField.jsx';
import Modal from './Modal.jsx';

// Recepto kūrimas (recipe nėra) arba redagavimas (recipe perduotas)
export default function RecipeFormModal({ recipe, defaultCategoryId, onClose, onSaved }) {
  const isEdit = Boolean(recipe);
  const categories = useFetch('/categories', { limit: 50 });

  const [form, setForm] = useState({
    categoryId: recipe?.categoryId ?? defaultCategoryId ?? '',
    title: recipe?.title ?? '',
    description: recipe?.description ?? '',
    ingredients: recipe?.ingredients ?? '',
    prepTimeMinutes: recipe?.prepTimeMinutes ?? 30,
    difficulty: recipe?.difficulty ?? 'easy',
    servings: recipe?.servings ?? 4,
    imageUrl: recipe?.imageUrl ?? '',
  });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  function handleChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!form.categoryId) {
      setErrors({ categoryId: 'Pasirinkite kategoriją' });
      return;
    }

    setSaving(true);
    setErrors({});
    setFormError('');

    const payload = {
      title: form.title,
      description: form.description,
      ingredients: form.ingredients,
      prepTimeMinutes: Number(form.prepTimeMinutes),
      difficulty: form.difficulty,
      servings: Number(form.servings),
      imageUrl: form.imageUrl.trim() || null,
    };

    try {
      const response = isEdit
        ? await api.put(`/categories/${recipe.categoryId}/recipes/${recipe.id}`, payload)
        : await api.post(`/categories/${form.categoryId}/recipes`, payload);
      toast.success(isEdit ? 'Receptas atnaujintas' : 'Receptas sukurtas');
      onSaved(response.data);
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
    <Modal
      title={isEdit ? 'Redaguoti receptą' : 'Naujas receptas'}
      onClose={onClose}
      footer={
        <>
          <button type="button" className="btn btn-ghost" onClick={onClose} disabled={saving}>
            Atšaukti
          </button>
          <button type="submit" form="recipe-form" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saugoma...' : 'Išsaugoti'}
          </button>
        </>
      }
    >
      <form id="recipe-form" onSubmit={handleSubmit} noValidate>
        {formError && (
          <p className="form-error" role="alert">
            {formError}
          </p>
        )}

        <FormField
          label="Kategorija"
          error={errors.categoryId}
          hint={isEdit ? 'Recepto kategorijos pakeisti negalima' : undefined}
        >
          <select name="categoryId" value={form.categoryId} onChange={handleChange} disabled={isEdit}>
            <option value="">Pasirinkite kategoriją</option>
            {categories.data?.data.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </FormField>

        <FormField label="Pavadinimas" error={errors.title}>
          <input type="text" name="title" value={form.title} onChange={handleChange} maxLength={150} />
        </FormField>

        <FormField label="Aprašymas (gaminimo eiga)" error={errors.description}>
          <textarea name="description" rows={5} value={form.description} onChange={handleChange} />
        </FormField>

        <FormField label="Ingredientai" error={errors.ingredients} hint="Kiekvienas ingredientas naujoje eilutėje">
          <textarea name="ingredients" rows={4} value={form.ingredients} onChange={handleChange} />
        </FormField>

        <div className="field-row">
          <FormField label="Gaminimo laikas (min.)" error={errors.prepTimeMinutes}>
            <input type="number" name="prepTimeMinutes" min="1" value={form.prepTimeMinutes} onChange={handleChange} />
          </FormField>
          <FormField label="Porcijų kiekis" error={errors.servings}>
            <input type="number" name="servings" min="1" value={form.servings} onChange={handleChange} />
          </FormField>
        </div>

        <fieldset className="field radio-group">
          <legend className="field-label">Sudėtingumas</legend>
          {Object.entries(DIFFICULTY_LABELS).map(([value, label]) => (
            <label key={value} className="radio">
              <input
                type="radio"
                name="difficulty"
                value={value}
                checked={form.difficulty === value}
                onChange={handleChange}
              />
              {label}
            </label>
          ))}
          {errors.difficulty && (
            <small className="field-error" role="alert">
              {errors.difficulty}
            </small>
          )}
        </fieldset>

        <FormField label="Nuotraukos nuoroda (nebūtina)" error={errors.imageUrl} hint="http arba https adresas">
          <input type="url" name="imageUrl" value={form.imageUrl} onChange={handleChange} placeholder="https://..." />
        </FormField>
      </form>
    </Modal>
  );
}

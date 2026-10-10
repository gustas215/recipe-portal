import { useState } from 'react';
import toast from 'react-hot-toast';
import api from '../api/client.js';
import { getErrorMessage, getFieldErrors } from '../api/errors.js';
import FormField from './FormField.jsx';
import Modal from './Modal.jsx';

// Kategorijos kūrimas (category nėra) arba redagavimas. Naudoja administratorius.
export default function CategoryFormModal({ category, onClose, onSaved }) {
  const isEdit = Boolean(category);
  const [form, setForm] = useState({
    name: category?.name ?? '',
    description: category?.description ?? '',
    imageUrl: category?.imageUrl ?? '',
  });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  function handleChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setErrors({});
    setFormError('');

    const payload = {
      name: form.name,
      description: form.description,
      imageUrl: form.imageUrl.trim() || null,
    };

    try {
      const response = isEdit
        ? await api.put(`/categories/${category.id}`, payload)
        : await api.post('/categories', payload);
      toast.success(isEdit ? 'Kategorija atnaujinta' : 'Kategorija sukurta');
      onSaved(response.data);
    } catch (error) {
      const status = error.response?.status;
      if (status === 422) {
        setErrors(getFieldErrors(error));
      } else if (status === 409) {
        setErrors({ name: 'Kategorija tokiu pavadinimu jau yra' });
      } else {
        setFormError(getErrorMessage(error));
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      title={isEdit ? 'Redaguoti kategoriją' : 'Nauja kategorija'}
      onClose={onClose}
      footer={
        <>
          <button type="button" className="btn btn-ghost" onClick={onClose} disabled={saving}>
            Atšaukti
          </button>
          <button type="submit" form="category-form" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saugoma...' : 'Išsaugoti'}
          </button>
        </>
      }
    >
      <form id="category-form" onSubmit={handleSubmit} noValidate>
        {formError && (
          <p className="form-error" role="alert">
            {formError}
          </p>
        )}
        <FormField label="Pavadinimas" error={errors.name}>
          <input type="text" name="name" value={form.name} onChange={handleChange} maxLength={100} />
        </FormField>
        <FormField label="Aprašymas" error={errors.description}>
          <textarea name="description" rows={4} value={form.description} onChange={handleChange} />
        </FormField>
        <FormField label="Nuotraukos nuoroda (nebūtina)" error={errors.imageUrl} hint="http arba https adresas">
          <input type="url" name="imageUrl" value={form.imageUrl} onChange={handleChange} placeholder="https://..." />
        </FormField>
      </form>
    </Modal>
  );
}

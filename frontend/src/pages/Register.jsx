import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiUserPlus } from 'react-icons/fi';
import { getErrorMessage, getFieldErrors } from '../api/errors.js';
import FormField from '../components/FormField.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function Register() {
  const { user, register } = useAuth();
  const [form, setForm] = useState({ username: '', email: '', password: '', repeat: '' });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  // Prisijungęs naudotojas (taip pat ir iškart po registracijos) nukreipiamas į skydelį
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  function handleChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setErrors({});
    setFormError('');

    // Slaptažodžių sutapimą tikriname naršyklėje, serveris gauna tik vieną slaptažodį
    if (form.password !== form.repeat) {
      setErrors({ repeat: 'Slaptažodžiai nesutampa' });
      return;
    }

    setSaving(true);
    try {
      const created = await register(form.username.trim(), form.email.trim(), form.password);
      toast.success(`Paskyra sukurta. Sveiki, ${created.username}!`);
    } catch (error) {
      const status = error.response?.status;
      if (status === 422) {
        setErrors(getFieldErrors(error));
      } else if (status === 409) {
        setFormError('Toks naudotojo vardas arba el. paštas jau užregistruotas');
      } else {
        setFormError(getErrorMessage(error));
      }
      setSaving(false);
    }
  }

  return (
    <div className="container section auth-page fade-in">
      <div className="auth-card panel">
        <h1>Registracija</h1>
        <form onSubmit={handleSubmit} noValidate>
          {formError && (
            <p className="form-error" role="alert">
              {formError}
            </p>
          )}
          <FormField label="Naudotojo vardas" error={errors.username}>
            <input type="text" name="username" value={form.username} onChange={handleChange} autoComplete="username" />
          </FormField>
          <FormField label="El. paštas" error={errors.email}>
            <input type="email" name="email" value={form.email} onChange={handleChange} autoComplete="email" />
          </FormField>
          <FormField label="Slaptažodis" error={errors.password} hint="Bent 8 simboliai">
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              autoComplete="new-password"
            />
          </FormField>
          <FormField label="Pakartokite slaptažodį" error={errors.repeat}>
            <input
              type="password"
              name="repeat"
              value={form.repeat}
              onChange={handleChange}
              autoComplete="new-password"
            />
          </FormField>
          <button type="submit" className="btn btn-primary btn-block" disabled={saving}>
            <FiUserPlus aria-hidden="true" /> {saving ? 'Kuriama...' : 'Sukurti paskyrą'}
          </button>
        </form>
        <p className="auth-switch">
          Jau turite paskyrą? <Link to="/login">Prisijunkite</Link>
        </p>
      </div>
    </div>
  );
}

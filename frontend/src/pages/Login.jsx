import { useState } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiLogIn } from 'react-icons/fi';
import { getErrorMessage, getFieldErrors } from '../api/errors.js';
import FormField from '../components/FormField.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
  const { user, login } = useAuth();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  // Prisijungęs naudotojas šio puslapio nemato: nukreipiamas ten, iš kur atėjo, arba į skydelį.
  // Tai veikia ir iškart po sėkmingo prisijungimo, nes tada user tampa netuščias.
  if (user) {
    return <Navigate to={location.state?.from || '/dashboard'} replace />;
  }

  function handleChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setErrors({});
    setFormError('');
    try {
      const loggedIn = await login(form.email.trim(), form.password);
      toast.success(`Sveiki, ${loggedIn.username}!`);
    } catch (error) {
      if (error.response?.status === 422) {
        setErrors(getFieldErrors(error));
      } else {
        setFormError(getErrorMessage(error));
      }
      setSaving(false);
    }
  }

  return (
    <div className="container section auth-page fade-in">
      <div className="auth-card panel">
        <h1>Prisijungimas</h1>
        <form onSubmit={handleSubmit} noValidate>
          {formError && (
            <p className="form-error" role="alert">
              {formError}
            </p>
          )}
          <FormField label="El. paštas" error={errors.email}>
            <input type="email" name="email" value={form.email} onChange={handleChange} autoComplete="email" />
          </FormField>
          <FormField label="Slaptažodis" error={errors.password}>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              autoComplete="current-password"
            />
          </FormField>
          <button type="submit" className="btn btn-primary btn-block" disabled={saving}>
            <FiLogIn aria-hidden="true" /> {saving ? 'Jungiamasi...' : 'Prisijungti'}
          </button>
        </form>
        <p className="auth-switch">
          Neturite paskyros? <Link to="/register">Registruokitės</Link>
        </p>
      </div>
    </div>
  );
}

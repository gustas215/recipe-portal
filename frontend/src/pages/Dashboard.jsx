import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiEdit2, FiPlus, FiTrash2 } from 'react-icons/fi';
import api from '../api/client.js';
import { getErrorMessage } from '../api/errors.js';
import ConfirmModal from '../components/ConfirmModal.jsx';
import RecipeCard from '../components/RecipeCard.jsx';
import RecipeFormModal from '../components/RecipeFormModal.jsx';
import { StarRating } from '../components/StarRating.jsx';
import { EmptyState, ErrorState, Loader } from '../components/States.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import useFetch from '../hooks/useFetch.js';
import { formatDate, hrefToRoute } from '../utils/labels.js';

// Asmeninis skydelis: naudotojas, jo receptai ir jų gauti atsiliepimai (vienas API atsakymas iš kelių esybių)
export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const dashboard = useFetch(`/users/${user.id}/dashboard`);
  // dialog: null | 'new' | { type: 'edit' | 'delete', recipe }
  const [dialog, setDialog] = useState(null);
  const closeDialog = () => setDialog(null);

  async function deleteRecipe(recipe) {
    try {
      await api.delete(`/categories/${recipe.categoryId}/recipes/${recipe.id}`);
      toast.success('Receptas ištrintas');
      closeDialog();
      dashboard.reload();
    } catch (error) {
      toast.error(getErrorMessage(error));
      closeDialog();
    }
  }

  if (dashboard.loading && !dashboard.data) {
    return <Loader />;
  }
  if (dashboard.error) {
    return (
      <div className="container section">
        <ErrorState error={dashboard.error} onRetry={dashboard.reload} />
      </div>
    );
  }

  const { stats, recipes, receivedComments } = dashboard.data;

  return (
    <div className="container section fade-in">
      <div className="section-head">
        <div>
          <h1>Sveiki, {user.username}</h1>
          <p className="lead">{user.email}</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={() => setDialog('new')}>
          <FiPlus aria-hidden="true" /> Naujas receptas
        </button>
      </div>

      <div className="stats">
        <div className="stat panel">
          <span className="stat-value">{stats.recipeCount}</span>
          <span className="stat-label">Mano receptai</span>
        </div>
        <div className="stat panel">
          <span className="stat-value">{stats.receivedCommentCount}</span>
          <span className="stat-label">Gauti atsiliepimai</span>
        </div>
        <div className="stat panel">
          <span className="stat-value">
            <StarRating value={stats.averageRating} />
          </span>
          <span className="stat-label">Vidutinis įvertinimas</span>
        </div>
      </div>

      <h2 className="section-title">Mano receptai</h2>
      {recipes.length === 0 ? (
        <EmptyState
          title="Receptų dar neturite"
          text="Paskelbkite pirmąjį savo receptą."
          action={
            <button type="button" className="btn btn-primary" onClick={() => setDialog('new')}>
              <FiPlus aria-hidden="true" /> Naujas receptas
            </button>
          }
        />
      ) : (
        <div className="recipe-grid">
          {recipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              actions={
                <>
                  <button
                    type="button"
                    className="btn btn-small btn-outline"
                    onClick={() => setDialog({ type: 'edit', recipe })}
                  >
                    <FiEdit2 aria-hidden="true" /> Redaguoti
                  </button>
                  <button
                    type="button"
                    className="btn btn-small btn-danger-outline"
                    onClick={() => setDialog({ type: 'delete', recipe })}
                  >
                    <FiTrash2 aria-hidden="true" /> Šalinti
                  </button>
                </>
              }
            />
          ))}
        </div>
      )}

      <h2 className="section-title">Naujausi gauti atsiliepimai</h2>
      {receivedComments.length === 0 ? (
        <EmptyState title="Atsiliepimų dar nėra" text="Kai kas nors įvertins jūsų receptus, jie atsiras čia." />
      ) : (
        <ul className="review-list">
          {receivedComments.map((comment) => (
            <li key={comment.id} className="review panel">
              <div className="review-avatar" aria-hidden="true">
                {comment.author?.username?.[0]?.toUpperCase()}
              </div>
              <div className="review-main">
                <div className="review-head">
                  <strong>{comment.author?.username}</strong>
                  <span className="muted">{formatDate(comment.createdAt)}</span>
                </div>
                <StarRating value={comment.rating} />
                <p className="preline">{comment.text}</p>
                <Link to={hrefToRoute(comment._links.recipe.href)}>Eiti į receptą</Link>
              </div>
            </li>
          ))}
        </ul>
      )}

      {(dialog === 'new' || dialog?.type === 'edit') && (
        <RecipeFormModal
          recipe={dialog?.recipe}
          onClose={closeDialog}
          onSaved={(saved) => {
            const wasNew = dialog === 'new';
            closeDialog();
            if (wasNew) {
              // Naują receptą iškart parodome jo puslapyje
              navigate(`/categories/${saved.categoryId}/recipes/${saved.id}`);
            } else {
              dashboard.reload();
            }
          }}
        />
      )}

      {dialog?.type === 'delete' && (
        <ConfirmModal
          title="Šalinti receptą?"
          message={`Receptas „${dialog.recipe.title}“ ir visi jo atsiliepimai bus ištrinti. Šio veiksmo atšaukti negalima.`}
          onConfirm={() => deleteRecipe(dialog.recipe)}
          onClose={closeDialog}
        />
      )}
    </div>
  );
}

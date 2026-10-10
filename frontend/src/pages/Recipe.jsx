import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiClock, FiEdit2, FiTrash2, FiUser, FiUsers } from 'react-icons/fi';
import api from '../api/client.js';
import { getErrorMessage } from '../api/errors.js';
import ConfirmModal from '../components/ConfirmModal.jsx';
import Modal from '../components/Modal.jsx';
import Pagination from '../components/Pagination.jsx';
import RecipeFormModal from '../components/RecipeFormModal.jsx';
import ReviewForm from '../components/ReviewForm.jsx';
import { StarRating } from '../components/StarRating.jsx';
import { EmptyState, ErrorState, Loader } from '../components/States.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import useFetch from '../hooks/useFetch.js';
import { DIFFICULTY_LABELS, formatDate, formatMinutes } from '../utils/labels.js';

export default function Recipe() {
  const { categoryId, recipeId } = useParams();
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  const basePath = `/categories/${categoryId}/recipes/${recipeId}`;
  const [commentPage, setCommentPage] = useState(1);
  const category = useFetch(`/categories/${categoryId}`);
  const recipe = useFetch(basePath);
  const comments = useFetch(`${basePath}/comments`, { page: commentPage, limit: 5 });

  // Atidarytas langas: 'edit-recipe', 'delete-recipe', { type: 'edit-review' | 'delete-review', review }
  const [dialog, setDialog] = useState(null);
  const closeDialog = () => setDialog(null);

  function reloadAll() {
    recipe.reload();
    comments.reload();
  }

  if (recipe.loading && !recipe.data) {
    return <Loader />;
  }
  if (recipe.error) {
    return (
      <div className="container section">
        <ErrorState error={recipe.error} title="Receptas nerastas" />
      </div>
    );
  }

  const item = recipe.data;
  const isAuthor = user?.id === item.authorId;
  const reviews = comments.data?.data ?? [];
  const alreadyReviewed = reviews.some((review) => review.authorId === user?.id);

  async function deleteRecipe() {
    try {
      await api.delete(basePath);
      toast.success('Receptas ištrintas');
      navigate(`/categories/${categoryId}`);
    } catch (error) {
      toast.error(getErrorMessage(error));
      closeDialog();
    }
  }

  async function createReview(values) {
    await api.post(`${basePath}/comments`, values);
    toast.success('Atsiliepimas pridėtas');
    setCommentPage(1);
    reloadAll();
  }

  async function updateReview(review, values) {
    await api.put(`${basePath}/comments/${review.id}`, values);
    toast.success('Atsiliepimas atnaujintas');
    closeDialog();
    reloadAll();
  }

  async function deleteReview(review) {
    try {
      await api.delete(`${basePath}/comments/${review.id}`);
      toast.success('Atsiliepimas ištrintas');
      closeDialog();
      reloadAll();
    } catch (error) {
      toast.error(getErrorMessage(error));
      closeDialog();
    }
  }

  return (
    <div className="container section fade-in">
      <nav className="breadcrumb" aria-label="Kelias">
        <Link to="/">Pradžia</Link> / <Link to={`/categories/${categoryId}`}>{category.data?.name || 'Kategorija'}</Link> /{' '}
        <span>{item.title}</span>
      </nav>

      <article className="recipe-detail">
        <img
          className="recipe-detail-image"
          src={item.imageUrl || '/images/placeholder.svg'}
          alt={item.title}
          onError={(event) => {
            if (!event.currentTarget.dataset.fallback) {
              event.currentTarget.dataset.fallback = 'true';
              event.currentTarget.src = '/images/placeholder.svg';
            }
          }}
        />

        <div className="recipe-detail-info">
          <span className={`badge badge-${item.difficulty}`}>{DIFFICULTY_LABELS[item.difficulty]}</span>
          <h1>{item.title}</h1>
          <StarRating value={item.averageRating} count={item.commentCount} />
          <ul className="recipe-meta recipe-meta-large">
            <li>
              <FiClock aria-hidden="true" /> {formatMinutes(item.prepTimeMinutes)}
            </li>
            <li>
              <FiUsers aria-hidden="true" /> {item.servings} porc.
            </li>
            <li>
              <FiUser aria-hidden="true" /> {item.author?.username}
            </li>
          </ul>
          <p className="muted">Paskelbta {formatDate(item.createdAt)}</p>

          {(isAuthor || isAdmin) && (
            <div className="button-row">
              {isAuthor && (
                <button type="button" className="btn btn-outline" onClick={() => setDialog('edit-recipe')}>
                  <FiEdit2 aria-hidden="true" /> Redaguoti
                </button>
              )}
              <button type="button" className="btn btn-danger-outline" onClick={() => setDialog('delete-recipe')}>
                <FiTrash2 aria-hidden="true" /> Šalinti
              </button>
            </div>
          )}
        </div>
      </article>

      <div className="recipe-content">
        <section className="panel">
          <h2>Ingredientai</h2>
          <ul className="ingredients">
            {item.ingredients
              .split('\n')
              .filter((line) => line.trim())
              .map((line, index) => (
                <li key={index}>{line}</li>
              ))}
          </ul>
        </section>
        <section className="panel">
          <h2>Gaminimo eiga</h2>
          <p className="preline">{item.description}</p>
        </section>
      </div>

      <section className="reviews">
        <h2>Atsiliepimai ({item.commentCount})</h2>

        <div className="panel review-new">
          {!user ? (
            <p>
              <Link to="/login" state={{ from: basePath }}>
                Prisijunkite
              </Link>
              , kad galėtumėte palikti atsiliepimą.
            </p>
          ) : isAuthor ? (
            <p className="muted">Savo recepto vertinti negalima.</p>
          ) : alreadyReviewed ? (
            <p className="muted">Šį receptą jau įvertinote. Savo atsiliepimą galite redaguoti žemiau.</p>
          ) : (
            <>
              <h3>Palikite atsiliepimą</h3>
              <ReviewForm submitLabel="Paskelbti" onSubmit={createReview} />
            </>
          )}
        </div>

        {comments.loading && !comments.data ? (
          <Loader />
        ) : comments.error ? (
          <ErrorState error={comments.error} onRetry={comments.reload} />
        ) : reviews.length === 0 ? (
          <EmptyState title="Atsiliepimų dar nėra" text="Būkite pirmas, kuris įvertins šį receptą." />
        ) : (
          <>
            <ul className="review-list">
              {reviews.map((review) => {
                const isOwn = user?.id === review.authorId;
                return (
                  <li key={review.id} className="review panel">
                    <div className="review-avatar" aria-hidden="true">
                      {review.author?.username?.[0]?.toUpperCase()}
                    </div>
                    <div className="review-main">
                      <div className="review-head">
                        <strong>{review.author?.username}</strong>
                        <span className="muted">{formatDate(review.createdAt)}</span>
                      </div>
                      <StarRating value={review.rating} />
                      <p className="preline">{review.text}</p>
                      {(isOwn || isAdmin) && (
                        <div className="button-row">
                          {isOwn && (
                            <button
                              type="button"
                              className="btn btn-small btn-outline"
                              onClick={() => setDialog({ type: 'edit-review', review })}
                            >
                              <FiEdit2 aria-hidden="true" /> Redaguoti
                            </button>
                          )}
                          <button
                            type="button"
                            className="btn btn-small btn-danger-outline"
                            onClick={() => setDialog({ type: 'delete-review', review })}
                          >
                            <FiTrash2 aria-hidden="true" /> Šalinti
                          </button>
                        </div>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
            <Pagination pagination={comments.data.pagination} onChange={setCommentPage} />
          </>
        )}
      </section>

      {dialog === 'edit-recipe' && (
        <RecipeFormModal
          recipe={item}
          onClose={closeDialog}
          onSaved={() => {
            closeDialog();
            recipe.reload();
          }}
        />
      )}

      {dialog === 'delete-recipe' && (
        <ConfirmModal
          title="Šalinti receptą?"
          message={`Receptas „${item.title}“ ir visi jo atsiliepimai bus ištrinti. Šio veiksmo atšaukti negalima.`}
          onConfirm={deleteRecipe}
          onClose={closeDialog}
        />
      )}

      {dialog?.type === 'edit-review' && (
        <Modal title="Redaguoti atsiliepimą" onClose={closeDialog}>
          <ReviewForm
            initial={dialog.review}
            submitLabel="Išsaugoti"
            onSubmit={(values) => updateReview(dialog.review, values)}
            onCancel={closeDialog}
          />
        </Modal>
      )}

      {dialog?.type === 'delete-review' && (
        <ConfirmModal
          title="Šalinti atsiliepimą?"
          message="Atsiliepimas bus ištrintas. Šio veiksmo atšaukti negalima."
          onConfirm={() => deleteReview(dialog.review)}
          onClose={closeDialog}
        />
      )}
    </div>
  );
}

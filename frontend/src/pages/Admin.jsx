import { useState } from 'react';
import toast from 'react-hot-toast';
import { FiEdit2, FiPlus, FiTrash2 } from 'react-icons/fi';
import api from '../api/client.js';
import { getErrorMessage } from '../api/errors.js';
import CategoryFormModal from '../components/CategoryFormModal.jsx';
import ConfirmModal from '../components/ConfirmModal.jsx';
import Pagination from '../components/Pagination.jsx';
import { EmptyState, ErrorState, Loader } from '../components/States.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import useFetch from '../hooks/useFetch.js';
import { formatDate } from '../utils/labels.js';

// Administratoriaus puslapis: kategorijų ir naudotojų tvarkymas.
// Netinkamus receptus ir atsiliepimus administratorius šalina jų puslapyje.
export default function Admin() {
  const [tab, setTab] = useState('categories');

  return (
    <div className="container section fade-in">
      <h1>Administravimas</h1>
      <div className="tabs" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'categories'}
          className={tab === 'categories' ? 'active' : ''}
          onClick={() => setTab('categories')}
        >
          Kategorijos
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'users'}
          className={tab === 'users' ? 'active' : ''}
          onClick={() => setTab('users')}
        >
          Naudotojai
        </button>
      </div>

      {tab === 'categories' ? <CategoriesTab /> : <UsersTab />}
    </div>
  );
}

function CategoriesTab() {
  const categories = useFetch('/categories', { limit: 50 });
  // dialog: null | 'new' | { type: 'edit' | 'delete', category }
  const [dialog, setDialog] = useState(null);
  const closeDialog = () => setDialog(null);

  async function deleteCategory(category) {
    try {
      await api.delete(`/categories/${category.id}`);
      toast.success('Kategorija ištrinta');
      categories.reload();
    } catch (error) {
      // pvz. 409, kai kategorijoje yra receptų
      toast.error(getErrorMessage(error));
    }
    closeDialog();
  }

  return (
    <section>
      <div className="section-head">
        <h2>Receptų kategorijos</h2>
        <button type="button" className="btn btn-primary" onClick={() => setDialog('new')}>
          <FiPlus aria-hidden="true" /> Nauja kategorija
        </button>
      </div>

      {categories.loading && !categories.data ? (
        <Loader />
      ) : categories.error ? (
        <ErrorState error={categories.error} onRetry={categories.reload} />
      ) : categories.data.data.length === 0 ? (
        <EmptyState title="Kategorijų nėra" />
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Pavadinimas</th>
                <th>Aprašymas</th>
                <th>Veiksmai</th>
              </tr>
            </thead>
            <tbody>
              {categories.data.data.map((category) => (
                <tr key={category.id}>
                  <td data-label="Pavadinimas">
                    <strong>{category.name}</strong>
                  </td>
                  <td data-label="Aprašymas">{category.description}</td>
                  <td data-label="Veiksmai">
                    <div className="button-row">
                      <button
                        type="button"
                        className="btn btn-small btn-outline"
                        onClick={() => setDialog({ type: 'edit', category })}
                      >
                        <FiEdit2 aria-hidden="true" /> Redaguoti
                      </button>
                      <button
                        type="button"
                        className="btn btn-small btn-danger-outline"
                        onClick={() => setDialog({ type: 'delete', category })}
                      >
                        <FiTrash2 aria-hidden="true" /> Šalinti
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {(dialog === 'new' || dialog?.type === 'edit') && (
        <CategoryFormModal
          category={dialog?.category}
          onClose={closeDialog}
          onSaved={() => {
            closeDialog();
            categories.reload();
          }}
        />
      )}

      {dialog?.type === 'delete' && (
        <ConfirmModal
          title="Šalinti kategoriją?"
          message={`Kategorija „${dialog.category.name}“ bus ištrinta. Kategorijos, kurioje yra receptų, ištrinti negalima.`}
          onConfirm={() => deleteCategory(dialog.category)}
          onClose={closeDialog}
        />
      )}
    </section>
  );
}

function UsersTab() {
  const { user: currentUser } = useAuth();
  const [page, setPage] = useState(1);
  const users = useFetch('/users', { page, limit: 8 });
  const [toDelete, setToDelete] = useState(null);

  async function deleteUser(target) {
    try {
      await api.delete(`/users/${target.id}`);
      toast.success('Naudotojas ištrintas');
      users.reload();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
    setToDelete(null);
  }

  return (
    <section>
      <div className="section-head">
        <h2>Naudotojai</h2>
      </div>

      {users.loading && !users.data ? (
        <Loader />
      ) : users.error ? (
        <ErrorState error={users.error} onRetry={users.reload} />
      ) : (
        <>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Vardas</th>
                  <th>El. paštas</th>
                  <th>Rolė</th>
                  <th>Sukurtas</th>
                  <th>Veiksmai</th>
                </tr>
              </thead>
              <tbody>
                {users.data.data.map((item) => (
                  <tr key={item.id}>
                    <td data-label="Vardas">
                      <strong>{item.username}</strong>
                    </td>
                    <td data-label="El. paštas">{item.email}</td>
                    <td data-label="Rolė">
                      <span className={`badge badge-role-${item.role}`}>
                        {item.role === 'admin' ? 'Administratorius' : 'Naudotojas'}
                      </span>
                    </td>
                    <td data-label="Sukurtas">{formatDate(item.createdAt)}</td>
                    <td data-label="Veiksmai">
                      <button
                        type="button"
                        className="btn btn-small btn-danger-outline"
                        onClick={() => setToDelete(item)}
                        disabled={item.id === currentUser.id}
                        title={item.id === currentUser.id ? 'Savo paskyros šalinti negalima' : undefined}
                      >
                        <FiTrash2 aria-hidden="true" /> Šalinti
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination pagination={users.data.pagination} onChange={setPage} />
        </>
      )}

      {toDelete && (
        <ConfirmModal
          title="Šalinti naudotoją?"
          message={`Naudotojas „${toDelete.username}“ kartu su jo receptais ir atsiliepimais bus ištrintas. Šio veiksmo atšaukti negalima.`}
          onConfirm={() => deleteUser(toDelete)}
          onClose={() => setToDelete(null)}
        />
      )}
    </section>
  );
}

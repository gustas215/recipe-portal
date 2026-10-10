import { useState } from 'react';
import Modal from './Modal.jsx';

// Patvirtinimo langas ištrynimui (vietoj naršyklės confirm()).
// onConfirm turi pats apdoroti klaidas ir uždaryti langą.
export default function ConfirmModal({ title, message, confirmText = 'Šalinti', onConfirm, onClose }) {
  const [busy, setBusy] = useState(false);

  async function handleConfirm() {
    setBusy(true);
    try {
      await onConfirm();
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal
      title={title}
      onClose={onClose}
      footer={
        <>
          <button type="button" className="btn btn-ghost" onClick={onClose} disabled={busy}>
            Atšaukti
          </button>
          <button type="button" className="btn btn-danger" onClick={handleConfirm} disabled={busy}>
            {busy ? 'Šalinama...' : confirmText}
          </button>
        </>
      }
    >
      <p>{message}</p>
    </Modal>
  );
}

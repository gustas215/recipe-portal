import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { FiX } from 'react-icons/fi';
import './Modal.css';

// Bendras modalinis langas. Uždaromas Esc klavišu, spustelėjus tamsų foną arba X mygtuku.
// Piešiamas per portalą tiesiai į body: kitaip jį veiktų tėvinių elementų transform (pvz. animacija),
// ir position: fixed nebeužimtų viso ekrano.
// footer mygtukai gali siųsti formą, esančią body, per atributą form="formos-id".
const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled])';

export default function Modal({ title, onClose, children, footer }) {
  const dialogRef = useRef(null);

  // Atidarius langą fokusas perkeliamas į jį, uždarius grąžinamas ten, kur buvo (klaviatūros naudotojams)
  useEffect(() => {
    const previouslyFocused = document.activeElement;
    dialogRef.current?.focus();
    return () => {
      if (previouslyFocused && document.contains(previouslyFocused)) previouslyFocused.focus();
    };
  }, []);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose();
        return;
      }
      // Tab klavišas sukasi tik lango viduje
      if (event.key !== 'Tab' || !dialogRef.current) return;
      const items = dialogRef.current.querySelectorAll(FOCUSABLE);
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;
      if (event.shiftKey && (active === first || active === dialogRef.current)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    document.body.classList.add('modal-open');
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.classList.remove('modal-open');
    };
  }, [onClose]);

  return createPortal(
    <div
      className="modal-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title" tabIndex={-1} ref={dialogRef}>
        <div className="modal-header">
          <h2 id="modal-title">{title}</h2>
          <button type="button" className="modal-close" aria-label="Uždaryti" onClick={onClose}>
            <FiX />
          </button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>,
    document.body
  );
}

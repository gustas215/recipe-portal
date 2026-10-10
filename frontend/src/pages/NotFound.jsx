import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="container section state-page fade-in">
      <img src="/images/empty.svg" alt="" className="state-image" />
      <h1>Puslapis nerastas</h1>
      <p>Tokio adreso nėra arba puslapis buvo pašalintas.</p>
      <Link to="/" className="btn btn-primary">
        Grįžti į pradžią
      </Link>
    </div>
  );
}

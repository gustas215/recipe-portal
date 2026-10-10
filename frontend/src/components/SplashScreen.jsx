import { useEffect, useState } from 'react';
import { FaUtensils } from 'react-icons/fa';

// Rodoma, kol bandoma atkurti sesiją. Nemokamas Render serveris po nenaudojimo užmiega,
// todėl pirmas atsakymas gali užtrukti iki minutės. Po kelių sekundžių paaiškiname kodėl.
export default function SplashScreen() {
  const [slow, setSlow] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setSlow(true), 4000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="splash" role="status">
      <FaUtensils className="splash-icon" aria-hidden="true" />
      <span className="spinner" aria-hidden="true" />
      <p>Kraunama...</p>
      {slow && <p className="splash-note">Serveris pabunda po poilsio, tai gali užtrukti iki minutės.</p>}
    </div>
  );
}

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Pakeitus puslapį grįžtame į viršų
export default function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

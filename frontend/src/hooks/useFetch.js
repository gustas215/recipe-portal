import { useEffect, useState } from 'react';
import api from '../api/client.js';

// GET užklausa su būsenomis: data, loading, error. reload() kviečia užklausą iš naujo.
// enabled = false reiškia, kad užklausos kol kas nereikia.
export default function useFetch(url, params, enabled = true) {
  const [state, setState] = useState({ data: null, loading: enabled, error: null });
  const [version, setVersion] = useState(0);
  const paramsKey = JSON.stringify(params ?? {});

  useEffect(() => {
    if (!enabled) {
      return undefined;
    }
    let cancelled = false;

    // Senus duomenis paliekame, kol kraunami nauji (puslapiuojant sąrašas nemirga)
    setState((previous) => ({ ...previous, loading: true, error: null }));

    api
      .get(url, { params })
      .then((response) => {
        if (!cancelled) setState({ data: response.data, loading: false, error: null });
      })
      .catch((error) => {
        if (!cancelled) setState({ data: null, loading: false, error });
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, paramsKey, version, enabled]);

  return { ...state, reload: () => setVersion((v) => v + 1) };
}

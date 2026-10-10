import axios from 'axios';

// Vienas axios egzempliorius visai programai.
// withCredentials: true reikalingas, kad naršyklė siųstų refresh žetono cookie.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  withCredentials: true,
});

// Access žetonas laikomas tik atmintyje (ne localStorage), todėl jo neperskaitys
// kiti skriptai iš naršyklės saugyklos. Perkrovus puslapį jis atgaunamas per refresh.
let accessToken = null;

// AuthContext čia užregistruoja funkciją, kuri atjungia naudotoją, kai sesija baigiasi
let onSessionEnd = () => {};

export function setAccessToken(token) {
  accessToken = token;
}

export function setSessionEndHandler(handler) {
  onSessionEnd = handler;
}

// Kiekvienai užklausai pridedame access žetoną
api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// Refresh užklausa. Jei kelios užklausos vienu metu gauna 401, refresh vyksta tik vieną kartą
// (kitaip antra užklausa panaudotų jau atšauktą refresh žetoną).
let refreshPromise = null;

export function refreshSession() {
  if (!refreshPromise) {
    // Naudojame paprastą axios, o ne api, kad refresh užklausai netaikytųsi mūsų interceptor'iai
    refreshPromise = axios
      .post(`${api.defaults.baseURL}/auth/refresh`, null, { withCredentials: true })
      .then((res) => {
        accessToken = res.data.accessToken;
        return res.data;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

// Gavus 401 (access žetonas pasibaigė) vieną kartą bandome atnaujinti žetoną ir pakartoti užklausą.
// Nepavykus naudotojas atjungiamas.
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    const status = error.response?.status;
    const isAuthCall = original?.url?.startsWith('/auth/');

    if (status === 401 && original && !original._retry && !isAuthCall && accessToken) {
      original._retry = true;
      try {
        const data = await refreshSession();
        original.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(original);
      } catch (refreshError) {
        accessToken = null;
        onSessionEnd();
      }
    }
    return Promise.reject(error);
  }
);

export default api;

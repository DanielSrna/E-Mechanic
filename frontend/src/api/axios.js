import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
});

let accessToken = null;

export const setToken = (token) => { accessToken = token; };
export const getToken = () => accessToken;

function updateStoredToken(newToken) {
  try {
    const stored = localStorage.getItem('me');
    if (stored) {
      const me = JSON.parse(stored);
      me.token = newToken;
      localStorage.setItem('me', JSON.stringify(me));
    }
  } catch (e) { console.error(e); }
}

api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const { data } = await axios.post('/api/users/refresh-token', {}, {
          withCredentials: true,
        });
        accessToken = data.accessToken;
        updateStoredToken(data.accessToken);
        original.headers.Authorization = `Bearer ${accessToken}`;
        return api(original);
      } catch {
        accessToken = null;
        localStorage.removeItem('me');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;

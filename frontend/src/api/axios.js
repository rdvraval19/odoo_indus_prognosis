<<<<<<< HEAD:frontend/src/api/axios.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api', // Update this to your backend URL
});

// Automatically attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

=======
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000', // Update this to your backend URL
});

// Automatically attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

>>>>>>> a6c281ca7deb3f1660ca29e4576ab04d335cbe31:src/api/axios.js
export default api;
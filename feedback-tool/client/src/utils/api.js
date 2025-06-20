import axios from 'axios';

const API = axios.create({
  baseURL: 'https://projects-pk2b.onrender.com', // hardcoded temporarily
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default API;

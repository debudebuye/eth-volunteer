import axios from 'axios';

const API = axios.create({ baseURL: "${import.meta.env.BACKEND_BASEURL}/api" });

export const register = (data) => API.post('/auth/register', data);
export const login = (data) => API.post('/auth/login', data);
export const getEvents = () => API.get('/events/all');
export const likeEvent = (id, token) => API.post(`/events/like/${id}`, {}, { headers: { Authorization: token } });

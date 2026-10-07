import axios from 'axios';
import { API_BASE } from '../lib/constants';

const client = axios.create({
  baseURL: API_BASE,
  timeout: 2000,
});

export default client;

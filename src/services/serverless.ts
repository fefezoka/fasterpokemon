import axios from 'axios';

export const serverless = axios.create({
  baseURL: 'http://localhost:3000',
});

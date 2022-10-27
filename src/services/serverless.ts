import axios from 'axios';

export const serverless = axios.create({
  baseURL: process.env.BASE_URL,
});

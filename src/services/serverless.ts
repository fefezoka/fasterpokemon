import axios from 'axios';

export const serverless = axios.create({
  baseURL: 'https://fasterpokemon.vercel.app/',
});

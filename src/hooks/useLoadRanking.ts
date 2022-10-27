import { User } from '@prisma/client';
import { useEffect, useState } from 'react';
import { serverless } from '../services/serverless';

interface Ranking {
  winrate: User[];
  wins: User[];
  maxStreak: User[];
}

export const useLoadRanking = () => {
  const [ranking, setRanking] = useState<Ranking>();

  useEffect(() => {
    const getOptions = async () => {
      const { data } = await serverless.get('/api/user/ranking');
      setRanking(data);
    };
    getOptions();
  }, []);

  return { ranking };
};

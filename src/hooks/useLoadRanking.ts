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
  const [update, setUpdate] = useState<number>(0);

  useEffect(() => {
    const getOptions: () => any = async () => {
      const { data } = await serverless.get('/api/user/ranking');
      setRanking(data);
    };
    getOptions();
  }, [update]);

  return { ranking, setUpdate };
};

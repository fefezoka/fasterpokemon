import { prisma } from '../../../lib/prisma';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function ranking(req: NextApiRequest, res: NextApiResponse) {
  const winrate = await prisma.user.findMany({
    take: 10,
    orderBy: {
      winrate: 'desc',
    },
  });

  const wins = await prisma.user.findMany({
    take: 10,
    orderBy: {
      wins: 'desc',
    },
  });

  const maxStreak = await prisma.user.findMany({
    take: 10,
    orderBy: {
      maxStreak: 'desc',
    },
  });

  const data = {
    winrate,
    maxStreak,
    wins,
  };

  return res.status(201).json(data);
}

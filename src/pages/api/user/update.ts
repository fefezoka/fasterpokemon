import { prisma } from '../../../lib/prisma';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function update(req: NextApiRequest, res: NextApiResponse) {
  const { email, rightAnswer, streak } = req.body;

  const user = await prisma.user.findUnique({
    select: {
      wins: true,
      totalRounds: true,
      maxStreak: true,
    },
    where: {
      email: email,
    },
  });

  if (!user) {
    return res.status(500).json({});
  }

  await prisma.user.update({
    data: {
      wins: {
        increment: rightAnswer ? 1 : 0,
      },
      totalRounds: {
        increment: 1,
      },
      maxStreak: {
        set: streak > user.maxStreak ? streak : user?.maxStreak,
      },
      winrate: {
        set: ((user.wins + rightAnswer) / (user.totalRounds + 1)) * 100,
      },
    },
    where: {
      email: email,
    },
  });

  return res.status(201).json({});
}

import { prisma } from '../../../lib/prisma';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function update(req: NextApiRequest, res: NextApiResponse) {
  const { email, name, image, rightAnswer, streak } = req.body;

  const user = await prisma.user.findUnique({
    select: {
      maxStreak: true,
    },
    where: {
      email: email,
    },
  });

  await prisma.user.upsert({
    update: {
      wins: {
        increment: rightAnswer ? 1 : 0,
      },
      totalRounds: {
        increment: 1,
      },
      maxStreak: {
        set: user?.maxStreak ? (streak > user.maxStreak ? streak : user?.maxStreak) : 0,
      },
    },
    where: {
      email: email,
    },
    create: {
      email: email,
      name: name,
      avatar_url: image,
      wins: rightAnswer ? 1 : 0,
      maxStreak: streak,
      totalRounds: 1,
    },
  });

  return res.status(201).json({});
}

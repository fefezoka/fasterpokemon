import { User } from '@prisma/client';
import React, { useState } from 'react';
import { BsArrowCounterclockwise, BsX } from 'react-icons/bs';
import RankingItems from './RankingItems';

interface Props {
  setRankingActive: React.Dispatch<React.SetStateAction<boolean | undefined>>;
  ranking: {
    winrate: User[];
    wins: User[];
    maxStreak: User[];
  };
}

type OrderBy = 'winrate' | 'wins' | 'maxStreak' | 'totalRounds';

export const Ranking = ({ ranking, setRankingActive }: Props) => {
  const [RankingOrderby, setRankingOrderby] = useState<OrderBy>('winrate');

  return (
    <div
      className="h-screen border-l border-white w-screen lg:w-[420px]
            text-xs lg:text-sm absolute text-center py-5 right-0 bg-ranking"
    >
      <div className="relative">
        <h1 className="pb-2 text-base font-semibold">Ranking</h1>
        <button
          onClick={() => setRankingActive(false)}
          className="absolute p-1 right-7 -top-1 cursor-pointer"
        >
          <BsX size={28}></BsX>
        </button>
      </div>

      <div
        className="child:px-2 child:py-1 py-2 child:min-w-[60px]
              lg:child:min-w-[90px] child:border-b-2 focus:child:border-black"
      >
        <button autoFocus onClick={() => setRankingOrderby('winrate')}>
          Winrate
        </button>
        <button onClick={() => setRankingOrderby('wins')}>Wins</button>
        <button onClick={() => setRankingOrderby('maxStreak')}>Max Streak</button>
      </div>

      {RankingOrderby === 'winrate' && <RankingItems ranking={ranking.winrate} />}
      {RankingOrderby === 'wins' && <RankingItems ranking={ranking.wins} />}
      {RankingOrderby === 'maxStreak' && <RankingItems ranking={ranking.maxStreak} />}
    </div>
  );
};

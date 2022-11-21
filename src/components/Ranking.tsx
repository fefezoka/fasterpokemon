import axios from 'axios';
import React, { useState } from 'react';
import { BsArrowCounterclockwise, BsX } from 'react-icons/bs';
import { useQuery } from 'react-query';
import { RankingItems } from './RankingItems';
import Spinner from '../assets/Spinner.svg';
import Image from 'next/image';

interface Props {
  setRankingActive: React.Dispatch<React.SetStateAction<boolean | undefined>>;
}

type OrderBy = 'winrate' | 'wins' | 'maxStreak' | 'totalRounds';

export const Ranking = ({ setRankingActive }: Props) => {
  const [RankingOrderby, setRankingOrderby] = useState<OrderBy>('winrate');

  const {
    data: ranking,
    isLoading,
    refetch,
  } = useQuery<Ranking>(
    'ranking',
    async () => {
      const { data } = await axios.get('/api/user/ranking');
      return data;
    },
    {
      staleTime: Infinity,
    }
  );

  if (!ranking) {
    return <></>;
  }

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
          <BsX size={28} />
        </button>
        <button className="p-1 absolute left-7 top-10" onClick={() => refetch()}>
          <BsArrowCounterclockwise size={18} />
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

      {isLoading ? (
        <Image src={Spinner} width={64} height={64} alt="" />
      ) : (
        <>
          {RankingOrderby === 'winrate' && <RankingItems ranking={ranking.winrate} />}
          {RankingOrderby === 'wins' && <RankingItems ranking={ranking.wins} />}
          {RankingOrderby === 'maxStreak' && <RankingItems ranking={ranking.maxStreak} />}
        </>
      )}
    </div>
  );
};

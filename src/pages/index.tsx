import { useState } from 'react';
import type { GetServerSideProps, NextPage } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import Spinner from '../../public/Spinner.svg';
import { signIn, getSession, signOut } from 'next-auth/react';
import { Session } from 'next-auth';
import axios from 'axios';
import { useLoadOptions } from '../hooks/useLoadOptions';
import { prisma } from '../lib/prisma';
import { User } from '@prisma/client';
import { BsX } from 'react-icons/bs';

interface Props {
  session: Session;
  ranking: User[];
}

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  const session = await getSession({ req });

  const ranking = await prisma.user.findMany({
    take: 10,
    orderBy: {
      wins: 'desc',
    },
  });

  return {
    props: {
      session,
      ranking,
    },
  };
};

const NextPage = ({ session, ranking }: Props) => {
  const [rightAnswer, setRightAnswer] = useState<boolean>(false);
  const [guessed, setGuessed] = useState<boolean>(false);
  const [streak, setStreak] = useState<number>(0);
  const [rankingActive, setRankActive] = useState<boolean>();
  const { loading, options, setRounds } = useLoadOptions();

  if (!options) {
    return;
  }

  const whichIsFaster = (chosen: number) => {
    if (guessed) {
      return;
    }

    if (options[0].speed > options[1].speed) {
      if (chosen === 1) {
        onRightAnswer();
      } else {
        setStreak(0);
      }
    } else {
      if (chosen === 2) {
        onRightAnswer();
      } else {
        setStreak(0);
      }
    }
    setGuessed(true);
  };

  const onRightAnswer = () => {
    setRightAnswer(true);
    setStreak((s) => s + 1);
  };

  const refreshData = () => {
    session && updateUserOnDB();
    setRightAnswer(false);
    setGuessed(false);
    setRounds((r) => r + 1);
  };

  const updateUserOnDB = async () => {
    await axios.post(`/api/user/update`, {
      ...session.user,
      rightAnswer,
      streak,
    });
  };

  return (
    <>
      <Head>
        <title>Faster Pokémon</title>
      </Head>

      <header className="flex w-full items-center justify-center h-20 fixed">
        <nav>
          <ul className="flex gap-6 text-center">
            <li>
              <button onClick={() => setRankActive(true)}>Ranking</button>
            </li>
            {session ? (
              <>
                <li>
                  <p>Logged as {session.user?.name}</p>
                  <button onClick={() => signOut()}>Sign up</button>
                </li>
              </>
            ) : (
              <li>
                <button onClick={() => signIn('github')}>Login with Github</button>
              </li>
            )}
          </ul>
        </nav>
      </header>

      <main className="flex flex-col items-center justify-center h-screen">
        <div className="absolute top-[20%] text-center">
          <h1 className="text-3xl">Which one is faster?</h1>
          {streak >= 3 && <h1 className="text-2xl">In a {streak} guess streak!!</h1>}
        </div>

        <div className="flex w-screen justify-evenly items-center md:w-5/12">
          {!loading ? (
            <div className="cursor-pointer" onClick={() => whichIsFaster(1)}>
              <Image
                src={options[0].sprites.other['official-artwork'].front_default}
                width="260px"
                height="260px"
                priority
                alt=""
              />

              <div className="text-center">
                <span className="capitalize">{options[0].name}</span>
                <div>
                  Base speed:{' '}
                  {guessed ? <span>{options[0].speed}</span> : <span>??</span>}
                </div>
              </div>
            </div>
          ) : (
            <Image src={Spinner} priority width="120px" height="120px" alt="" />
          )}
          <span className="text-2xl">or</span>

          {!loading ? (
            <div className="cursor-pointer" onClick={() => whichIsFaster(2)}>
              <Image
                src={options[1].sprites.other['official-artwork'].front_default}
                width="260px"
                height="260px"
                priority
                alt=""
              />

              <div className="text-center">
                <span className="capitalize">{options[1].name}</span>
                <div>
                  Base speed:{' '}
                  {guessed ? <span>{options[1].speed}</span> : <span>??</span>}
                </div>
              </div>
            </div>
          ) : (
            <Image src={Spinner} priority width="120px" height="120px" alt="" />
          )}
        </div>
        {guessed &&
          (rightAnswer ? (
            <div className="absolute text-center rounded-md bg-green px-8 py-3 text-white">
              <h2 className="text-xl">Right answer</h2>
              <button onClick={refreshData} className="py-2 px-3 mt-3 rounded-md">
                Continue
              </button>
            </div>
          ) : (
            <div className="absolute text-center rounded-md bg-red px-8 py-3 text-white">
              <h2 className="text-xl">Wrong answer</h2>
              <button onClick={refreshData} className="py-2 px-3 mt-3 rounded-md">
                Continue
              </button>
            </div>
          ))}

        {rankingActive && (
          <div className="h-screen w-screen md:w-96 text-base absolute text-center py-4 right-0 bg-indigo-200">
            <h1 className="pb-2 font-semibold">Ranking</h1>
            <div
              onClick={() => setRankActive(false)}
              className="absolute p-2 right-6 top-1 cursor-pointer"
            >
              <BsX size={32}></BsX>
            </div>

            <ul>
              {ranking.map((user, index) => (
                <li
                  className="flex gap-4 py-9 px-4 items-center max-h-9 border-b border-black"
                  key={user.id}
                >
                  <p>{index + 1}º</p>
                  <div>
                    <Image src={user.avatar_url} alt="" width={47} height={47}></Image>
                  </div>
                  <p>{user.name}</p>
                  <p>
                    {user.wins} wins in {user.totalRounds} rounds
                  </p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </main>
    </>
  );
};

export default NextPage;

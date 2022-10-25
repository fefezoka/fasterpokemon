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

  if (session?.user?.email && session?.user.name && session?.user.image) {
    await prisma.user.upsert({
      create: {
        email: session.user.email,
        name: session.user.name,
        avatar_url: session.user.image,
      },
      update: {},
      where: { email: session.user.email },
    });
  }

  const ranking = await prisma.user.findMany({
    take: 10,
    select: {
      name: true,
      wins: true,
      winrate: true,
      maxStreak: true,
      totalRounds: true,
      avatar_url: true,
      id: true,
    },
    orderBy: {
      winrate: 'desc',
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

    const faster = options[0].speed > options[1].speed ? 0 : 1;

    faster === chosen
      ? (() => {
          setRightAnswer(true);
          setStreak((s) => s + 1);
        })()
      : setStreak(0);

    setGuessed(true);
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
          <ul className="flex gap-8 text-center">
            <li>
              <button onClick={() => setRankActive((r) => !r)}>Ranking</button>
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
                <span>Login with </span>
                <button onClick={() => signIn('github')}>Github</button>
                <span> or </span>
                <button onClick={() => signIn('discord')}>Discord</button>
              </li>
            )}
          </ul>
        </nav>
      </header>

      <main className="flex px-4 items-center justify-center h-screen">
        <div className="absolute top-[20%] text-center">
          <h1 className="text-3xl">Which one is faster?</h1>
          {streak >= 3 && <h1 className="text-2xl">In a {streak} guess streak!!</h1>}
        </div>

        <div className="flex w-full justify-evenly gap-12 items-center lg:w-1/3">
          {options.map((pokemon, index) =>
            !loading ? (
              <div
                key={pokemon.id}
                className="cursor-pointer"
                onClick={() => whichIsFaster(index)}
              >
                <Image
                  src={pokemon.sprites.other['official-artwork'].front_default}
                  width="220px"
                  height="220px"
                  placeholder="blur"
                  blurDataURL={Spinner}
                  quality={50}
                  priority
                  alt=""
                />
                <div className="text-center">
                  <span className="capitalize">{pokemon.name}</span>
                  <div>
                    Base speed: {guessed ? <span>{pokemon.speed}</span> : <span>??</span>}
                  </div>
                </div>
              </div>
            ) : (
              <Image src={Spinner} priority width="120px" height="120px" alt="" />
            )
          )}
          <p className="absolute text-xl">or</p>
        </div>

        {guessed && (
          <div className="absolute bottom-[12%] text-center px-8 py-3">
            {rightAnswer ? (
              <h2 className="text-3xl text-green">Right answer</h2>
            ) : (
              <h2 className="text-3xl text-red">Wrong answer</h2>
            )}
            <button onClick={refreshData} className="py-2 px-4 mt-3 rounded-md">
              Continue
            </button>
          </div>
        )}

        {rankingActive && (
          <div className="h-screen w-screen md:w-[420px] text-xs md:text-sm absolute text-center py-4 right-0 bg-indigo-200">
            <h1 className="pb-2 font-semibold">Ranking</h1>
            <div
              onClick={() => setRankActive(false)}
              className="absolute p-1 right-6 top-2 cursor-pointer"
            >
              <BsX size={28}></BsX>
            </div>

            <ul>
              {ranking.map((user, index) => (
                <li
                  className="flex gap-4 py-9 px-4 items-center justify-between max-h-9 border-b border-white"
                  key={user.id}
                >
                  <div className="flex items-center gap-3 min-w-[60%]">
                    <p>{index + 1}º</p>
                    <div className="border-2 border-white w-12 h-12">
                      <Image src={user.avatar_url} alt="" height={48} width={48}></Image>
                    </div>
                    <div className="text-left">
                      <p>{user.name}</p>
                    </div>
                  </div>
                  <div className="text-left min-w-[40%]">
                    <p>
                      {user.wins} wins in {user.totalRounds} rounds
                    </p>
                    <p>Winrate: {user.winrate.toFixed(1)}%</p>
                    <p>Max streak: {user.maxStreak}</p>
                  </div>
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

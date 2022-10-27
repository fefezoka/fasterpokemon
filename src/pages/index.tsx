import { useReducer, useState } from 'react';
import type { GetServerSideProps, NextPage } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import Spinner from '../../public/Spinner.svg';
import { signIn, getSession, signOut } from 'next-auth/react';
import { Session } from 'next-auth/core/types';
import { serverless } from '../services/serverless';
import { useLoadOptions } from '../hooks/useLoadOptions';
import { prisma } from '../lib/prisma';
import { Ranking } from '../components/Ranking';
import { initialState, reducer } from '../reducers/gameReducer';
import { useLoadRanking } from '../hooks/useLoadRanking';

interface Props {
  session: Session;
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

  return {
    props: {
      session,
    },
  };
};

const NextPage = ({ session }: Props) => {
  const [gameData, dispatch] = useReducer(reducer, initialState);
  const [rankingActive, setRankingActive] = useState<boolean>();
  const { loading, options, setRounds } = useLoadOptions();
  const { ranking } = useLoadRanking();

  if (!options) {
    return;
  }

  const whichIsFaster = (chosen: number) => {
    if (gameData.guessed) {
      return;
    }

    const faster = options[0].speed > options[1].speed ? 0 : 1;

    faster === chosen
      ? (() => {
          dispatch({ type: 'right' });
        })()
      : dispatch({ type: 'wrong' });
  };

  const refreshData = () => {
    session && updateUserOnDB();
    dispatch({ type: 'reset' });
    setRounds((r) => r + 1);
  };

  const updateUserOnDB = async () => {
    await serverless.post(`/api/user/update`, {
      email: session.user?.email,
      rightAnswer: gameData.rightAnswer,
      streak: gameData.streak,
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
                <button onClick={() => signIn('google')}>Google</button>
                <span> or </span>
                <button onClick={() => signIn('discord')}>Discord</button>
              </li>
            )}
            <li>
              <button onClick={() => setRankingActive((r) => !r)}>Ranking</button>
            </li>
          </ul>
        </nav>
      </header>

      <main className="flex px-4 items-center gap-10 justify-center h-screen">
        <div className="absolute top-[20%] text-center">
          <h1 className="text-2xl lg:text-3xl">Which one is faster?</h1>
          {gameData.streak >= 3 && (
            <h1 className="text-2xl">In a {gameData.streak} guess streak!!</h1>
          )}
        </div>

        {options.map((pokemon, index) =>
          !loading ? (
            <div
              key={pokemon.id}
              className="cursor-pointer animate-fade"
              onClick={() => whichIsFaster(index)}
            >
              <Image
                src={pokemon.sprites.other['official-artwork'].front_default}
                width="220px"
                height="220px"
                quality={35}
                alt=""
              />
              <div className="text-center">
                <span className="capitalize">{pokemon.name}</span>
                <div>
                  Base speed:{' '}
                  {gameData.guessed ? <span>{pokemon.speed}</span> : <span>??</span>}
                </div>
              </div>
            </div>
          ) : (
            <Image src={Spinner} width="120px" height="120px" alt="" />
          )
        )}
        <p className="absolute text-xl">or</p>

        {gameData.guessed && (
          <div className="absolute bottom-[12%] text-center px-8 py-3">
            {gameData.rightAnswer ? (
              <h2 className="text-3xl text-green">Right answer</h2>
            ) : (
              <h2 className="text-3xl text-red">Wrong answer</h2>
            )}
            <button onClick={refreshData} className="py-2 px-4 mt-3 rounded-lg">
              Continue
            </button>
          </div>
        )}

        {rankingActive && ranking && (
          <Ranking ranking={ranking} setRankingActive={setRankingActive} />
        )}
      </main>
    </>
  );
};

export default NextPage;

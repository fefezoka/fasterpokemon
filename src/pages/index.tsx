import type { GetServerSideProps, NextPage } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import Router from 'next/router';
import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { getTwoPokemonIds } from '../utils/getTwoPokemonIds';
import Spinner from '../../public/Spinner.svg';

interface pokemon {
  id: number;
  name: string;
  sprites: {
    other: {
      ['official-artwork']: {
        front_default: string;
      };
    };
  };
  speed: number;
}

interface bothPokemons {
  pokeOne: pokemon;
  pokeTwo: pokemon;
}

export const getServerSideProps: GetServerSideProps = async () => {
  const [idOne, idTwo] = getTwoPokemonIds();

  const { data: pokeOne } = await api(`${idOne}`);
  const { data: pokeTwo } = await api(`${idTwo}`);

  pokeOne.speed = pokeOne.stats[5].base_stat;
  pokeTwo.speed = pokeTwo.stats[5].base_stat;

  return {
    props: {
      pokeOne,
      pokeTwo,
    },
  };
};

export default function NextPage({ pokeOne, pokeTwo }: bothPokemons) {
  const [rightAnswer, setRightAnswer] = useState<boolean>(false);
  const [guessed, setGuessed] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [streak, setStreak] = useState<number>(0);

  console.log('render');

  pokeOne.speed === pokeTwo.speed && Router.replace(Router.asPath);

  useEffect(() => {
    Router.events.on('routeChangeStart', () => setLoading(true));
    Router.events.on('routeChangeComplete', () => setLoading(false));
    return () => {
      Router.events.off('routeChangeStart', () => setLoading(true));
      Router.events.off('routeChangeComplete', () => setLoading(false));
    };
  }, []);

  const whichIsFaster = (chosen: number) => {
    if (guessed) {
      return;
    }

    if (pokeOne.speed > pokeTwo.speed) {
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
    Router.replace(Router.asPath);
    setRightAnswer(false);
    setGuessed(false);
  };

  return (
    <>
      <Head>
        <title>Faster pokemon</title>
      </Head>

      <div className="flex flex-col items-center justify-center h-screen">
        <div className="absolute top-[20%] text-center">
          <h1 className="text-3xl">Which one is faster?</h1>
          {streak >= 3 && <h1 className="text-2xl">In a {streak} guess streak!!</h1>}
        </div>

        <div className="flex w-screen justify-evenly items-center md:w-5/12">
          {!loading ? (
            <div className="cursor-pointer" onClick={() => whichIsFaster(1)}>
              <Image
                src={pokeOne.sprites.other['official-artwork'].front_default}
                width="260px"
                height="260px"
                loading="eager"
                alt=""
              />

              <div className="text-center">
                <span className="capitalize">{pokeOne.name}</span>
                <div>
                  Base speed: {guessed ? <span>{pokeOne.speed}</span> : <span>??</span>}
                </div>
              </div>
            </div>
          ) : (
            <Image src={Spinner} width="120px" height="120px" alt="" />
          )}
          <span className="text-2xl">or</span>

          {!loading ? (
            <div className="cursor-pointer" onClick={() => whichIsFaster(2)}>
              <Image
                src={pokeTwo.sprites.other['official-artwork'].front_default}
                width="260px"
                height="260px"
                loading="eager"
                alt=""
              />

              <div className="text-center">
                <span className="capitalize">{pokeTwo.name}</span>
                <div>
                  Base speed: {guessed ? <span>{pokeTwo.speed}</span> : <span>??</span>}
                </div>
              </div>
            </div>
          ) : (
            <Image src={Spinner} width="120px" height="120px" alt="" />
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
      </div>
    </>
  );
}

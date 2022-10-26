import { useEffect, useState } from 'react';
import { pokeapi } from '../services/pokeapi';
import { Pokemon } from '../types/pokemon.type';
import { getTwoPokemonIds } from '../utils/getTwoPokemonIds';

export const useLoadOptions = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [options, setOptions] = useState<Pokemon[]>();
  const [rounds, setRounds] = useState<number>(0);

  useEffect(() => {
    const getOptions: () => any = async () => {
      setLoading(true);
      const [idOne, idTwo] = getTwoPokemonIds();
      const { data: pokeOne } = await pokeapi(`${idOne}`);
      const { data: pokeTwo } = await pokeapi(`${idTwo}`);

      pokeOne.speed = pokeOne.stats[5].base_stat;
      pokeTwo.speed = pokeTwo.stats[5].base_stat;

      if (pokeOne.speed === pokeTwo.speed) {
        return getOptions();
      }

      setOptions([pokeOne, pokeTwo]);
      setLoading(false);
    };
    getOptions();
  }, [rounds]);

  return { loading, options, setRounds };
};

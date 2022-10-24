import { useEffect, useState } from 'react';
import { api } from '../services/api';
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
      const { data: pokeOne } = await api(`${idOne}`);
      const { data: pokeTwo } = await api(`${idTwo}`);

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

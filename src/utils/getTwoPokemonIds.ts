const MAX_POKEMONS = 905;

const getRandomPokemon: (idToCompare?: number) => number = (idToCompare) => {
  const id = Math.floor(Math.random() * MAX_POKEMONS) + 1;

  if (id !== idToCompare) return id;

  return getRandomPokemon(idToCompare);
};

export const getTwoPokemonIds = () => {
  const firstId = getRandomPokemon();
  const secondId = getRandomPokemon(firstId);

  return [firstId, secondId];
};

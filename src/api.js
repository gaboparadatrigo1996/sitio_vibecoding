import { POKEAPI_BASE_URL } from './constants.js';

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Error al obtener datos (${response.status})`);
  }

  return response.json();
}

export async function fetchPokemonPage(offset = 0, limit = 18) {
  const data = await fetchJson(`${POKEAPI_BASE_URL}/pokemon?offset=${offset}&limit=${limit}`);
  const pokemons = await Promise.all(data.results.map(({ url }) => fetchJson(url)));
  return {
    count: data.count,
    pokemons,
  };
}

export function fetchPokemonByIdOrName(idOrName) {
  return fetchJson(`${POKEAPI_BASE_URL}/pokemon/${String(idOrName).toLowerCase()}`);
}

export async function fetchPokemonTypes() {
  const data = await fetchJson(`${POKEAPI_BASE_URL}/type`);
  return data.results
    .map((type) => type.name)
    .filter((name) => name !== 'shadow' && name !== 'unknown');
}

export async function fetchEvolutionLine(idOrName) {
  const pokemon = await fetchPokemonByIdOrName(idOrName);
  const species = await fetchJson(pokemon.species.url);
  const evolutionData = await fetchJson(species.evolution_chain.url);

  const evolutionNames = [];
  let current = evolutionData.chain;

  while (current) {
    evolutionNames.push(current.species.name);
    current = current.evolves_to?.[0];
  }

  return evolutionNames;
}

export async function fetchRandomPokemon() {
  const randomId = Math.floor(Math.random() * 1025) + 1;
  return fetchPokemonByIdOrName(randomId);
}

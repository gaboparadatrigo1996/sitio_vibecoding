import { fetchPokemonByIdOrName } from '../api.js';
import { getCapturedIds, releasePokemon } from '../store.js';
import { renderError, renderLoading, renderPokemonCard } from '../components/ui.js';

export async function renderPokedexView({ container, navigate, renderApp }) {
  container.innerHTML = renderLoading('Cargando tu Pokédex personal...');

  try {
    const capturedIds = getCapturedIds();

    if (!capturedIds.length) {
      container.innerHTML = `
        <section class="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-soft dark:border-slate-800 dark:bg-slate-900">
          <h1 class="text-2xl font-bold">Tu Pokédex está vacía</h1>
          <p class="mt-2 text-sm text-slate-600 dark:text-slate-300">Captura Pokémon desde el listado principal para verlos aquí.</p>
          <a href="#/" class="mt-4 inline-flex rounded-xl bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600">Ir al inicio</a>
        </section>
      `;
      return;
    }

    const pokemons = await Promise.all(capturedIds.map((id) => fetchPokemonByIdOrName(id)));

    container.innerHTML = `
      <section class="space-y-4">
        <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-soft dark:border-slate-800 dark:bg-slate-900">
          <h1 class="text-2xl font-bold">Pokédex Personal</h1>
          <p class="text-sm text-slate-600 dark:text-slate-300">Tus Pokémon capturados (${capturedIds.length}).</p>
        </div>
        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          ${pokemons.map((pokemon) => renderPokemonCard(pokemon, capturedIds)).join('')}
        </div>
      </section>
    `;

    container.querySelectorAll('.pokemon-card').forEach((card) => {
      card.addEventListener('click', (event) => {
        if (event.target.closest('.capture-btn')) {
          return;
        }

        const pokemonId = card.dataset.pokemonId;
        navigate(`/pokemon/${pokemonId}`);
      });
    });

    container.querySelectorAll('.capture-btn').forEach((button) => {
      button.addEventListener('click', async (event) => {
        event.stopPropagation();
        releasePokemon(Number(button.dataset.pokemonId));
        await renderApp();
      });
    });
  } catch (error) {
    container.innerHTML = renderError(error.message);
  }
}

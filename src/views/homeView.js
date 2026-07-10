import { fetchPokemonPage, fetchPokemonTypes } from '../api.js';
import { capturePokemon, getCapturedIds, releasePokemon } from '../store.js';
import { capitalize, renderError, renderLoading, renderPokemonCard } from '../components/ui.js';

function filterPokemons(pokemons, search, selectedType) {
  return pokemons.filter((pokemon) => {
    const matchesSearch =
      !search || pokemon.name.includes(search.toLowerCase()) || String(pokemon.id).includes(search.trim());
    const matchesType = !selectedType || pokemon.types.some((entry) => entry.type.name === selectedType);

    return matchesSearch && matchesType;
  });
}

export async function renderHomeView({ container, navigate, state, renderApp }) {
  container.innerHTML = renderLoading('Cargando Pokémon...');

  try {
    if (!state.home.types) {
      state.home.types = await fetchPokemonTypes();
    }

    const offset = (state.home.page - 1) * state.home.limit;
    const { count, pokemons } = await fetchPokemonPage(offset, state.home.limit);
    const filtered = filterPokemons(pokemons, state.home.search, state.home.type);
    const totalPages = Math.ceil(count / state.home.limit);
    const capturedIds = getCapturedIds();

    container.innerHTML = `
      <section class="space-y-5">
        <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-soft dark:border-slate-800 dark:bg-slate-900">
          <h1 class="text-2xl font-bold">Listado de Pokémon</h1>
          <p class="mt-1 text-sm text-slate-600 dark:text-slate-300">Busca por nombre/ID y filtra por tipo.</p>
          <div class="mt-4 grid gap-3 sm:grid-cols-2">
            <label class="block">
              <span class="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Buscar</span>
              <input
                id="search-input"
                type="text"
                value="${state.home.search}"
                placeholder="Ej: pikachu o 25"
                class="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm outline-none ring-red-400 transition focus:ring dark:border-slate-700 dark:bg-slate-800"
              />
            </label>
            <label class="block">
              <span class="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Tipo</span>
              <select id="type-filter" class="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm outline-none ring-red-400 transition focus:ring dark:border-slate-700 dark:bg-slate-800">
                <option value="">Todos</option>
                ${state.home.types
                  .map(
                    (type) =>
                      `<option value="${type}" ${state.home.type === type ? 'selected' : ''}>${capitalize(type)}</option>`,
                  )
                  .join('')}
              </select>
            </label>
          </div>
        </div>

        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          ${
            filtered.length
              ? filtered.map((pokemon) => renderPokemonCard(pokemon, capturedIds)).join('')
              : `<p class="col-span-full rounded-2xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-600 shadow-soft dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">No hay resultados en esta página para tu búsqueda.</p>`
          }
        </div>

        <div class="flex items-center justify-center gap-3">
          <button id="prev-page" type="button" class="rounded-xl bg-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-300 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-slate-800 dark:text-slate-200" ${
            state.home.page <= 1 ? 'disabled' : ''
          }>Anterior</button>
          <span class="rounded-xl bg-red-500/15 px-3 py-2 text-xs font-semibold text-red-500">Página ${state.home.page} / ${totalPages}</span>
          <button id="next-page" type="button" class="rounded-xl bg-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-300 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-slate-800 dark:text-slate-200" ${
            state.home.page >= totalPages ? 'disabled' : ''
          }>Siguiente</button>
        </div>
      </section>
    `;

    container.querySelector('#search-input')?.addEventListener('input', async (event) => {
      state.home.search = event.target.value;
      await renderHomeView({ container, navigate, state, renderApp });
    });

    container.querySelector('#type-filter')?.addEventListener('change', async (event) => {
      state.home.type = event.target.value;
      await renderHomeView({ container, navigate, state, renderApp });
    });

    container.querySelector('#prev-page')?.addEventListener('click', async () => {
      state.home.page = Math.max(1, state.home.page - 1);
      await renderHomeView({ container, navigate, state, renderApp });
    });

    container.querySelector('#next-page')?.addEventListener('click', async () => {
      state.home.page += 1;
      await renderHomeView({ container, navigate, state, renderApp });
    });

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
        const pokemonId = Number(button.dataset.pokemonId);
        if (capturedIds.includes(pokemonId)) {
          releasePokemon(pokemonId);
        } else {
          capturePokemon(pokemonId);
        }

        await renderApp();
      });
    });
  } catch (error) {
    container.innerHTML = renderError(error.message);
  }
}

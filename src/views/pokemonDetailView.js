import { fetchEvolutionLine, fetchPokemonByIdOrName } from '../api.js';
import { capturePokemon, isCaptured, releasePokemon } from '../store.js';
import { capitalize, renderError, renderLoading, renderTypeBadge } from '../components/ui.js';

function statPercentage(statValue) {
  return Math.min(100, Math.round((statValue / 180) * 100));
}

export async function renderPokemonDetailView({ container, id, navigate, renderApp }) {
  container.innerHTML = renderLoading('Cargando detalle del Pokémon...');

  try {
    const [pokemon, evolutionLine] = await Promise.all([fetchPokemonByIdOrName(id), fetchEvolutionLine(id)]);
    const captured = isCaptured(pokemon.id);

    container.innerHTML = `
      <section class="space-y-5">
        <button id="back-home" type="button" class="rounded-xl bg-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700">
          <i class="fa-solid fa-arrow-left mr-1"></i>Volver
        </button>

        <article class="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft dark:border-slate-800 dark:bg-slate-900">
          <div class="grid gap-6 md:grid-cols-2">
            <div>
              <span class="rounded-lg bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">#${pokemon.id}</span>
              <h1 class="mt-3 text-3xl font-bold">${capitalize(pokemon.name)}</h1>
              <div class="mt-3 flex flex-wrap gap-2">${pokemon.types
                .map((type) => renderTypeBadge(type.type.name))
                .join('')}</div>
              <img
                src="${pokemon.sprites.other['official-artwork'].front_default || pokemon.sprites.front_default || ''}"
                alt="${pokemon.name}"
                class="mx-auto mt-4 h-56 w-56 object-contain"
              />
            </div>
            <div class="space-y-4">
              <div class="grid grid-cols-2 gap-3 text-sm">
                <p class="rounded-xl bg-slate-100 p-3 dark:bg-slate-800"><strong>Peso:</strong> ${pokemon.weight / 10} kg</p>
                <p class="rounded-xl bg-slate-100 p-3 dark:bg-slate-800"><strong>Altura:</strong> ${pokemon.height / 10} m</p>
              </div>

              <div>
                <h2 class="mb-2 text-lg font-semibold">Habilidades</h2>
                <div class="flex flex-wrap gap-2">
                  ${pokemon.abilities
                    .map(
                      (ability) =>
                        `<span class="rounded-full bg-indigo-500/15 px-3 py-1 text-xs font-semibold text-indigo-500">${capitalize(
                          ability.ability.name,
                        )}</span>`,
                    )
                    .join('')}
                </div>
              </div>

              <div>
                <h2 class="mb-2 text-lg font-semibold">Stats Base</h2>
                <div class="space-y-2">
                  ${pokemon.stats
                    .map(
                      (stat) => `
                        <div>
                          <div class="mb-1 flex justify-between text-xs text-slate-500 dark:text-slate-300">
                            <span>${capitalize(stat.stat.name)}</span><span>${stat.base_stat}</span>
                          </div>
                          <div class="h-2 rounded-full bg-slate-200 dark:bg-slate-800">
                            <div class="h-2 rounded-full bg-red-500 transition-all duration-700" style="width: ${statPercentage(
                              stat.base_stat,
                            )}%"></div>
                          </div>
                        </div>
                      `,
                    )
                    .join('')}
                </div>
              </div>

              <div>
                <h2 class="mb-2 text-lg font-semibold">Línea Evolutiva</h2>
                <p class="rounded-xl bg-slate-100 p-3 text-sm dark:bg-slate-800">${evolutionLine.map(capitalize).join(' → ')}</p>
              </div>

              <button id="capture-toggle" type="button" class="w-full rounded-xl px-4 py-3 text-sm font-bold text-white ${
                captured ? 'bg-rose-500 hover:bg-rose-600' : 'bg-emerald-500 hover:bg-emerald-600'
              }">
                ${captured ? 'Liberar' : '¡Capturar!'}
              </button>
            </div>
          </div>
        </article>
      </section>
    `;

    container.querySelector('#back-home')?.addEventListener('click', () => navigate('/'));

    container.querySelector('#capture-toggle')?.addEventListener('click', async () => {
      if (isCaptured(pokemon.id)) {
        releasePokemon(pokemon.id);
      } else {
        capturePokemon(pokemon.id);
      }

      await renderApp();
    });
  } catch (error) {
    container.innerHTML = renderError(error.message);
  }
}

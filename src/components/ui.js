import { TYPE_COLORS } from '../constants.js';

export function capitalize(value) {
  if (!value) return '';
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function renderLoading(message = 'Cargando...') {
  return `
    <div class="flex min-h-[260px] flex-col items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white p-6 text-slate-700 shadow-soft dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">
      <div class="h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-red-500 dark:border-slate-700"></div>
      <p class="text-sm">${message}</p>
    </div>
  `;
}

export function renderError(message) {
  return `
    <div class="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-900 dark:bg-red-950/50 dark:text-red-300">
      <p class="font-semibold">No se pudieron cargar los datos.</p>
      <p class="text-sm">${message}</p>
    </div>
  `;
}

export function renderTypeBadge(type) {
  const typeClass = TYPE_COLORS[type] || 'bg-slate-300 text-slate-900';
  return `<span class="rounded-full px-2 py-1 text-xs font-semibold ${typeClass}">${capitalize(type)}</span>`;
}

export function renderPokemonCard(pokemon, capturedIds = []) {
  const captured = capturedIds.includes(pokemon.id);

  return `
    <article class="pokemon-card group cursor-pointer rounded-2xl border border-slate-200 bg-white p-4 shadow-soft transition hover:-translate-y-1 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900" data-pokemon-id="${pokemon.id}">
      <div class="mb-3 flex items-start justify-between">
        <span class="rounded-lg bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">#${pokemon.id}</span>
        <button
          class="capture-btn rounded-lg px-2 py-1 text-xs font-bold text-white ${captured ? 'bg-rose-500 hover:bg-rose-600' : 'bg-emerald-500 hover:bg-emerald-600'}"
          data-pokemon-id="${pokemon.id}"
          type="button"
        >
          ${captured ? 'Liberar' : '¡Capturar!'}
        </button>
      </div>
      <img
        src="${pokemon.sprites.other['official-artwork'].front_default || pokemon.sprites.front_default || ''}"
        alt="${pokemon.name}"
        class="mx-auto h-28 w-28 object-contain transition group-hover:scale-105"
        loading="lazy"
      />
      <h3 class="mt-3 text-lg font-bold">${capitalize(pokemon.name)}</h3>
      <div class="mt-2 flex flex-wrap gap-2">
        ${pokemon.types.map((typeInfo) => renderTypeBadge(typeInfo.type.name)).join('')}
      </div>
    </article>
  `;
}

export function renderModal(title, content, buttonText = 'Cerrar') {
  return `
    <div class="fixed inset-0 z-40 flex items-center justify-center bg-black/60 p-4">
      <div class="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900">
        <h3 class="text-xl font-bold">${title}</h3>
        <p class="mt-2 text-sm text-slate-600 dark:text-slate-300">${content}</p>
        <button id="close-modal" type="button" class="mt-5 w-full rounded-xl bg-red-500 px-4 py-2 font-semibold text-white hover:bg-red-600">${buttonText}</button>
      </div>
    </div>
  `;
}

import { renderNavbar } from './src/components/layout.js';
import { getCapturedIds } from './src/store.js';
import { renderHomeView } from './src/views/homeView.js';
import { renderPokemonDetailView } from './src/views/pokemonDetailView.js';
import { renderPokedexView } from './src/views/pokedexView.js';
import { renderBattleView } from './src/views/battleView.js';

const THEME_KEY = 'pokemon-spa-theme';

const state = {
  home: {
    page: 1,
    limit: 18,
    search: '',
    type: '',
  },
  battle: {
    selectedPlayerId: null,
    activeBattle: null,
  },
};

function parseRoute(hash) {
  const cleanHash = hash.replace(/^#/, '') || '/';
  if (cleanHash === '/' || cleanHash === '') {
    return { name: 'home' };
  }

  const pokemonMatch = cleanHash.match(/^\/pokemon\/(\d+|[a-z-]+)$/i);
  if (pokemonMatch) {
    return { name: 'pokemon-detail', params: { id: pokemonMatch[1] } };
  }

  if (cleanHash === '/pokedex') {
    return { name: 'pokedex' };
  }

  if (cleanHash === '/battle') {
    return { name: 'battle' };
  }

  return { name: 'home' };
}

function navigate(path) {
  window.location.hash = path;
}

function setTheme(isDark) {
  document.documentElement.classList.toggle('dark', isDark);
  localStorage.setItem(THEME_KEY, isDark ? 'dark' : 'light');
}

function setupTheme() {
  const saved = localStorage.getItem(THEME_KEY);
  if (saved) {
    setTheme(saved === 'dark');
    return;
  }

  setTheme(true);
}

async function renderApp() {
  const app = document.getElementById('app');
  const route = parseRoute(window.location.hash);
  const isDark = document.documentElement.classList.contains('dark');

  app.innerHTML = `
    <div class="min-h-screen">
      ${renderNavbar(route.name, getCapturedIds().length, isDark)}
      <main id="view" class="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8"></main>
    </div>
  `;

  const toggleThemeButton = document.getElementById('toggle-theme');
  if (toggleThemeButton) {
    toggleThemeButton.addEventListener('click', () => {
      setTheme(!document.documentElement.classList.contains('dark'));
      renderApp();
    });
  }

  const view = document.getElementById('view');

  switch (route.name) {
    case 'pokemon-detail':
      await renderPokemonDetailView({ container: view, id: route.params.id, navigate, renderApp });
      break;
    case 'pokedex':
      await renderPokedexView({ container: view, navigate, renderApp });
      break;
    case 'battle':
      await renderBattleView({ container: view, navigate, state, renderApp });
      break;
    case 'home':
    default:
      await renderHomeView({ container: view, navigate, state, renderApp });
      break;
  }
}

window.addEventListener('hashchange', renderApp);
window.addEventListener('DOMContentLoaded', async () => {
  setupTheme();
  if (!window.location.hash) {
    navigate('/');
    return;
  }

  await renderApp();
});

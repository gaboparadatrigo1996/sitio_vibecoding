export function renderNavbar(activeRoute, capturedCount, isDark) {
  const links = [
    { href: '#/', label: 'Inicio', route: 'home', icon: 'fa-house' },
    { href: '#/pokedex', label: 'Pokédex', route: 'pokedex', icon: 'fa-book-open' },
    { href: '#/battle', label: 'Batalla', route: 'battle', icon: 'fa-shield-halved' },
  ];

  return `
    <header class="sticky top-0 z-20 border-b border-slate-200/80 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
      <div class="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <a href="#/" class="text-lg font-bold tracking-tight text-red-500 sm:text-xl">Pokémon SPA Game</a>
        <nav class="flex flex-wrap items-center gap-2">
          ${links
            .map(
              (link) => `
              <a
                href="${link.href}"
                class="rounded-xl px-3 py-2 text-sm font-medium transition ${
                  activeRoute === link.route
                    ? 'bg-red-500 text-white shadow-soft'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700'
                }"
              >
                <i class="fa-solid ${link.icon} mr-1"></i>${link.label}
              </a>
            `,
            )
            .join('')}
          <span class="rounded-xl bg-emerald-500/15 px-3 py-2 text-xs font-semibold text-emerald-500">
            Capturados: ${capturedCount}
          </span>
          <button
            id="toggle-theme"
            class="rounded-xl bg-slate-100 px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            type="button"
            aria-label="Cambiar tema"
          >
            <i class="fa-solid ${isDark ? 'fa-sun' : 'fa-moon'}"></i>
          </button>
        </nav>
      </div>
    </header>
  `;
}

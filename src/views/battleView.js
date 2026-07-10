import { fetchPokemonByIdOrName, fetchRandomPokemon } from '../api.js';
import { getCapturedIds } from '../store.js';
import { capitalize, renderError, renderLoading, renderModal } from '../components/ui.js';

function getHpPercent(current, max) {
  return Math.max(0, Math.round((current / max) * 100));
}

function playTone(frequency = 440, duration = 0.12) {
  const Context = window.AudioContext || window.webkitAudioContext;
  if (!Context) return;

  const audioContext = new Context();
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();

  oscillator.type = 'square';
  oscillator.frequency.value = frequency;
  gain.gain.value = 0.06;

  oscillator.connect(gain);
  gain.connect(audioContext.destination);
  oscillator.start();

  setTimeout(() => {
    oscillator.stop();
    audioContext.close();
  }, duration * 1000);
}

function calculateDamage(attacker, defender) {
  const attack = attacker.stats.find((entry) => entry.stat.name === 'attack')?.base_stat ?? 50;
  const defense = defender.stats.find((entry) => entry.stat.name === 'defense')?.base_stat ?? 50;
  return Math.max(6, Math.round(attack * 0.25 - defense * 0.1 + Math.random() * 8));
}

function renderBattleScreen(battleState, capturedPokemons) {
  const { player, rival, playerHp, rivalHp, logs, winner } = battleState;
  const playerMaxHp = player.stats.find((entry) => entry.stat.name === 'hp')?.base_stat ?? 100;
  const rivalMaxHp = rival.stats.find((entry) => entry.stat.name === 'hp')?.base_stat ?? 100;

  return `
    <section class="space-y-4">
      <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-soft dark:border-slate-800 dark:bg-slate-900">
        <h1 class="text-2xl font-bold">Modo Batalla</h1>
        <p class="mt-1 text-sm text-slate-600 dark:text-slate-300">Combate estilo RPG clásico.</p>

        <div class="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]">
          <select id="player-selector" class="rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800">
            ${capturedPokemons
              .map(
                (pokemon) =>
                  `<option value="${pokemon.id}" ${player.id === pokemon.id ? 'selected' : ''}>#${pokemon.id} ${capitalize(
                    pokemon.name,
                  )}</option>`,
              )
              .join('')}
          </select>
          <button id="new-battle" type="button" class="rounded-xl bg-indigo-500 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-600">
            Nuevo rival
          </button>
        </div>
      </div>

      <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft dark:border-slate-800 dark:bg-slate-900">
        <div class="grid gap-8 md:grid-cols-2">
          <div class="order-2 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/60 md:order-1">
            <p class="text-xs font-semibold uppercase text-slate-500">Jugador</p>
            <h2 class="text-xl font-bold">${capitalize(player.name)}</h2>
            <img src="${player.sprites.front_default || player.sprites.other['official-artwork'].front_default || ''}" alt="${player.name}" class="ml-0 mt-2 h-24 w-24 object-contain" />
            <div class="mt-2">
              <p class="mb-1 text-xs text-slate-500">HP ${playerHp}/${playerMaxHp}</p>
              <div class="h-3 rounded-full bg-slate-200 dark:bg-slate-800">
                <div class="h-3 rounded-full bg-emerald-500 transition-all duration-500" style="width:${getHpPercent(
                  playerHp,
                  playerMaxHp,
                )}%"></div>
              </div>
            </div>
          </div>

          <div class="order-1 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/60 md:order-2">
            <p class="text-right text-xs font-semibold uppercase text-slate-500">Rival</p>
            <h2 class="text-right text-xl font-bold">${capitalize(rival.name)}</h2>
            <img src="${rival.sprites.front_default || rival.sprites.other['official-artwork'].front_default || ''}" alt="${rival.name}" class="ml-auto mt-2 h-24 w-24 object-contain" />
            <div class="mt-2">
              <p class="mb-1 text-right text-xs text-slate-500">HP ${rivalHp}/${rivalMaxHp}</p>
              <div class="h-3 rounded-full bg-slate-200 dark:bg-slate-800">
                <div class="h-3 rounded-full bg-rose-500 transition-all duration-500" style="width:${getHpPercent(
                  rivalHp,
                  rivalMaxHp,
                )}%"></div>
              </div>
            </div>
          </div>
        </div>

        <div class="mt-5 flex gap-3">
          <button id="attack-btn" type="button" class="rounded-xl bg-red-500 px-4 py-2 text-sm font-bold text-white hover:bg-red-600 ${
            winner ? 'cursor-not-allowed opacity-60' : ''
          }" ${winner ? 'disabled' : ''}>
            Atacar
          </button>
          <button id="defend-btn" type="button" class="rounded-xl bg-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 dark:bg-slate-700 dark:text-slate-200 ${
            winner ? 'cursor-not-allowed opacity-60' : ''
          }" ${winner ? 'disabled' : ''}>
            Defender
          </button>
        </div>

        <div class="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm dark:border-slate-800 dark:bg-slate-950/60">
          <p class="mb-2 text-xs font-semibold uppercase text-slate-500">Registro de batalla</p>
          <div class="max-h-40 space-y-1 overflow-auto">
            ${logs.map((log) => `<p>• ${log}</p>`).join('')}
          </div>
        </div>
      </div>

      ${
        winner
          ? renderModal(
              winner === 'player' ? '¡Victoria!' : 'Derrota',
              winner === 'player'
                ? `¡${capitalize(player.name)} ganó y obtuvo una recompensa épica!`
                : `¡${capitalize(rival.name)} te ha derrotado! Intenta con otro Pokémon.`,
              'Cerrar',
            )
          : ''
      }
    </section>
  `;
}

async function createBattle(player) {
  const rival = await fetchRandomPokemon();
  const playerMaxHp = player.stats.find((entry) => entry.stat.name === 'hp')?.base_stat ?? 100;
  const rivalMaxHp = rival.stats.find((entry) => entry.stat.name === 'hp')?.base_stat ?? 100;

  return {
    player,
    rival,
    playerHp: playerMaxHp,
    rivalHp: rivalMaxHp,
    logs: [`¡${capitalize(rival.name)} apareció!`],
    winner: null,
  };
}

export async function renderBattleView({ container, navigate, state }) {
  container.innerHTML = renderLoading('Preparando combate...');

  try {
    const capturedIds = getCapturedIds();

    if (!capturedIds.length) {
      container.innerHTML = `
        <section class="rounded-2xl border border-amber-200 bg-amber-50 p-8 text-center shadow-soft dark:border-amber-900 dark:bg-amber-950/40">
          <h1 class="text-2xl font-bold text-amber-700 dark:text-amber-300">No tienes Pokémon para combatir</h1>
          <p class="mt-2 text-sm text-amber-700/90 dark:text-amber-300/90">Captura al menos uno para desbloquear esta vista.</p>
          <button id="go-capture" type="button" class="mt-4 rounded-xl bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600">Ir a capturar</button>
        </section>
      `;
      container.querySelector('#go-capture')?.addEventListener('click', () => navigate('/'));
      return;
    }

    const capturedPokemons = await Promise.all(capturedIds.map((id) => fetchPokemonByIdOrName(id)));

    if (!state.battle.selectedPlayerId || !capturedIds.includes(state.battle.selectedPlayerId)) {
      state.battle.selectedPlayerId = capturedIds[0];
      state.battle.activeBattle = null;
    }

    const selectedPlayer = capturedPokemons.find((pokemon) => pokemon.id === state.battle.selectedPlayerId) || capturedPokemons[0];

    if (!state.battle.activeBattle || state.battle.activeBattle.player.id !== selectedPlayer.id) {
      state.battle.activeBattle = await createBattle(selectedPlayer);
    }

    container.innerHTML = renderBattleScreen(state.battle.activeBattle, capturedPokemons);

    container.querySelector('#player-selector')?.addEventListener('change', async (event) => {
      state.battle.selectedPlayerId = Number(event.target.value);
      state.battle.activeBattle = null;
      await renderBattleView({ container, navigate, state });
    });

    container.querySelector('#new-battle')?.addEventListener('click', async () => {
      state.battle.activeBattle = null;
      await renderBattleView({ container, navigate, state });
    });

    container.querySelector('#attack-btn')?.addEventListener('click', async () => {
      const battle = state.battle.activeBattle;
      if (!battle || battle.winner) return;

      const damageToRival = calculateDamage(battle.player, battle.rival);
      battle.rivalHp = Math.max(0, battle.rivalHp - damageToRival);
      battle.logs.push(`¡${capitalize(battle.player.name)} usó Placaje! (${damageToRival} daño)`);
      playTone(580, 0.08);

      if (battle.rivalHp <= 0) {
        battle.winner = 'player';
        battle.logs.push(`¡${capitalize(battle.rival.name)} se debilitó!`);
        await renderBattleView({ container, navigate, state });
        return;
      }

      const damageToPlayer = calculateDamage(battle.rival, battle.player);
      battle.playerHp = Math.max(0, battle.playerHp - damageToPlayer);
      battle.logs.push(`¡${capitalize(battle.rival.name)} contraatacó! (${damageToPlayer} daño)`);
      playTone(280, 0.1);

      if (battle.playerHp <= 0) {
        battle.winner = 'rival';
        battle.logs.push(`¡${capitalize(battle.player.name)} se debilitó!`);
      }

      await renderBattleView({ container, navigate, state });
    });

    container.querySelector('#defend-btn')?.addEventListener('click', async () => {
      const battle = state.battle.activeBattle;
      if (!battle || battle.winner) return;

      const reducedDamage = Math.max(4, Math.round(calculateDamage(battle.rival, battle.player) * 0.5));
      battle.playerHp = Math.max(0, battle.playerHp - reducedDamage);
      battle.logs.push(`¡${capitalize(battle.player.name)} se defendió! Daño recibido: ${reducedDamage}.`);
      playTone(350, 0.06);

      if (battle.playerHp <= 0) {
        battle.winner = 'rival';
        battle.logs.push(`¡${capitalize(battle.player.name)} se debilitó!`);
      }

      await renderBattleView({ container, navigate, state });
    });

    container.querySelector('#close-modal')?.addEventListener('click', async () => {
      state.battle.activeBattle = null;
      await renderBattleView({ container, navigate, state });
    });
  } catch (error) {
    container.innerHTML = renderError(error.message);
  }
}

// Durum makinesi (spec.md §7). Saf fonksiyonlar: UI ve testler aynı kuralı kullanır.
import { consequence, DECISION_ORDER, START_MINUTES } from './story.ts';
import type { Ending, GameEvent, GameState } from './types.ts';

export const initialState: GameState = { screen: { kind: 'profil' }, profile: null, choices: {}, timedOut: {} };

export function reduce(state: GameState, event: GameEvent): GameState {
  const { screen } = state;
  switch (event.type) {
    case 'PROFIL_TAMAM':
      return screen.kind === 'profil' ? { ...state, profile: event.profile, screen: { kind: 'giris' } } : state;
    case 'BASLA':
      return screen.kind === 'giris' ? { ...state, screen: { kind: 'karar', id: DECISION_ORDER[0] } } : state;
    case 'SEC':
      if (screen.kind !== 'karar') return state;
      return {
        ...state,
        choices: { ...state.choices, [screen.id]: event.choice },
        timedOut: { ...state.timedOut, [screen.id]: !!event.timedOut },
        screen: { kind: 'sonuc', id: screen.id },
      };
    case 'DEVAM': {
      if (screen.kind !== 'sonuc') return state;
      const next = DECISION_ORDER[DECISION_ORDER.indexOf(screen.id) + 1];
      return { ...state, screen: next ? { kind: 'karar', id: next } : { kind: 'son' } };
    }
    case 'YENIDEN':
      return initialState;
  }
}

export function elapsedMinutes(state: GameState): number {
  return DECISION_ORDER.filter((id) => state.choices[id]).reduce((sum, id) => sum + consequence(id, state.choices).minutes, 0);
}

export function clock(minutesAfterStart: number): string {
  const t = START_MINUTES + minutesAfterStart;
  return `${String(Math.floor(t / 60)).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`;
}

export function ending(state: GameState): Ending {
  return state.choices.kvkk === 'A' ? 'A' : 'B';
}

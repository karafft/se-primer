import { useReducer } from 'react';
import { clock, elapsedMinutes, initialState, reduce } from './game/engine.ts';
import { TITLE } from './game/story.ts';
import ProfileScreen from './components/ProfileScreen.tsx';
import IntroScreen from './components/IntroScreen.tsx';
import DecisionScreen from './components/DecisionScreen.tsx';
import ConsequenceScreen from './components/ConsequenceScreen.tsx';
import EndScreen from './components/EndScreen.tsx';

export default function App() {
  const [state, dispatch] = useReducer(reduce, initialState);
  const { screen, profile } = state;

  return (
    <main className="app">
      <header className="topbar">
        <span className="brand">SE Primer</span>
        <span className="chapter">{TITLE}</span>
        {screen.kind !== 'profil' && (
          <span className="clock" data-cy="clock">
            {clock(elapsedMinutes(state))}
          </span>
        )}
      </header>

      {screen.kind === 'profil' && <ProfileScreen onDone={(p) => dispatch({ type: 'PROFIL_TAMAM', profile: p })} />}
      {screen.kind === 'giris' && profile && <IntroScreen profile={profile} onStart={() => dispatch({ type: 'BASLA' })} />}
      {screen.kind === 'karar' && profile && (
        <DecisionScreen
          key={screen.id}
          id={screen.id}
          profile={profile}
          choices={state.choices}
          onChoose={(choice, timedOut) => dispatch({ type: 'SEC', choice, timedOut })}
        />
      )}
      {screen.kind === 'sonuc' && profile && (
        <ConsequenceScreen id={screen.id} state={state} onNext={() => dispatch({ type: 'DEVAM' })} />
      )}
      {screen.kind === 'son' && <EndScreen state={state} onRestart={() => dispatch({ type: 'YENIDEN' })} />}
    </main>
  );
}

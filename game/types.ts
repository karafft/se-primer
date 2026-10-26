export type Level = 'yeni' | 'orta' | 'deneyimli';
export type Role = 'backend' | 'test' | 'devops';
export type DecisionId = 'mimari' | 'test' | 'kvkk';
export type Goal = DecisionId;
export type Choice = 'A' | 'B';
export type Ending = 'A' | 'B';

export interface Profile {
  level: Level;
  role: Role;
  goal: Goal;
}

export interface Decision {
  id: DecisionId;
  label: string;
  prompt: string;
  log?: string;
  options: Record<Choice, string>;
  hint: string;
  tutorOpening: string;
}

export interface Consequence {
  what: string;
  why: string;
  minutes: number;
}

export type Screen =
  | { kind: 'profil' }
  | { kind: 'giris' }
  | { kind: 'karar'; id: DecisionId }
  | { kind: 'sonuc'; id: DecisionId }
  | { kind: 'son' };

export interface GameState {
  screen: Screen;
  profile: Profile | null;
  choices: Partial<Record<DecisionId, Choice>>;
  timedOut: Partial<Record<DecisionId, boolean>>;
}

export type GameEvent =
  | { type: 'PROFIL_TAMAM'; profile: Profile }
  | { type: 'BASLA' }
  | { type: 'SEC'; choice: Choice; timedOut?: boolean }
  | { type: 'DEVAM' }
  | { type: 'YENIDEN' };

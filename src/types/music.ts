// Song and harmony types for bardic content

export type Instrument = 'vocal' | 'percussion' | 'wind' | 'strings' | 'brass' | 'any';

export interface Harmony {
  instrument: Instrument;
  effect: string;
}

export type MusicType = 'song' | 'ballad';

// Unified music piece type for both songs and ballads
export interface Music {
  id: number;
  type: MusicType; // 'song' or 'ballad'
  name: string;
  magical: boolean;
  difficulty: number; // Expression RC to perform (ballads use their single check RC)
  description: string;
  effect: string; // Melody/Ballad effect summary
  harmony_1?: Harmony | null; // Ballads typically only use harmony_1
  harmony_2?: Harmony | null; // Songs may define a second harmony
}

export type GameState = 'intro' | 'viewing' | 'playing' | 'naming' | 'ending' | 'epilogue';

export interface WordNode {
  id: string;
  word: string;
  braille: string;
  position: [number, number, number];
  targetPosition: [number, number, number];
  selected: boolean;
  partOfConstellation: boolean;
}

export interface Constellation {
  id: string;
  nodes: WordNode[];
  name: string;
  description: string;
}

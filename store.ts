import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { GameState, WordNode, Constellation } from './types';
import { WORDS, generateBraille } from './constants';

interface GameStore {
  gameState: GameState;
  nodes: WordNode[];
  constellations: Constellation[];
  selectedNodes: WordNode[];
  epilogue: string | null;

  setGameState: (state: GameState) => void;
  initNodes: () => void;
  viewSphere: () => void;
  scatterNodes: () => void;
  toggleNodeSelection: (id: string) => void;
  clearSelection: () => void;
  addConstellation: (name: string, description: string) => void;
  setEpilogue: (text: string) => void;
}

const generateSpherePositions = (count: number, radius: number): [number, number, number][] => {
  const positions: [number, number, number][] = [];
  const phi = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2;
    const radiusAtY = Math.sqrt(1 - y * y);
    const theta = phi * i;
    const x = Math.cos(theta) * radiusAtY;
    const z = Math.sin(theta) * radiusAtY;
    positions.push([x * radius, y * radius, z * radius]);
  }
  return positions;
};

const generateRandomPositions = (count: number, range: number): [number, number, number][] => {
  const positions: [number, number, number][] = [];
  for (let i = 0; i < count; i++) {
    positions.push([
      (Math.random() - 0.5) * range,
      (Math.random() - 0.5) * range,
      (Math.random() - 0.5) * range,
    ]);
  }
  return positions;
};

export const useGameStore = create<GameStore>((set, get) => ({
  gameState: 'intro',
  nodes: [],
  constellations: [],
  selectedNodes: [],
  epilogue: null,

  setGameState: (state) => set({ gameState: state }),

  initNodes: () => {
    const count = WORDS.length;
    const spherePositions = generateSpherePositions(count, 5);
    const randomPositions = generateRandomPositions(count, 30);

    const nodes: WordNode[] = WORDS.map((word, i) => ({
      id: uuidv4(),
      word,
      braille: generateBraille(word),
      position: spherePositions[i],
      targetPosition: randomPositions[i],
      selected: false,
      partOfConstellation: false,
    }));

    set({ nodes, gameState: 'intro' });
  },

  viewSphere: () => {
    set({ gameState: 'viewing' });
  },

  scatterNodes: () => {
    set((state) => ({
      gameState: 'playing',
    }));
  },

  toggleNodeSelection: (id) => {
    set((state) => {
      const nodeIndex = state.nodes.findIndex((n) => n.id === id);
      if (nodeIndex === -1) return state;

      const node = state.nodes[nodeIndex];
      if (node.partOfConstellation) return state;

      const isSelected = !node.selected;
      const newNodes = [...state.nodes];
      newNodes[nodeIndex] = { ...node, selected: isSelected };

      const selectedNodes = isSelected
        ? [...state.selectedNodes, newNodes[nodeIndex]]
        : state.selectedNodes.filter((n) => n.id !== id);

      return { nodes: newNodes, selectedNodes };
    });
  },

  clearSelection: () => {
    set((state) => ({
      nodes: state.nodes.map((n) => ({ ...n, selected: false })),
      selectedNodes: [],
    }));
  },

  addConstellation: (name, description) => {
    set((state) => {
      const newConstellation: Constellation = {
        id: uuidv4(),
        nodes: [...state.selectedNodes],
        name,
        description,
      };

      const selectedIds = new Set(state.selectedNodes.map((n) => n.id));
      const newNodesCount = state.selectedNodes.length;
      const newNodes: WordNode[] = [];
      const randomPositions = generateRandomPositions(newNodesCount, 30);
      const spherePositions = generateSpherePositions(newNodesCount, 5);
      
      for (let i = 0; i < newNodesCount; i++) {
        const randomWord = WORDS[Math.floor(Math.random() * WORDS.length)];
        newNodes.push({
          id: uuidv4(),
          word: randomWord,
          braille: generateBraille(randomWord),
          position: spherePositions[i],
          targetPosition: randomPositions[i],
          selected: false,
          partOfConstellation: false,
        });
      }

      return {
        constellations: [...state.constellations, newConstellation],
        nodes: [
          ...state.nodes.map((n) =>
            selectedIds.has(n.id)
              ? { ...n, selected: false, partOfConstellation: true }
              : n
          ),
          ...newNodes
        ],
        selectedNodes: [],
        gameState: 'playing',
      };
    });
  },

  setEpilogue: (text) => set({ epilogue: text, gameState: 'epilogue' }),
}));

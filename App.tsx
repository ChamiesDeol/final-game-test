import { useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { Scene } from './Scene';
import { UIOverlay } from './UIOverlay';
import { useGameStore } from './store';

export default function App() {
  const initNodes = useGameStore((state) => state.initNodes);

  useEffect(() => {
    initNodes();
  }, [initNodes]);

  return (
    <div className="w-screen h-screen bg-black overflow-hidden relative font-sans">
      <Canvas camera={{ position: [0, 0, 15], fov: 60 }}>
        <Scene />
      </Canvas>
      <UIOverlay />
    </div>
  );
}

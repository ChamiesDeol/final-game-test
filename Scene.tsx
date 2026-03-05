import { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html, Line, Stars, Sparkles, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { WordNode as WordNodeType } from './types';
import { useGameStore } from './store';

const Node = ({ node }: { node: WordNodeType }) => {
  const ref = useRef<THREE.Group>(null);
  const { gameState, toggleNodeSelection } = useGameStore();
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (!ref.current) return;

    const target = new THREE.Vector3(...(
      gameState === 'intro' || gameState === 'viewing' ? node.position :
      (gameState === 'ending' || gameState === 'epilogue') && !node.partOfConstellation ? node.position :
      node.targetPosition
    ));

    ref.current.position.lerp(target, 0.05);

    if (gameState === 'playing' && !node.partOfConstellation) {
      ref.current.position.y += Math.sin(state.clock.elapsedTime + node.id.charCodeAt(0)) * 0.002;
    }
  });

  const handleClick = (e: any) => {
    e.stopPropagation();
    if (gameState === 'playing' && !node.partOfConstellation) {
      toggleNodeSelection(node.id);
    }
  };

  return (
    <group ref={ref}>
      <Html center zIndexRange={[100, 0]} distanceFactor={15}>
        <div
          onClick={handleClick}
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
          className={`flex flex-col items-center justify-center transition-all duration-300 cursor-pointer select-none pointer-events-auto
            ${node.partOfConstellation ? 'opacity-40 scale-75' : 'opacity-80 hover:opacity-100'}
            ${node.selected ? 'text-cyan-300 scale-125 drop-shadow-[0_0_10px_rgba(103,232,249,0.8)]' : 'text-white'}
            ${hovered && !node.partOfConstellation ? 'scale-110 drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]' : ''}
          `}
        >
          <div className="text-2xl tracking-[0.2em] font-mono leading-none">{node.braille}</div>
          <div className="text-[10px] tracking-widest mt-1 opacity-50 font-sans">{node.word}</div>
        </div>
      </Html>
    </group>
  );
};

const Connections = () => {
  const { selectedNodes, constellations } = useGameStore();

  return (
    <>
      {constellations.map((c) => {
        const points = c.nodes.map((n) => new THREE.Vector3(...n.targetPosition));
        return (
          <Line
            key={c.id}
            points={points}
            color="rgba(255, 255, 255, 0.2)"
            lineWidth={1}
            dashed={false}
          />
        );
      })}

      {selectedNodes.length > 1 && (
        <Line
          points={selectedNodes.map((n) => new THREE.Vector3(...n.targetPosition))}
          color="#67e8f9"
          lineWidth={2}
          dashed={true}
          dashSize={0.5}
          dashScale={1}
          dashOffset={0}
        />
      )}
    </>
  );
};

const Nebula = () => {
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const vertexShader = `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

  const fragmentShader = `
    uniform float time;
    varying vec2 vUv;

    float noise(vec2 p) {
      return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
    }

    void main() {
      vec2 uv = vUv;
      float t = time * 0.05;
      
      float n = noise(uv * 5.0 + t) * 0.5 + noise(uv * 10.0 - t) * 0.25;
      
      vec3 color1 = vec3(0.05, 0.02, 0.1);
      vec3 color2 = vec3(0.01, 0.05, 0.15);
      vec3 color3 = vec3(0.0, 0.1, 0.2);
      
      vec3 finalColor = mix(color1, color2, n);
      finalColor = mix(finalColor, color3, smoothstep(0.4, 0.8, n));
      
      gl_FragColor = vec4(finalColor, 1.0);
    }
  `;

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.time.value = state.clock.elapsedTime;
    }
  });

  return (
    <mesh scale={[100, 100, 100]}>
      <sphereGeometry args={[1, 32, 32]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={{ time: { value: 0 } }}
        side={THREE.BackSide}
        depthWrite={false}
      />
    </mesh>
  );
};

const Meteors = ({ count = 30 }) => {
  const direction = useMemo(() => new THREE.Vector3(-1, -0.8, -0.5).normalize(), []);
  const quaternion = useMemo(() => {
    const q = new THREE.Quaternion();
    // Align the cylinder's local Y axis with the movement direction
    q.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction);
    return q;
  }, [direction]);

  const lines = useMemo(() => {
    return new Array(count).fill(0).map(() => ({
      start: new THREE.Vector3(
        Math.random() * 150 + 20,
        Math.random() * 100 + 40,
        Math.random() * 100 - 50
      ),
      speed: Math.random() * 1.5 + 0.5,
      length: Math.random() * 15 + 5,
      opacity: Math.random() * 0.8 + 0.2,
      delay: Math.random() * 8,
      time: 0,
    }));
  }, [count]);

  const groupRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    
    lines.forEach((line, i) => {
      line.time += delta;
      if (line.time > line.delay) {
        const mesh = groupRef.current!.children[i] as THREE.Mesh;
        // Move along the direction vector
        mesh.position.addScaledVector(direction, line.speed);

        // Reset when it goes too far down or left
        if (mesh.position.y < -50 || mesh.position.x < -100) {
          mesh.position.copy(line.start);
          line.time = 0;
          line.delay = Math.random() * 5;
        }
      }
    });
  });

  return (
    <group ref={groupRef}>
      {lines.map((line, i) => (
        <mesh key={i} position={line.start} quaternion={quaternion}>
          {/* radiusTop (head), radiusBottom (tail), height, radialSegments */}
          {/* Since local +Y points in the direction of movement, top is the head */}
          <cylinderGeometry args={[0.06, 0, line.length, 8]} />
          <meshBasicMaterial color="#cffafe" transparent opacity={line.opacity} />
        </mesh>
      ))}
    </group>
  );
};

const Planets = () => {
  return (
    <group>
      <mesh position={[-40, 20, -60]}>
        <sphereGeometry args={[15, 64, 64]} />
        <meshStandardMaterial 
          color="#1a202c" 
          emissive="#0f172a"
          emissiveIntensity={0.2}
          roughness={0.8}
        />
        <mesh scale={[1.05, 1.05, 1.05]}>
          <sphereGeometry args={[15, 32, 32]} />
          <meshBasicMaterial color="#38bdf8" transparent opacity={0.1} side={THREE.BackSide} />
        </mesh>
      </mesh>

      <mesh position={[50, -30, -40]}>
        <sphereGeometry args={[8, 32, 32]} />
        <meshStandardMaterial 
          color="#2d3748" 
          emissive="#1e293b"
          roughness={0.9}
        />
      </mesh>
    </group>
  );
};

export const Scene = () => {
  const { gameState, scatterNodes, nodes } = useGameStore();

  const handlePointerDown = () => {
    if (gameState === 'viewing') {
      scatterNodes();
    }
  };

  return (
    <>
      <ambientLight intensity={0.2} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      
      <Nebula />
      <Stars radius={50} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      <Sparkles count={1000} scale={100} size={2} speed={0.2} opacity={0.1} color="#ffffff" />
      <Meteors count={30} />

      <group onPointerDown={handlePointerDown}>
        {/* Invisible background to catch clicks */}
        {(gameState === 'intro' || gameState === 'viewing') && (
          <mesh visible={false} scale={[100, 100, 100]}>
            <sphereGeometry args={[1, 32, 32]} />
            <meshBasicMaterial side={THREE.BackSide} />
          </mesh>
        )}
        {nodes.map((node) => (
          <Node key={node.id} node={node} />
        ))}
        <Connections />
      </group>

      <OrbitControls 
        enablePan={false} 
        enableZoom={true} 
        maxDistance={60} 
        minDistance={10}
        autoRotate={gameState === 'intro' || gameState === 'viewing' || gameState === 'ending' || gameState === 'epilogue'}
        autoRotateSpeed={0.5}
      />
    </>
  );
};

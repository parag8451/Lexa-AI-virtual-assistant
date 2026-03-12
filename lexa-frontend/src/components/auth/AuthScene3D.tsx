import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial, Sphere, Torus, Icosahedron, Environment } from "@react-three/drei";
import * as THREE from "three";

function AnimatedSphere({ position, color, speed = 1, distort = 0.4, scale = 1 }: { 
  position: [number, number, number]; 
  color: string; 
  speed?: number; 
  distort?: number;
  scale?: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.1 * speed;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.15 * speed;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
      <Sphere ref={meshRef} args={[1, 64, 64]} position={position} scale={scale}>
        <MeshDistortMaterial
          color={color}
          attach="material"
          distort={distort}
          speed={2}
          roughness={0.2}
          metalness={0.8}
        />
      </Sphere>
    </Float>
  );
}

function AnimatedTorus({ position, color, speed = 1 }: { 
  position: [number, number, number]; 
  color: string; 
  speed?: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.2 * speed;
      meshRef.current.rotation.z = state.clock.elapsedTime * 0.1 * speed;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.8}>
      <Torus ref={meshRef} args={[1, 0.3, 32, 64]} position={position} scale={0.8}>
        <meshStandardMaterial
          color={color}
          roughness={0.1}
          metalness={0.9}
          transparent
          opacity={0.7}
        />
      </Torus>
    </Float>
  );
}

function AnimatedIcosahedron({ position, color }: { 
  position: [number, number, number]; 
  color: string;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.15;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.2;
    }
  });

  return (
    <Float speed={1} rotationIntensity={0.4} floatIntensity={1.2}>
      <Icosahedron ref={meshRef} args={[0.8, 1]} position={position}>
        <meshStandardMaterial
          color={color}
          wireframe
          roughness={0.3}
          metalness={0.7}
        />
      </Icosahedron>
    </Float>
  );
}

function ParticleField() {
  const count = 200;
  const meshRef = useRef<THREE.Points>(null);
  
  const particles = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 20;
      
      // Blue to cyan gradient
      colors[i * 3] = 0.2 + Math.random() * 0.3;
      colors[i * 3 + 1] = 0.5 + Math.random() * 0.3;
      colors[i * 3 + 2] = 0.9 + Math.random() * 0.1;
    }
    
    return { positions, colors };
  }, []);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.02;
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.01;
    }
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={particles.positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={count}
          array={particles.colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        vertexColors
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
}

function GlowingRing({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = Math.PI / 2;
      meshRef.current.rotation.z = state.clock.elapsedTime * 0.3;
    }
  });

  return (
    <Float speed={0.5} rotationIntensity={0.2} floatIntensity={0.5}>
      <Torus ref={meshRef} args={[2, 0.02, 16, 100]} position={position} scale={scale}>
        <meshBasicMaterial color="#60a5fa" transparent opacity={0.5} />
      </Torus>
    </Float>
  );
}

function Scene() {
  return (
    <>
      <Environment preset="night" />
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={1} color="#60a5fa" />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#a78bfa" />
      <spotLight position={[0, 10, 0]} intensity={0.8} color="#22d3ee" angle={0.3} />
      
      {/* Main central sphere */}
      <AnimatedSphere position={[-3, 0, -2]} color="#3b82f6" distort={0.5} scale={1.5} />
      
      {/* Secondary spheres */}
      <AnimatedSphere position={[3, 2, -4]} color="#8b5cf6" distort={0.3} scale={0.8} speed={0.7} />
      <AnimatedSphere position={[4, -2, -3]} color="#06b6d4" distort={0.4} scale={0.6} speed={1.2} />
      
      {/* Torus rings */}
      <AnimatedTorus position={[-2, 3, -5]} color="#60a5fa" speed={0.8} />
      <AnimatedTorus position={[2, -3, -4]} color="#a78bfa" speed={0.6} />
      
      {/* Wireframe icosahedrons */}
      <AnimatedIcosahedron position={[0, 2, -3]} color="#22d3ee" />
      <AnimatedIcosahedron position={[-4, -2, -4]} color="#818cf8" />
      
      {/* Glowing rings */}
      <GlowingRing position={[-3, 0, -2]} scale={0.8} />
      <GlowingRing position={[3, 1, -3]} scale={0.5} />
      
      {/* Particle field */}
      <ParticleField />
    </>
  );
}

export function AuthScene3D() {
  return (
    <div className="absolute inset-0 z-0">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 60 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <Scene />
      </Canvas>
    </div>
  );
}

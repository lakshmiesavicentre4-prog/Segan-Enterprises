import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial, Float, Stars } from '@react-three/drei';
import * as THREE from 'three';

const AnimatedShapes = () => {
  const sphereRef = useRef<THREE.Mesh>(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  const mainScale = isMobile ? 1.1 : 1.5;
  const mainPos: [number, number, number] = isMobile ? [0.5, 2, -4] : [3, 0, -2];
  
  const secondaryScale = isMobile ? 0.7 : 1;
  const secondaryPos: [number, number, number] = isMobile ? [-1.5, -2, -5] : [-4, -2, -5];
  
  useFrame((state) => {
    if (sphereRef.current) {
      sphereRef.current.rotation.x = state.clock.getElapsedTime() * 0.1;
      sphereRef.current.rotation.y = state.clock.getElapsedTime() * 0.2;
    }
  });

  return (
    <>
      <Float speed={1.5} rotationIntensity={isMobile ? 0.2 : 0.5} floatIntensity={isMobile ? 0.5 : 1} position={mainPos}>
        <Sphere ref={sphereRef} args={[mainScale, 64, 64]}>
          <MeshDistortMaterial
            color="#a7553f"
            attach="material"
            distort={0.4}
            speed={1.5}
            roughness={0.2}
            metalness={0.8}
            clearcoat={1}
            clearcoatRoughness={0.1}
          />
        </Sphere>
      </Float>
      <Float speed={2} rotationIntensity={isMobile ? 0.5 : 0.8} floatIntensity={isMobile ? 0.5 : 1} position={secondaryPos}>
        <Sphere args={[secondaryScale, 64, 64]}>
          <MeshDistortMaterial
            color="#af9774"
            attach="material"
            distort={0.5}
            speed={2}
            roughness={0.2}
            metalness={0.8}
            clearcoat={1}
          />
        </Sphere>
      </Float>
    </>
  );
};

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) {
      return null; // Fallback to empty if 3D crashes
    }
    return this.props.children;
  }
}

export const Hero3D = () => {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden h-full w-full">
      <ErrorBoundary>
        <Canvas 
          camera={{ position: [0, 0, 5], fov: 45 }} 
          gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
          dpr={[1, 2]} // limit pixel ratio to 2 for performance reliability
        >
          <ambientLight intensity={0.8} />
          <directionalLight position={[10, 10, 5]} intensity={1.5} />
          <directionalLight position={[-10, -10, -5]} intensity={1.5} color="#e2b7a9" />
          <directionalLight position={[0, -10, 0]} intensity={0.5} color="#c1b092" />
          
          <Stars radius={100} depth={50} count={1000} factor={4} saturation={0} fade speed={1} />
          <AnimatedShapes />
        </Canvas>
      </ErrorBoundary>
    </div>
  );
};

import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Stars, TorusKnot, Icosahedron, Sparkles, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

const UltimateAnimatedShapes = () => {
  const mainRef = useRef<THREE.Mesh>(null);
  const secondaryRef = useRef<THREE.Mesh>(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  const mainScale = isMobile ? 0.8 : 1.2;
  const mainPos: [number, number, number] = isMobile ? [0.5, 2, -4] : [3, 0, -2];
  
  const secondaryScale = isMobile ? 0.6 : 0.9;
  const secondaryPos: [number, number, number] = isMobile ? [-1.5, -2, -5] : [-4, -2, -5];
  
  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (mainRef.current) {
      mainRef.current.rotation.x = time * 0.15;
      mainRef.current.rotation.y = time * 0.25;
      mainRef.current.position.y += Math.sin(time * 2) * 0.005;
    }
    if (secondaryRef.current) {
      secondaryRef.current.rotation.x = -time * 0.2;
      secondaryRef.current.rotation.z = time * 0.1;
    }
  });

  return (
    <>
      <Float speed={1.5} rotationIntensity={isMobile ? 0.4 : 0.8} floatIntensity={0.5} position={mainPos}>
        <TorusKnot ref={mainRef} args={[mainScale, 0.3, 128, 32]} scale={1.2}>
          <MeshDistortMaterial
            color="#a7553f"
            attach="material"
            distort={0.3}
            speed={1.5}
            roughness={0.1}
            metalness={0.9}
            clearcoat={1}
            clearcoatRoughness={0.1}
            wireframe={false}
          />
        </TorusKnot>
        <Sparkles count={50} scale={5} size={2} color="#fcd34d" speed={0.4} opacity={0.5} />
      </Float>

      <Float speed={2} rotationIntensity={isMobile ? 0.6 : 1} floatIntensity={1} position={secondaryPos}>
        <Icosahedron ref={secondaryRef} args={[secondaryScale, 2]}>
          <MeshDistortMaterial
            color="#af9774"
            attach="material"
            distort={0.5}
            speed={2}
            roughness={0.2}
            metalness={0.8}
            clearcoat={1}
            wireframe={true}
          />
        </Icosahedron>
        <Sparkles count={40} scale={4} size={1.5} color="#e2b7a9" speed={0.5} opacity={0.4} />
      </Float>
      
      {/* Background ambient sparkles */}
      <Sparkles count={150} scale={15} size={1} color="#f8fafc" speed={0.1} opacity={0.2} />
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
          camera={{ position: [0, 0, 8], fov: 45 }} 
          gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
          dpr={[1, 2]} // limit pixel ratio to 2 for performance reliability
        >
          <ambientLight intensity={0.6} />
          <directionalLight position={[10, 10, 10]} intensity={2} color="#ffffff" />
          <directionalLight position={[-10, -10, -5]} intensity={1.5} color="#e2b7a9" />
          <directionalLight position={[0, -10, 0]} intensity={1} color="#c1b092" />
          
          <spotLight position={[0, 10, 5]} angle={0.5} penumbra={1} intensity={1} color="#fcd34d" />

          {/* Epic space background with deeper stars */}
          <Stars radius={150} depth={100} count={2500} factor={5} saturation={0.5} fade speed={0.5} />
          
          <UltimateAnimatedShapes />
        </Canvas>
      </ErrorBoundary>
    </div>
  );
};


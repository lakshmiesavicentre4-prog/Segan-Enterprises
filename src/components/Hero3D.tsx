import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Stars, TorusKnot, Icosahedron, Sparkles, MeshDistortMaterial, Environment, ContactShadows, Sphere, MeshTransmissionMaterial } from '@react-three/drei';
import * as THREE from 'three';

const UltimateAnimatedShapes = () => {
  const mainRef = useRef<THREE.Mesh>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  const mainScale = isMobile ? 1.0 : 2.0;
  
  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (mainRef.current) {
      mainRef.current.rotation.x = time * 0.05;
      mainRef.current.rotation.y = time * 0.08;
    }
    if (coreRef.current) {
      coreRef.current.rotation.y = -time * 0.05;
    }
  });

  return (
    <>
      <Float speed={1} rotationIntensity={0.2} floatIntensity={0.5} position={[0, -0.5, 0]}>
        {/* Outer Elegant Ring */}
        <mesh ref={mainRef}>
          <torusGeometry args={[mainScale, 0.04, 64, 128]} />
          <meshStandardMaterial
            color="#F59E0B"
            roughness={0.1}
            metalness={1}
            envMapIntensity={2.0}
          />
        </mesh>
        
        {/* Core Glass Sphere */}
        <Sphere ref={coreRef} args={[mainScale * 0.8, 64, 64]}>
          <MeshTransmissionMaterial 
            samples={12}
            resolution={1024}
            transmission={0.97}
            roughness={0.06}
            thickness={2}
            ior={1.4}
            chromaticAberration={0.05}
            anisotropy={0.1}
            color="#ffffff"
            clearcoat={1}
          />
        </Sphere>
        
        <Sparkles count={30} scale={4} size={1.5} color="#F59E0B" speed={0.1} opacity={0.6} />
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
      return null;
    }
    return this.props.children;
  }
}

export const Hero3D = () => {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden h-full w-full">
      <ErrorBoundary>
        <Canvas 
          camera={{ position: [0, 0, 8.5], fov: 40 }} 
          gl={{ antialias: true, alpha: true, powerPreference: "high-performance", logarithmicDepthBuffer: true }}
          dpr={[1, 2]} 
        >
          <ambientLight intensity={0.4} />
          <directionalLight position={[10, 10, 10]} intensity={1.5} color="#ffffff" />
          <spotLight position={[-10, 20, 10]} angle={0.15} penumbra={1} intensity={3} color="#F59E0B" />
          <directionalLight position={[-5, -10, -5]} intensity={1} color="#0F172A" />
          
          <Environment preset="studio" environmentIntensity={1.5} />
          
          <UltimateAnimatedShapes />
          
          <ContactShadows position={[0, -3.5, 0]} opacity={0.6} scale={20} blur={2.5} far={4.5} color="#0F172A" />
        </Canvas>
      </ErrorBoundary>
    </div>
  );
};


import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Sparkles, MeshDistortMaterial, Environment, ContactShadows, Sphere } from '@react-three/drei';
import * as THREE from 'three';

const HolographicFluid = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  const mainScale = isMobile ? 1.5 : 2.5;
  const positionX = isMobile ? 0 : 2; // Move somewhat to the right on desktop
  
  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (meshRef.current) {
      meshRef.current.rotation.x = time * 0.1;
      meshRef.current.rotation.y = time * 0.15;
    }
  });

  return (
    <>
      <Float speed={1.5} rotationIntensity={0.5} floatIntensity={1} position={[positionX, -0.5, 0]}>
        {/* Deep Holographic Fluid Sphere */}
        <Sphere ref={meshRef} args={[mainScale, 128, 128]}>
          <MeshDistortMaterial
            color="#E8F0FE" // Metro Teal base
            attach="material"
            distort={0.4}
            speed={2}
            roughness={0}
            metalness={0.9}
            clearcoat={1}
            clearcoatRoughness={0.1}
            envMapIntensity={3}
            iridescence={1}
            iridescenceIOR={1.3}
            iridescenceThicknessRange={[100, 400]}
          />
        </Sphere>
        
        <Sparkles count={40} scale={mainScale * 2.5} size={2.5} color="#FF007A" speed={0.4} opacity={0.6} />
        <Sparkles count={40} scale={mainScale * 2.5} size={2} color="#7A00FF" speed={0.3} opacity={0.5} />
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
          {/* Neon lights illuminating the fluid */}
          <directionalLight position={[10, 10, 10]} intensity={2} color="#ffffff" />
          <spotLight position={[-10, 20, 10]} angle={0.3} penumbra={1} intensity={4} color="#FF007A" />
          <spotLight position={[10, -20, -10]} angle={0.3} penumbra={1} intensity={4} color="#7A00FF" />
          <directionalLight position={[-5, -10, -5]} intensity={2} color="#1A0B2E" />
          
          <Environment preset="city" environmentIntensity={1.5} />
          
          <HolographicFluid />
          
          <ContactShadows position={[0, -3.5, 0]} opacity={0.6} scale={20} blur={2.5} far={4.5} color="#1A0B2E" />
        </Canvas>
      </ErrorBoundary>
    </div>
  );
};


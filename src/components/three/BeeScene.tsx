'use client';

import { Canvas } from '@react-three/fiber';
import { Sparkles, Environment, ContactShadows } from '@react-three/drei';
import { Suspense } from 'react';
import BeeModel from './BeeModel';

interface BeeSceneProps {
  isAuthenticated: boolean;
}

export default function BeeScene({ isAuthenticated }: BeeSceneProps) {
  return (
    <div className="fixed inset-0 w-full h-screen z-10 pointer-events-none transition-opacity duration-1000">
      <Canvas
        shadows
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        camera={{ position: [0, 0, 5], fov: 45 }}
      >
        <Suspense fallback={null}>
          {/* Ambient lighting to brighten the scene slightly and showcase details */}
          <ambientLight intensity={0.8} />
          
          {/* Warm cinematic key light mimicking sunbeams */}
          <directionalLight
            castShadow
            position={[10, 10, 5]}
            intensity={3.5}
            color="#ffb703"
            shadow-mapSize={[1024, 1024]}
            shadow-camera-far={20}
            shadow-camera-left={-5}
            shadow-camera-right={5}
            shadow-camera-top={5}
            shadow-camera-bottom={-5}
          />
          
          {/* Golden spotlight targeting the center to highlight the bee */}
          <spotLight
            position={[0, 8, 4]}
            intensity={5.0}
            angle={0.6}
            penumbra={1}
            color="#ffb703"
            castShadow
          />

          {/* Warm accent light from below/side */}
          <pointLight position={[-10, -5, -5]} intensity={2.5} color="#ffd166" />
          
          {/* Subtle soft golden rim light for natural pop */}
          <directionalLight position={[-5, 5, -2]} intensity={2.0} color="#ffb703" />

          {/* Glowing Pollen Particles (Cinematic floating particles) */}
          <Sparkles
            count={100}
            scale={12}
            size={4}
            speed={0.6}
            color="#ffb703"
            opacity={0.8}
          />
          <Sparkles
            count={50}
            scale={10}
            size={6}
            speed={0.3}
            color="#ffd166"
            opacity={0.5}
          />

          <BeeModel isAuthenticated={isAuthenticated} />

          {/* Realistic soft contact shadow below the bee */}
          <ContactShadows
            position={[0, -2.5, 0]}
            opacity={0.4}
            scale={10}
            blur={2.5}
            far={4}
          />

          {/* Premium natural environment maps for realistic reflections */}
          <Environment preset="forest" />
        </Suspense>
      </Canvas>
    </div>
  );
}

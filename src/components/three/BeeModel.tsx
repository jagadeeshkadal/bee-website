'use client';

import { useRef, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, useAnimations } from '@react-three/drei';
import * as THREE from 'three';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface BeeModelProps {
  isAuthenticated: boolean;
}

export default function BeeModel({ isAuthenticated }: BeeModelProps) {
  const groupRef = useRef<THREE.Group>(null);
  const beeRef = useRef<THREE.Group>(null);
  
  // click-to-interact state
  const [isInteracting, setIsInteracting] = useState(false);
  const [hovered, setHovered] = useState(false);

  // Load the GLB model from public folder
  const { scene, animations } = useGLTF('/demon_bee_full_texture.glb');
  const { actions, names } = useAnimations(animations, groupRef);

  // Target positions and rotations that GSAP will animate
  const targets = useRef({
    x: 1.5,
    y: 0,
    z: 3.2, 
    rx: 0,
    ry: Math.PI / 4,
    rz: 0,
    scale: 0.25, 
    section: 0 
  });

  // Play animation clip
  useEffect(() => {
    if (names.length > 0) {
      const action = actions[names[0]];
      if (action) {
        action.reset().fadeIn(0.5).play();
        action.setEffectiveTimeScale(1.5);
      }
    }

    // Traverse the scene to enable shadows and adjust material settings for cinematic look
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        
        if (mesh.material) {
          const mat = mesh.material as THREE.MeshStandardMaterial;
          mat.roughness = 0.2; 
          mat.metalness = 0.95; 
          mat.envMapIntensity = 2.5; 
          
          mat.emissive = new THREE.Color('#ffb703');
          mat.emissiveIntensity = 0.18;
        }
      }
    });
  }, [actions, names, scene]);

  // Update document body style cursor when hovering the interactive bee
  useEffect(() => {
    if (typeof window !== 'undefined') {
      document.body.style.cursor = hovered ? 'pointer' : 'default';
    }
    return () => {
      if (typeof window !== 'undefined') {
        document.body.style.cursor = 'default';
      }
    };
  }, [hovered]);

  // Handle GSAP ScrollTrigger animations
  useEffect(() => {
    if (!isAuthenticated) return; 

    const isMobile = window.innerWidth < 768;
    const baseScale = isMobile ? 0.15 : 0.25;

    targets.current.scale = baseScale;
    targets.current.x = isMobile ? 0.35 : 1.5;

    const ctx = gsap.context(() => {
      // 1. Hero to Story Section
      gsap.timeline({
        scrollTrigger: {
          trigger: '#origin',
          start: 'top bottom',
          end: 'top center',
          scrub: 1.5,
          onUpdate: (self) => {
            const progress = self.progress;
            const startX = isMobile ? 0.35 : 1.5;
            targets.current.x = THREE.MathUtils.lerp(startX, isMobile ? -0.4 : -1.8, progress);
            targets.current.y = THREE.MathUtils.lerp(0, isMobile ? -0.1 : -0.2, progress);
            targets.current.z = THREE.MathUtils.lerp(3.2, isMobile ? 2.6 : 2.8, progress);
            targets.current.ry = THREE.MathUtils.lerp(Math.PI / 4, Math.PI / 1.5, progress);
            targets.current.scale = THREE.MathUtils.lerp(baseScale, baseScale * 0.9, progress);
            
            targets.current.section = progress; 
          }
        }
      });
 
      // 2. Story to Products Section
      gsap.timeline({
        scrollTrigger: {
          trigger: '#flavors',
          start: 'top bottom',
          end: 'top center',
          scrub: 1.5,
          onUpdate: (self) => {
            const progress = self.progress;
            const startX = isMobile ? -0.4 : -1.8;
            const startY = isMobile ? -0.1 : -0.2;
            const startZ = isMobile ? 2.6 : 2.8;
            const startRy = Math.PI / 1.5;
            const startScale = baseScale * 0.9;

            targets.current.x = THREE.MathUtils.lerp(startX, isMobile ? 0.4 : 1.8, progress);
            targets.current.y = THREE.MathUtils.lerp(startY, isMobile ? 0.1 : 0.3, progress);
            targets.current.z = THREE.MathUtils.lerp(startZ, isMobile ? 2.5 : 2.8, progress);
            targets.current.ry = THREE.MathUtils.lerp(startRy, -Math.PI / 3, progress);
            targets.current.scale = THREE.MathUtils.lerp(startScale, baseScale * 0.95, progress);
            
            targets.current.section = 1.0 + progress; 
          }
        }
      });

      // 3. Products to Process Section
      gsap.timeline({
        scrollTrigger: {
          trigger: '#process',
          start: 'top bottom',
          end: 'top center',
          scrub: 1.5,
          onUpdate: (self) => {
            const progress = self.progress;
            const startX = isMobile ? 0.4 : 1.8;
            const startY = isMobile ? 0.1 : 0.3;
            const startZ = isMobile ? 2.5 : 2.8;
            const startRy = -Math.PI / 3;
            const startScale = baseScale * 0.95;

            targets.current.x = THREE.MathUtils.lerp(startX, isMobile ? -0.3 : -1.5, progress);
            targets.current.y = THREE.MathUtils.lerp(startY, isMobile ? -0.2 : -0.4, progress);
            targets.current.z = THREE.MathUtils.lerp(startZ, isMobile ? 2.3 : 2.6, progress);
            targets.current.ry = THREE.MathUtils.lerp(startRy, Math.PI / 2, progress);
            targets.current.scale = THREE.MathUtils.lerp(startScale, baseScale * 0.9, progress);
            
            targets.current.section = 2.0 + progress; 
          }
        }
      });

      // 4. Process to Testimonial Section
      gsap.timeline({
        scrollTrigger: {
          trigger: '#testimonials',
          start: 'top bottom',
          end: 'top center',
          scrub: 1.5,
          onUpdate: (self) => {
            const progress = self.progress;
            const startX = isMobile ? -0.3 : -1.5;
            const startY = isMobile ? -0.2 : -0.4;
            const startZ = isMobile ? 2.3 : 2.6;
            const startRy = Math.PI / 2;
            const startScale = baseScale * 0.9;

            targets.current.x = THREE.MathUtils.lerp(startX, 0, progress);
            targets.current.y = THREE.MathUtils.lerp(startY, isMobile ? -0.4 : -0.6, progress);
            targets.current.z = THREE.MathUtils.lerp(startZ, isMobile ? 2.2 : 2.5, progress);
            targets.current.ry = THREE.MathUtils.lerp(startRy, Math.PI, progress);
            targets.current.scale = THREE.MathUtils.lerp(startScale, baseScale * 0.9, progress);
            
            targets.current.section = 3.0 + progress; 
          }
        }
      });

      // 5. Testimonial to Contact Section
      gsap.timeline({
        scrollTrigger: {
          trigger: '#contact',
          start: 'top bottom',
          end: 'top center',
          scrub: 1.5,
          onUpdate: (self) => {
            const progress = self.progress;
            const startX = 0;
            const startY = isMobile ? -0.4 : -0.6;
            const startZ = isMobile ? 2.2 : 2.5;
            const startRy = Math.PI;
            const startScale = baseScale * 0.9;

            targets.current.x = THREE.MathUtils.lerp(startX, isMobile ? 0.3 : 1.5, progress);
            targets.current.y = THREE.MathUtils.lerp(startY, isMobile ? -0.1 : -0.3, progress);
            targets.current.z = THREE.MathUtils.lerp(startZ, isMobile ? 2.6 : 2.8, progress);
            targets.current.ry = THREE.MathUtils.lerp(startRy, Math.PI * 1.8, progress);
            targets.current.scale = THREE.MathUtils.lerp(startScale, baseScale * 0.95, progress);
            
            targets.current.section = 4.0 + progress; 
          }
        }
      });
    });

    return () => ctx.revert();
  }, [isAuthenticated]);

  // Frame loop for micro-animations, mouse follow, and lerping
  useFrame((state) => {
    if (!beeRef.current || !groupRef.current) return;

    // Use state pointer only if clicked/interacting is active. Otherwise treat mouse offset as 0.
    const x = isInteracting ? state.pointer.x : 0;
    const y = isInteracting ? state.pointer.y : 0;

    const elapsedTime = state.clock.getElapsedTime();
    const section = targets.current.section;

    // 1. Dynamic wing beat timescale based on section
    const action = actions[names[0]];
    if (action) {
      const targetSpeed = [1.5, 0.9, 1.4, 1.2, 0.8, 0.25][Math.round(section)] ?? 1.2;
      const currentScale = action.getEffectiveTimeScale();
      action.setEffectiveTimeScale(THREE.MathUtils.lerp(currentScale, targetSpeed, 0.05));
    }

    // 2. Section-specific Hover Amplitudes and Frequencies (fixed movements)
    const ampY = [0.15, 0.22, 0.1, 0.05, 0.18, 0.02][Math.round(section)] ?? 0.12;
    const ampX = [0.1, 0.16, 0.06, 0.03, 0.12, 0.01][Math.round(section)] ?? 0.08;
    const ampZ = [0.08, 0.12, 0.04, 0.02, 0.08, 0.01][Math.round(section)] ?? 0.06;

    const freqY = [3.0, 1.5, 2.5, 2.0, 1.2, 0.5][Math.round(section)] ?? 2.0;
    const freqX = [2.2, 1.1, 1.8, 1.5, 0.9, 0.4][Math.round(section)] ?? 1.5;

    const hoverY = Math.sin(elapsedTime * freqY) * ampY;
    const hoverX = Math.cos(elapsedTime * freqX) * ampX;
    const hoverZ = Math.sin(elapsedTime * 1.5) * ampZ;

    // 3. Dynamic mouse luring scale (active only if clicked)
    const cursorScaleX = [0.55, 0.35, 0.5, 0.15, 0.2, 0.05][Math.round(section)] ?? 0.3;
    const cursorScaleY = [0.45, 0.25, 0.4, 0.1, 0.15, 0.05][Math.round(section)] ?? 0.25;

    // 4. Smooth Apple-style Inertial Positions Lerps
    groupRef.current.position.x = THREE.MathUtils.lerp(
      groupRef.current.position.x, 
      targets.current.x + x * cursorScaleX + hoverX, 
      0.06
    );
    groupRef.current.position.y = THREE.MathUtils.lerp(
      groupRef.current.position.y, 
      targets.current.y + y * cursorScaleY + hoverY, 
      0.06
    );
    groupRef.current.position.z = THREE.MathUtils.lerp(
      groupRef.current.position.z, 
      targets.current.z + hoverZ, 
      0.06
    );

    // Lerp rotations smoothly (mouse tilt only when interacting)
    groupRef.current.rotation.x = THREE.MathUtils.lerp(
      groupRef.current.rotation.x, 
      targets.current.rx - y * 0.15, 
      0.06
    );
    groupRef.current.rotation.y = THREE.MathUtils.lerp(
      groupRef.current.rotation.y, 
      targets.current.ry + x * 0.25, 
      0.06
    );
    groupRef.current.rotation.z = THREE.MathUtils.lerp(
      groupRef.current.rotation.z, 
      targets.current.rz + (x * 0.1), 
      0.06
    );

    // Lerp scale
    const targetScale = targets.current.scale;
    groupRef.current.scale.setScalar(
      THREE.MathUtils.lerp(groupRef.current.scale.x, targetScale, 0.06)
    );
  });

  return (
    <group 
      ref={groupRef}
      onClick={(e) => {
        // Toggle interaction on click
        e.stopPropagation();
        setIsInteracting(prev => !prev);
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        setHovered(false);
      }}
    >
      <group ref={beeRef}>
        <primitive object={scene} />
      </group>
    </group>
  );
}

// Preload the GLTF
useGLTF.preload('/demon_bee_full_texture.glb');

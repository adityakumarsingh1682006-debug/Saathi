"use client";

import React, { useRef, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

function RotatingCore() {
  const meshRef = useRef<THREE.Mesh>(null!);
  const outerRingRef = useRef<THREE.Mesh>(null!);
  const innerRingRef = useRef<THREE.Mesh>(null!);

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.4;
      meshRef.current.rotation.x += delta * 0.2;
    }
    if (outerRingRef.current) {
      outerRingRef.current.rotation.z += delta * 0.25;
      outerRingRef.current.rotation.x += delta * 0.15;
    }
    if (innerRingRef.current) {
      innerRingRef.current.rotation.y -= delta * 0.35;
      innerRingRef.current.rotation.z += delta * 0.2;
    }
  });

  return (
    <group scale={0.78}>
      {/* Central Identity Polyhedron */}
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[0.85, 1]} />
        <meshStandardMaterial
          color="#38bdf8"
          roughness={0.2}
          metalness={0.8}
          wireframe={true}
          emissive="#0284c7"
          emissiveIntensity={0.6}
        />
      </mesh>

      {/* Internal glowing health core */}
      <mesh>
        <sphereGeometry args={[0.42, 32, 32]} />
        <meshStandardMaterial
          color="#6366f1"
          roughness={0.1}
          metalness={0.9}
          emissive="#4f46e5"
          emissiveIntensity={1.0}
        />
      </mesh>

      {/* Cryptographic Orbit Ring 1 */}
      <mesh ref={outerRingRef}>
        <torusGeometry args={[1.3, 0.018, 16, 80]} />
        <meshStandardMaterial
          color="#38bdf8"
          emissive="#38bdf8"
          emissiveIntensity={1.2}
          roughness={0.1}
        />
      </mesh>

      {/* Cryptographic Orbit Ring 2 */}
      <mesh ref={innerRingRef} rotation={[Math.PI / 3, Math.PI / 4, 0]}>
        <torusGeometry args={[1.1, 0.018, 16, 80]} />
        <meshStandardMaterial
          color="#a855f7"
          emissive="#a855f7"
          emissiveIntensity={1.2}
          roughness={0.1}
        />
      </mesh>
    </group>
  );
}

export function HealthIdentityShield3D({ className }: { className?: string }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className={`flex items-center justify-center ${className || "w-full h-44"}`}>
        <div className="w-28 h-28 rounded-full border border-cyan-500/30 bg-cyan-500/10 animate-pulse flex items-center justify-center">
          <div className="w-16 h-16 rounded-full border border-purple-500/40 bg-purple-500/20" />
        </div>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden pointer-events-none select-none ${className || "w-full h-48"}`}>
      <Canvas
        camera={{ position: [0, 0, 3.4], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.9} />
        <pointLight position={[6, 6, 6]} intensity={1.6} color="#38bdf8" />
        <pointLight position={[-6, -6, -6]} intensity={1.3} color="#a855f7" />
        <RotatingCore />
      </Canvas>
    </div>
  );
}

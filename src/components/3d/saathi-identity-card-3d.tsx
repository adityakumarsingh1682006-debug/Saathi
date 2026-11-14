"use client";

import React, { useRef, useState, useEffect, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { ShieldCheck, Sparkles, QrCode } from "lucide-react";

/**
 * Creates a high-resolution 2D canvas texture for the FRONT face of the 3D Identity Card.
 * Uses the authentic MediKey palette: Warm Ivory, Deep Teal, Sage, Pale Mint, Deep Charcoal.
 */
function createFrontTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 648;
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    return new THREE.CanvasTexture(canvas);
  }

  // 1. Base Background: Warm Ivory with subtle gradient
  const bgGrad = ctx.createLinearGradient(0, 0, 1024, 648);
  bgGrad.addColorStop(0, "#FAFDFB");
  bgGrad.addColorStop(0.5, "#F7FAF8");
  bgGrad.addColorStop(1, "#EBF5F1");
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, 1024, 648);

  // 2. Subtle medical curves & waves (Watermark)
  ctx.save();
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = "rgba(123, 174, 157, 0.22)";
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    ctx.moveTo(-50, 200 + i * 40);
    ctx.bezierCurveTo(300, 100 + i * 35, 600, 360 + i * 25, 1100, 220 + i * 30);
    ctx.stroke();
  }
  ctx.restore();

  // Subtle circular watermark
  ctx.save();
  ctx.strokeStyle = "rgba(23, 107, 103, 0.08)";
  ctx.lineWidth = 32;
  ctx.beginPath();
  ctx.arc(880, 500, 240, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  // 3. Inset Rounded Card Border
  ctx.save();
  ctx.strokeStyle = "rgba(123, 174, 157, 0.4)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.roundRect(16, 16, 1024 - 32, 648 - 32, 32);
  ctx.stroke();
  ctx.restore();

  // 4. TOP LEFT: SAATHI Logo & Branding
  // Shield emblem icon
  ctx.save();
  ctx.translate(56, 56);
  ctx.fillStyle = "#176B67";
  ctx.beginPath();
  // Hexagonal shield
  ctx.moveTo(32, 0);
  ctx.lineTo(60, 16);
  ctx.lineTo(60, 48);
  ctx.lineTo(32, 64);
  ctx.lineTo(4, 48);
  ctx.lineTo(4, 16);
  ctx.closePath();
  ctx.fill();

  // White medical cross inside shield
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(27, 18, 10, 28);
  ctx.fillRect(18, 27, 28, 10);
  ctx.restore();

  // SAATHI text
  ctx.fillStyle = "#19302F";
  ctx.font = "bold 44px -apple-system, BlinkMacSystemFont, 'Geist', 'Segoe UI', Roboto, sans-serif";
  ctx.fillText("SAATHI", 136, 96);

  // Subtitle
  ctx.fillStyle = "#667A78";
  ctx.font = "600 16px -apple-system, BlinkMacSystemFont, 'Geist', 'Segoe UI', Roboto, sans-serif";
  ctx.letterSpacing = "2px";
  ctx.fillText("SOVEREIGN HEALTH IDENTITY", 138, 122);
  ctx.letterSpacing = "0px";

  // 5. TOP RIGHT: Metallic EMV Biometric Smart Chip
  ctx.save();
  const chipX = 840;
  const chipY = 60;
  const chipW = 124;
  const chipH = 92;

  // Chip base gradient
  const chipGrad = ctx.createLinearGradient(chipX, chipY, chipX + chipW, chipY + chipH);
  chipGrad.addColorStop(0, "#F7D774");
  chipGrad.addColorStop(0.35, "#D8A33E");
  chipGrad.addColorStop(0.7, "#FBE79A");
  chipGrad.addColorStop(1, "#C9912C");
  ctx.fillStyle = chipGrad;
  ctx.beginPath();
  ctx.roundRect(chipX, chipY, chipW, chipH, 12);
  ctx.fill();

  ctx.strokeStyle = "#8C6116";
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Chip contact etching lines
  ctx.strokeStyle = "rgba(110, 75, 14, 0.75)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  // Central division
  ctx.moveTo(chipX + chipW * 0.45, chipY);
  ctx.lineTo(chipX + chipW * 0.45, chipY + chipH);
  // Horizontal splits
  ctx.moveTo(chipX, chipY + chipH * 0.35);
  ctx.lineTo(chipX + chipW * 0.45, chipY + chipH * 0.35);
  ctx.moveTo(chipX, chipY + chipH * 0.65);
  ctx.lineTo(chipX + chipW * 0.45, chipY + chipH * 0.65);
  ctx.moveTo(chipX + chipW * 0.45, chipY + chipH * 0.5);
  ctx.lineTo(chipX + chipW, chipY + chipH * 0.5);
  ctx.stroke();
  ctx.restore();

  // 6. BADGES: Verified & Blood Group
  // Verified Status Pill
  ctx.save();
  ctx.fillStyle = "#E6F3EF";
  ctx.beginPath();
  ctx.roundRect(56, 172, 170, 36, 18);
  ctx.fill();
  ctx.strokeStyle = "rgba(123, 174, 157, 0.5)";
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Green check dot
  ctx.fillStyle = "#176B67";
  ctx.beginPath();
  ctx.arc(76, 190, 6, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#176B67";
  ctx.font = "bold 15px -apple-system, BlinkMacSystemFont, sans-serif";
  ctx.fillText("DID VERIFIED", 92, 195);
  ctx.restore();

  // Blood Group Pill
  ctx.save();
  ctx.fillStyle = "#E6F3EF";
  ctx.beginPath();
  ctx.roundRect(242, 172, 140, 36, 18);
  ctx.fill();
  ctx.strokeStyle = "rgba(123, 174, 157, 0.5)";
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.fillStyle = "#176B67";
  ctx.font = "bold 15px -apple-system, BlinkMacSystemFont, sans-serif";
  ctx.fillText("BLOOD: O+", 258, 195);
  ctx.restore();

  // 7. PATIENT DETAILS (Demo Citizen)
  ctx.fillStyle = "#667A78";
  ctx.font = "600 14px -apple-system, BlinkMacSystemFont, sans-serif";
  ctx.fillText("PATIENT IDENTITY (DEMO)", 58, 268);

  // Patient Name
  ctx.fillStyle = "#19302F";
  ctx.font = "bold 44px -apple-system, BlinkMacSystemFont, 'Geist', sans-serif";
  ctx.fillText("Aarav Sharma", 56, 320);

  // DID String
  ctx.fillStyle = "#176B67";
  ctx.font = "bold 20px ui-monospace, SFMono-Regular, Menlo, monospace";
  ctx.fillText("did:saathi:sep:0x892a...c4b1", 58, 362);

  // ABHA ID
  ctx.fillStyle = "#667A78";
  ctx.font = "600 17px ui-monospace, SFMono-Regular, Menlo, monospace";
  ctx.fillText("ABHA ID: 91-8273-1940-5821", 58, 396);

  // 8. Heartbeat Pulse Line
  ctx.save();
  ctx.strokeStyle = "#7BAE9D";
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(56, 470);
  ctx.lineTo(240, 470);
  ctx.lineTo(260, 450);
  ctx.lineTo(275, 490);
  ctx.lineTo(295, 420);
  ctx.lineTo(315, 500);
  ctx.lineTo(330, 465);
  ctx.lineTo(345, 470);
  ctx.lineTo(520, 470);
  ctx.stroke();
  ctx.restore();

  // 9. Card Footer / Enclave Notice
  ctx.save();
  // Bottom subtle strip
  ctx.fillStyle = "rgba(230, 243, 239, 0.7)";
  ctx.beginPath();
  ctx.roundRect(32, 530, 1024 - 64, 76, 20);
  ctx.fill();
  ctx.strokeStyle = "rgba(123, 174, 157, 0.3)";
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.fillStyle = "#19302F";
  ctx.font = "bold 15px -apple-system, BlinkMacSystemFont, sans-serif";
  ctx.fillText("PATIENT-HELD DECENTRALIZED DATA ENCLAVE", 58, 564);

  ctx.fillStyle = "#667A78";
  ctx.font = "500 13px -apple-system, BlinkMacSystemFont, sans-serif";
  ctx.fillText("Decoupled from centralized hospital silos • EIP-712 Smart Contract Consent", 58, 588);

  // Small shield icon on bottom right
  ctx.fillStyle = "#176B67";
  ctx.font = "bold 13px ui-monospace, monospace";
  ctx.fillText("ERC-1056 / W3C", 840, 574);
  ctx.restore();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  return texture;
}

/**
 * Creates a high-resolution 2D canvas texture for the BACK face of the 3D Identity Card.
 * Contains scannable QR code, Sepolia anchor details, security seal, and emergency break-glass status.
 */
function createBackTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 648;
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    return new THREE.CanvasTexture(canvas);
  }

  // 1. Base Background: Warm Ivory
  const bgGrad = ctx.createLinearGradient(0, 0, 1024, 648);
  bgGrad.addColorStop(0, "#F7FAF8");
  bgGrad.addColorStop(1, "#EBF4F0");
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, 1024, 648);

  // 2. Magnetic / Holographic Security Ribbon across top
  const ribbonGrad = ctx.createLinearGradient(0, 36, 1024, 116);
  ribbonGrad.addColorStop(0, "#19302F");
  ribbonGrad.addColorStop(0.3, "#176B67");
  ribbonGrad.addColorStop(0.6, "#7BAE9D");
  ribbonGrad.addColorStop(1, "#19302F");
  ctx.fillStyle = ribbonGrad;
  ctx.fillRect(0, 36, 1024, 88);

  // Security ribbon microprint
  ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
  ctx.font = "bold 14px ui-monospace, SFMono-Regular, monospace";
  ctx.letterSpacing = "2px";
  ctx.fillText("SAATHI SOVEREIGN HEALTH PASS • ETHEREUM SEPOLIA • DID:SAATHI:IND-7849-2024", 48, 86);
  ctx.letterSpacing = "0px";

  // Inset rounded border
  ctx.strokeStyle = "rgba(123, 174, 157, 0.35)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.roundRect(16, 16, 1024 - 32, 648 - 32, 32);
  ctx.stroke();

  // 3. LEFT: High-Contrast QR Code White Platter
  const qrX = 58;
  const qrY = 160;
  const qrSize = 310;

  ctx.save();
  ctx.fillStyle = "#FFFFFF";
  ctx.shadowColor = "rgba(23, 107, 103, 0.12)";
  ctx.shadowBlur = 18;
  ctx.shadowOffsetY = 6;
  ctx.beginPath();
  ctx.roundRect(qrX, qrY, qrSize, qrSize, 24);
  ctx.fill();
  ctx.restore();

  ctx.strokeStyle = "rgba(123, 174, 157, 0.4)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(qrX, qrY, qrSize, qrSize, 24);
  ctx.stroke();

  // Draw simulated QR Matrix pattern
  ctx.fillStyle = "#19302F";
  const innerMargin = 30;
  const matrixSize = qrSize - innerMargin * 2;
  const cols = 21;
  const cellSize = matrixSize / cols;

  // Corner Position Markers (Top-Left, Top-Right, Bottom-Left)
  const drawCorner = (cx: number, cy: number) => {
    ctx.fillStyle = "#176B67";
    ctx.fillRect(cx, cy, cellSize * 7, cellSize * 7);
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(cx + cellSize, cy + cellSize, cellSize * 5, cellSize * 5);
    ctx.fillStyle = "#176B67";
    ctx.fillRect(cx + cellSize * 2, cy + cellSize * 2, cellSize * 3, cellSize * 3);
  };

  drawCorner(qrX + innerMargin, qrY + innerMargin);
  drawCorner(qrX + innerMargin + cellSize * 14, qrY + innerMargin);
  drawCorner(qrX + innerMargin, qrY + innerMargin + cellSize * 14);

  // Deterministic aesthetic matrix dots
  ctx.fillStyle = "#19302F";
  const seedMatrix = [
    [0,0,0,0,0,0,0,0,1,0,1,1,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0],
    [1,0,1,1,0,1,0,0,0,1,1,0,1,0,1,0,1,1,0,1,0],
    [0,1,0,0,1,0,1,1,1,0,0,1,0,1,0,1,0,0,1,0,1],
    [1,1,0,1,0,1,0,1,0,1,0,1,1,0,1,0,1,1,0,1,0],
    [0,0,1,0,1,0,1,0,1,1,0,0,1,0,0,1,0,0,1,1,0],
    [1,0,1,1,0,0,1,1,0,1,1,0,1,0,1,1,0,1,0,0,1],
  ];

  for (let r = 8; r < 13; r++) {
    for (let c = 0; c < cols; c++) {
      const rowPat = seedMatrix[(r - 8) % seedMatrix.length];
      if (rowPat[c % rowPat.length] === 1) {
        ctx.fillRect(
          qrX + innerMargin + c * cellSize,
          qrY + innerMargin + r * cellSize,
          cellSize - 1,
          cellSize - 1
        );
      }
    }
  }

  // QR Label below
  ctx.fillStyle = "#176B67";
  ctx.font = "bold 13px -apple-system, BlinkMacSystemFont, sans-serif";
  ctx.fillText("SCAN WITH PROVIDER TERMINAL", 82, 505);

  // 4. RIGHT: Verification Specifications & Cryptographic Guarantees
  const rightX = 410;
  ctx.fillStyle = "#19302F";
  ctx.font = "bold 26px -apple-system, BlinkMacSystemFont, 'Geist', sans-serif";
  ctx.fillText("VERIFICATION SPECIFICATIONS", rightX, 192);

  ctx.fillStyle = "#667A78";
  ctx.font = "500 15px -apple-system, BlinkMacSystemFont, sans-serif";
  ctx.fillText("Decentralized healthcare identity backed by Ethereum Sepolia smart contracts.", rightX, 222);

  // Spec Items
  const specs = [
    { title: "Consensus Layer", val: "Ethereum Sepolia (Chain 11155111)" },
    { title: "Consent Standard", val: "EIP-712 Typed Structured Permits" },
    { title: "Record Integrity", val: "SHA-256 Client Cryptographic Hashes" },
    { title: "Emergency Access", val: "Break-Glass Protocol Accredited" },
    { title: "FHIR Interop", val: "ABHA Health Stack Compatible" },
  ];

  let specY = 270;
  specs.forEach((spec) => {
    // Bullet dot
    ctx.fillStyle = "#176B67";
    ctx.beginPath();
    ctx.arc(rightX + 6, specY - 5, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#667A78";
    ctx.font = "600 14px -apple-system, BlinkMacSystemFont, sans-serif";
    ctx.fillText(spec.title + ":", rightX + 22, specY);

    ctx.fillStyle = "#19302F";
    ctx.font = "bold 14px ui-monospace, SFMono-Regular, monospace";
    ctx.fillText(spec.val, rightX + 175, specY);

    specY += 38;
  });

  // Official Security Seal Badge
  ctx.save();
  const sealX = 890;
  const sealY = 475;
  ctx.strokeStyle = "#7BAE9D";
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(sealX, sealY, 44, 0, Math.PI * 2);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(sealX, sealY, 36, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = "#176B67";
  ctx.font = "bold 11px -apple-system, BlinkMacSystemFont, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("SEPOLIA", sealX, sealY - 6);
  ctx.fillText("VERIFIED", sealX, sealY + 12);
  ctx.restore();

  // Bottom Notice: Demo Disclaimer
  ctx.save();
  ctx.fillStyle = "rgba(201, 138, 40, 0.12)";
  ctx.beginPath();
  ctx.roundRect(rightX, 510, 540, 52, 14);
  ctx.fill();
  ctx.strokeStyle = "rgba(201, 138, 40, 0.35)";
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.fillStyle = "#C98A28";
  ctx.font = "bold 12px ui-monospace, monospace";
  ctx.fillText("NOTICE: DEMO DATASET ONLY — REAL PHI NEVER STORED ON-CHAIN", rightX + 18, 542);
  ctx.restore();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  // Flip UV horizontally so the back side reads naturally left-to-right when rotated 180°
  texture.wrapS = THREE.RepeatWrapping;
  texture.repeat.x = -1;
  texture.offset.x = 1;
  texture.anisotropy = 8;
  return texture;
}

/**
 * 3D Floating Identity Card Mesh with Realistic Lighting and Physics.
 */
function FloatingCard({ isReducedMotion }: { isReducedMotion: boolean }) {
  const cardGroupRef = useRef<THREE.Group>(null!);
  const [isHovered, setIsHovered] = useState(false);
  const targetRotationY = useRef(0.2);

  // Generate textures once
  const frontTexture = useMemo(() => createFrontTexture(), []);
  const backTexture = useMemo(() => createBackTexture(), []);

  // Card materials
  const materials = useMemo(() => {
    // Brushed metallic sage/silver edge
    const edgeMaterial = new THREE.MeshStandardMaterial({
      color: "#96BFB2",
      metalness: 0.85,
      roughness: 0.18,
    });

    const frontMaterial = new THREE.MeshStandardMaterial({
      map: frontTexture,
      roughness: 0.28,
      metalness: 0.12,
    });

    const backMaterial = new THREE.MeshStandardMaterial({
      map: backTexture,
      roughness: 0.28,
      metalness: 0.12,
    });

    // BoxGeometry face material order: +x, -x, +y, -y, +z (front), -z (back)
    return [
      edgeMaterial,
      edgeMaterial,
      edgeMaterial,
      edgeMaterial,
      frontMaterial,
      backMaterial,
    ];
  }, [frontTexture, backTexture]);

  useFrame((state, delta) => {
    if (!cardGroupRef.current) return;

    if (isReducedMotion) {
      // Static gentle isometric angle for accessibility
      cardGroupRef.current.rotation.y = 0.25;
      cardGroupRef.current.rotation.x = 0.05;
      cardGroupRef.current.position.y = 0;
      return;
    }

    // 1. Slow, majestic 360-degree rotation.
    // When hovered, slows down significantly so user can inspect both sides easily.
    const rotationSpeed = isHovered ? 0.08 : 0.38;
    targetRotationY.current += delta * rotationSpeed;

    // 2. Subtle organic floating movement (bobbing)
    const elapsedTime = state.clock.getElapsedTime();
    const floatY = Math.sin(elapsedTime * 1.2) * 0.06;
    cardGroupRef.current.position.y = floatY;

    // 3. Smooth mouse tilt responsiveness
    const tiltX = -state.pointer.y * 0.16;
    const tiltZ = state.pointer.x * 0.08;

    cardGroupRef.current.rotation.y = THREE.MathUtils.lerp(
      cardGroupRef.current.rotation.y,
      targetRotationY.current,
      0.1
    );
    cardGroupRef.current.rotation.x = THREE.MathUtils.lerp(
      cardGroupRef.current.rotation.x,
      tiltX,
      0.08
    );
    cardGroupRef.current.rotation.z = THREE.MathUtils.lerp(
      cardGroupRef.current.rotation.z,
      tiltZ,
      0.08
    );
  });

  return (
    <group
      ref={cardGroupRef}
      onPointerOver={() => setIsHovered(true)}
      onPointerOut={() => setIsHovered(false)}
      scale={0.92}
    >
      {/* 3D Smart Card Geometry */}
      <mesh material={materials} castShadow receiveShadow>
        <boxGeometry args={[3.32, 2.1, 0.05]} />
      </mesh>

      {/* Soft Contact Shadow underneath the card */}
      <mesh position={[0, -1.35, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[3.2, 1.4]} />
        <meshBasicMaterial
          color="#176B67"
          transparent={true}
          opacity={0.08}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

/**
 * Main SaathiIdentityCard3D Component.
 * Embedded directly in the Welcome / Hero section.
 */
export function SaathiIdentityCard3D({ className }: { className?: string }) {
  const [mounted, setMounted] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    setMounted(true);
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  // Static Fallback for SSR or non-WebGL environments
  if (!mounted) {
    return (
      <div className={`flex items-center justify-center p-4 ${className || "w-full h-80 sm:h-96"}`}>
        <div className="w-full max-w-sm aspect-[1.586/1] rounded-2xl bg-white border border-[#7BAE9D]/30 shadow-lg p-5 flex flex-col justify-between animate-pulse">
          <div className="flex items-center justify-between">
            <div className="w-24 h-6 rounded bg-[#E6F3EF]" />
            <div className="w-10 h-7 rounded bg-amber-200" />
          </div>
          <div className="space-y-2">
            <div className="w-36 h-5 rounded bg-slate-200" />
            <div className="w-48 h-3 rounded bg-slate-100" />
          </div>
          <div className="w-full h-6 rounded bg-[#E6F3EF]" />
        </div>
      </div>
    );
  }

  return (
    <div className={`relative flex flex-col items-center justify-center select-none ${className || "w-full h-80 sm:h-96"}`}>
      {/* Ambient background glow behind the 3D card */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <div className="w-72 h-52 rounded-full bg-gradient-to-tr from-[#7BAE9D]/20 via-[#176B67]/12 to-[#E6F3EF]/60 blur-3xl opacity-80" />
      </div>

      <Canvas
        camera={{ position: [0, 0, 3.65], fov: 42 }}
        gl={{ antialias: true, alpha: true }}
        className="w-full h-full cursor-grab active:cursor-grabbing"
      >
        {/* Soft, realistic natural lighting matching the MediKey palette */}
        <ambientLight intensity={1.3} color="#FFFFFF" />
        
        {/* Key Directional Light */}
        <directionalLight
          position={[5, 8, 6]}
          intensity={1.6}
          color="#FFFDF8"
        />

        {/* Fill Light for subtle sage reflections */}
        <directionalLight
          position={[-6, -4, 4]}
          intensity={0.65}
          color="#E6F3EF"
        />

        {/* Top Rim Light for metallic specular sheen */}
        <pointLight
          position={[0, 4, 3]}
          intensity={0.8}
          color="#FFFFFF"
        />

        <FloatingCard isReducedMotion={reducedMotion} />
      </Canvas>

      {/* Interactive Helper Cue */}
      <div className="absolute bottom-2 flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 border border-[#7BAE9D]/30 backdrop-blur-md text-[11px] font-semibold text-[#176B67] shadow-xs pointer-events-none">
        <Sparkles className="w-3 h-3 text-[#176B67]" />
        <span>Hover to slow rotation & inspect front / back</span>
      </div>
    </div>
  );
}

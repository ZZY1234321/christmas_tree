import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface BowProps {
  position: [number, number, number];
  color?: string;
  isFormed: boolean;
}

export const Bow = ({ position, color = '#FF1493', isFormed }: BowProps) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    
    // 轻微的浮动和旋转
    if (isFormed) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
      groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 1.5) * 0.1;
    }
  });

  return (
    <group ref={groupRef} position={position} scale={isFormed ? 1 : 0}>
      {/* 主蝴蝶结 - 使用简化的盒子形状 */}
      <mesh rotation={[0, 0, Math.PI / 4]}>
        <boxGeometry args={[0.6, 0.4, 0.1]} />
        <meshStandardMaterial 
          color={color} 
          metalness={0.8} 
          roughness={0.2}
          emissive={color}
          emissiveIntensity={0.3}
        />
      </mesh>
      {/* 中心装饰 */}
      <mesh position={[0, 0, 0.06]}>
        <boxGeometry args={[0.15, 0.15, 0.1]} />
        <meshStandardMaterial 
          color="#8A2BE2" 
          metalness={0.9} 
          roughness={0.1}
        />
      </mesh>
    </group>
  );
};


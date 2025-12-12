import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface TreeStarProps {
  position: [number, number, number];
  isFormed: boolean;
}

export const TreeStar = ({ position, isFormed }: TreeStarProps) => {
  const groupRef = useRef<THREE.Group>(null);
  const lightRef = useRef<THREE.PointLight>(null);

  useFrame((state) => {
    if (!groupRef.current || !lightRef.current) return;
    
    if (isFormed) {
      // 旋转星芒
      groupRef.current.rotation.z = state.clock.elapsedTime * 0.3;
      
      // 闪烁光效
      const pulse = Math.sin(state.clock.elapsedTime * 3) * 0.3 + 0.7;
      lightRef.current.intensity = 2 * pulse;
      lightRef.current.distance = 15 + pulse * 5;
    }
  });

  // 创建星芒形状（五角星）
  const starShape = useMemo(() => {
    const shape = new THREE.Shape();
    const outerRadius = 0.5;
    const innerRadius = 0.25;
    const spikes = 5;
    
    for (let i = 0; i < spikes * 2; i++) {
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const angle = (i * Math.PI) / spikes;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      
      if (i === 0) {
        shape.moveTo(x, y);
      } else {
        shape.lineTo(x, y);
      }
    }
    shape.closePath();
    return shape;
  }, []);

  return (
    <group ref={groupRef} position={position} scale={isFormed ? 1 : 0}>
      {/* 星芒主体 - 使用多个锥体组成星形 */}
      <group>
        {Array.from({ length: 5 }).map((_, i) => {
          const angle = (i / 5) * Math.PI * 2;
          return (
            <mesh
              key={i}
              position={[Math.cos(angle) * 0.3, Math.sin(angle) * 0.3, 0]}
              rotation={[0, 0, angle]}
            >
              <coneGeometry args={[0.15, 0.5, 3]} />
              <meshStandardMaterial 
                color="#FFD700" 
                metalness={0.9} 
                roughness={0.1}
                emissive="#FFD700"
                emissiveIntensity={1.5}
              />
            </mesh>
          );
        })}
        {/* 中心圆盘 */}
        <mesh>
          <cylinderGeometry args={[0.2, 0.2, 0.1, 16]} />
          <meshStandardMaterial 
            color="#FFD700" 
            metalness={0.9} 
            roughness={0.1}
            emissive="#FFD700"
            emissiveIntensity={1.5}
          />
        </mesh>
      </group>
      
      {/* 发光点光源 */}
      <pointLight
        ref={lightRef}
        color="#FFD700"
        intensity={2}
        distance={20}
        decay={2}
      />
      
      {/* 光晕效果（使用多个小星星） */}
      {Array.from({ length: 8 }).map((_, i) => {
        const angle = (i / 8) * Math.PI * 2;
        const radius = 0.8;
        return (
          <mesh
            key={i}
            position={[Math.cos(angle) * radius, Math.sin(angle) * radius, 0.1]}
            scale={0.3}
          >
            <sphereGeometry args={[0.1, 8, 8]} />
            <meshBasicMaterial 
              color="#FFD700" 
              transparent 
              opacity={0.6}
            />
          </mesh>
        );
      })}
    </group>
  );
};


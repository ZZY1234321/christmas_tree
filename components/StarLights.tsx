import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface StarLightProps {
  count?: number;
}

export const StarLights = ({ count = 50 }: StarLightProps) => {
  const lightsRef = useRef<THREE.Group>(null);
  
  // 生成星星位置
  const positions = Array.from({ length: count }, () => ({
    position: new THREE.Vector3(
      (Math.random() - 0.5) * 30,
      Math.random() * 20 + 5,
      (Math.random() - 0.5) * 30
    ),
    twinkleSpeed: 0.5 + Math.random() * 2,
    twinklePhase: Math.random() * Math.PI * 2,
    intensity: 0.3 + Math.random() * 0.7,
  }));

  useFrame((state) => {
    if (!lightsRef.current) return;
    
    positions.forEach((star, i) => {
      const light = lightsRef.current!.children[i] as THREE.PointLight;
      if (light) {
        // 闪烁效果：使用正弦波
        const twinkle = Math.sin(state.clock.elapsedTime * star.twinkleSpeed + star.twinklePhase) * 0.5 + 0.5;
        light.intensity = star.intensity * (0.2 + twinkle * 0.8);
        light.distance = 5 + twinkle * 3;
      }
    });
  });

  return (
    <group ref={lightsRef}>
      {positions.map((star, i) => (
        <pointLight
          key={i}
          position={star.position}
          color="#8A2BE2"
          intensity={star.intensity}
          distance={8}
          decay={2}
        />
      ))}
    </group>
  );
};


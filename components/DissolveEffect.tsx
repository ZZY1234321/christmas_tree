import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface DissolveEffectProps {
  mousePosition: THREE.Vector3 | null;
  treePositions: Float32Array;
  count: number;
}

export const DissolveEffect = ({ mousePosition, treePositions, count }: DissolveEffectProps) => {
  const particlesRef = useRef<THREE.Points>(null);
  const velocitiesRef = useRef<Float32Array>(new Float32Array(count * 3));
  const activeRef = useRef<boolean[]>(new Array(count).fill(false));
  const lifetimesRef = useRef<Float32Array>(new Float32Array(count).fill(0));

  // 初始化粒子速度
  useMemo(() => {
    for (let i = 0; i < count; i++) {
      velocitiesRef.current[i * 3] = 0;
      velocitiesRef.current[i * 3 + 1] = 0;
      velocitiesRef.current[i * 3 + 2] = 0;
    }
  }, [count]);

  useFrame((_state, delta) => {
    if (!particlesRef.current || !mousePosition) return;

    const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
    const mouseThreshold = 2.0; // 影响范围

    for (let i = 0; i < count; i++) {
      const idx = i * 3;
      const particlePos = new THREE.Vector3(
        positions[idx],
        positions[idx + 1],
        positions[idx + 2]
      );

      const distance = particlePos.distanceTo(mousePosition);

      if (distance < mouseThreshold) {
        // 激活粒子，让它飞散
        if (!activeRef.current[i]) {
          activeRef.current[i] = true;
          lifetimesRef.current[i] = 1.0;
          
          // 计算从鼠标位置到粒子的方向
          const direction = new THREE.Vector3()
            .subVectors(particlePos, mousePosition)
            .normalize();
          
          // 添加随机性
          direction.x += (Math.random() - 0.5) * 0.5;
          direction.y += (Math.random() - 0.5) * 0.5;
          direction.z += (Math.random() - 0.5) * 0.5;
          direction.normalize();
          
          // 设置速度（飞得更远）
          const speed = 5 + Math.random() * 10;
          velocitiesRef.current[idx] = direction.x * speed;
          velocitiesRef.current[idx + 1] = direction.y * speed;
          velocitiesRef.current[idx + 2] = direction.z * speed;
        }
      }

      // 更新激活的粒子
      if (activeRef.current[i] && lifetimesRef.current[i] > 0) {
        // 应用速度
        positions[idx] += velocitiesRef.current[idx] * delta;
        positions[idx + 1] += velocitiesRef.current[idx + 1] * delta;
        positions[idx + 2] += velocitiesRef.current[idx + 2] * delta;

        // 衰减速度（空气阻力）
        velocitiesRef.current[idx] *= 0.95;
        velocitiesRef.current[idx + 1] *= 0.95;
        velocitiesRef.current[idx + 2] *= 0.95;

        // 减少生命周期
        lifetimesRef.current[i] -= delta * 0.5;

        // 如果生命周期结束，重置粒子
        if (lifetimesRef.current[i] <= 0) {
          activeRef.current[i] = false;
          // 重置到原始位置
          positions[idx] = treePositions[idx];
          positions[idx + 1] = treePositions[idx + 1];
          positions[idx + 2] = treePositions[idx + 2];
          velocitiesRef.current[idx] = 0;
          velocitiesRef.current[idx + 1] = 0;
          velocitiesRef.current[idx + 2] = 0;
        }
      }
    }

    particlesRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={new Float32Array(treePositions)}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#8A2BE2"
        size={0.1}
        transparent
        opacity={0.8}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};


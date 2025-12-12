import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { getTreePosition, getChaosPosition } from '../utils/math';

const foliageMaterial = new THREE.ShaderMaterial({
  uniforms: {
    uTime: { value: 0 },
    uProgress: { value: 0 }, // 0 = Chaos, 1 = Tree
    uColorHigh: { value: new THREE.Color('#8A2BE2') }, // 高光金色
    uColorLow: { value: new THREE.Color('#004225') },  // 深祖母绿
  },
  vertexShader: `
    uniform float uProgress;
    uniform float uTime;
    attribute vec3 aChaosPos;
    attribute vec3 aTargetPos;
    attribute float aRandom;
    varying vec3 vColor;
    
    // 简单的缓动函数
    float cubicInOut(float t) {
      return t < 0.5
        ? 4.0 * t * t * t
        : 1.0 - pow(-2.0 * t + 2.0, 3.0) / 2.0;
    }

    void main() {
      float t = cubicInOut(uProgress);
      
      // 核心：双坐标插值
      vec3 pos = mix(aChaosPos, aTargetPos, t);
      
      // 添加微小的自然摆动，模拟松针在风中的感觉
      pos.y += sin(uTime * 1.2 + aRandom * 10.0) * 0.02;
      pos.x += sin(uTime * 1.0 + aRandom * 8.0) * 0.015;
      pos.z += cos(uTime * 1.1 + aRandom * 9.0) * 0.015;

      vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
      // 粒子大小 - 让树看起来更饱满
      gl_PointSize = (3.5 * (0.8 + t * 0.4)) * (10.0 / -mvPosition.z);
      gl_Position = projectionMatrix * mvPosition;
      
      // 颜色混合逻辑
      vColor = vec3(aRandom); 
    }
  `,
  fragmentShader: `
    uniform vec3 uColorHigh;
    uniform vec3 uColorLow;
    varying vec3 vColor;
    
    void main() {
      // 圆形粒子
      float r = distance(gl_PointCoord, vec2(0.5));
      if (r > 0.5) discard;
      
      // 奢华的渐变光晕
      float glow = 1.0 - (r * 2.0);
      glow = pow(glow, 1.5);
      
      vec3 finalColor = mix(uColorLow, uColorHigh, vColor.x * glow);
      gl_FragColor = vec4(finalColor, 1.0);
    }
  `,
  transparent: true,
  depthWrite: false,
  blending: THREE.AdditiveBlending,
});

interface LuxuryFoliageProps {
  count?: number;
  isFormed: boolean;
  mousePosition?: THREE.Vector3 | null;
}

export const LuxuryFoliage = ({ count = 30000, isFormed, mousePosition = null }: LuxuryFoliageProps) => {
  const meshRef = useRef<THREE.Points>(null);
  const velocitiesRef = useRef<Float32Array>(new Float32Array(count * 3));
  const activeRef = useRef<boolean[]>(new Array(count).fill(false));
  const lifetimesRef = useRef<Float32Array>(new Float32Array(count).fill(0));
  const targetPositionsRef = useRef<Float32Array | null>(null);
  
  // 生成双坐标数据
  const [geoAttributes] = useMemo(() => {
    const chaos = new Float32Array(count * 3);
    const target = new Float32Array(count * 3);
    const randoms = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const cPos = getChaosPosition(30); // 混沌半径增大，让粒子飞得更远
      const tPos = getTreePosition(i, count, 6, 14); // 树半径6，高14

      chaos.set([cPos.x, cPos.y, cPos.z], i * 3);
      target.set([tPos.x, tPos.y, tPos.z], i * 3);
      randoms[i] = Math.random();
    }
    targetPositionsRef.current = target;
    return [{ chaos, target, randoms }];
  }, [count]);

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    const uniforms = (meshRef.current.material as THREE.ShaderMaterial).uniforms;
    const geometry = meshRef.current.geometry;
    const positions = geometry.attributes.position.array as Float32Array;
    
    uniforms.uTime.value = state.clock.elapsedTime;
    
    // 平滑插值进度
    const targetProgress = isFormed ? 1 : 0;
    uniforms.uProgress.value = THREE.MathUtils.lerp(
      uniforms.uProgress.value, 
      targetProgress, 
      delta * 1.5 // 慢速优雅的变形
    );

    // 鼠标交互：颗粒消散效果
    if (mousePosition && isFormed) {
      const mouseThreshold = 2.5;
      
      for (let i = 0; i < count; i++) {
        const idx = i * 3;
        const particlePos = new THREE.Vector3(
          positions[idx],
          positions[idx + 1],
          positions[idx + 2]
        );

        const distance = particlePos.distanceTo(mousePosition);

        if (distance < mouseThreshold) {
          if (!activeRef.current[i]) {
            activeRef.current[i] = true;
            lifetimesRef.current[i] = 1.5;
            
            const direction = new THREE.Vector3()
              .subVectors(particlePos, mousePosition)
              .normalize();
            
            direction.x += (Math.random() - 0.5) * 0.6;
            direction.y += (Math.random() - 0.5) * 0.6;
            direction.z += (Math.random() - 0.5) * 0.6;
            direction.normalize();
            
            const speed = 8 + Math.random() * 12; // 飞得更远
            velocitiesRef.current[idx] = direction.x * speed;
            velocitiesRef.current[idx + 1] = direction.y * speed;
            velocitiesRef.current[idx + 2] = direction.z * speed;
          }
        }

        if (activeRef.current[i] && lifetimesRef.current[i] > 0) {
          positions[idx] += velocitiesRef.current[idx] * delta;
          positions[idx + 1] += velocitiesRef.current[idx + 1] * delta;
          positions[idx + 2] += velocitiesRef.current[idx + 2] * delta;

          velocitiesRef.current[idx] *= 0.92;
          velocitiesRef.current[idx + 1] *= 0.92;
          velocitiesRef.current[idx + 2] *= 0.92;

          lifetimesRef.current[i] -= delta * 0.4;

          if (lifetimesRef.current[i] <= 0) {
            activeRef.current[i] = false;
            // 重置到目标位置（树形）
            if (targetPositionsRef.current) {
              positions[idx] = targetPositionsRef.current[idx];
              positions[idx + 1] = targetPositionsRef.current[idx + 1];
              positions[idx + 2] = targetPositionsRef.current[idx + 2];
            }
            velocitiesRef.current[idx] = 0;
            velocitiesRef.current[idx + 1] = 0;
            velocitiesRef.current[idx + 2] = 0;
          }
        }
      }
      
      geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <points ref={meshRef} material={foliageMaterial}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={geoAttributes.target} itemSize={3} />
        <bufferAttribute attach="attributes-aTargetPos" count={count} array={geoAttributes.target} itemSize={3} />
        <bufferAttribute attach="attributes-aChaosPos" count={count} array={geoAttributes.chaos} itemSize={3} />
        <bufferAttribute attach="attributes-aRandom" count={count} array={geoAttributes.randoms} itemSize={1} />
      </bufferGeometry>
    </points>
  );
};
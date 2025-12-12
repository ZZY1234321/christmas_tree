import { useRef, useMemo, useLayoutEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { getOrnamentPosition, getChaosPosition } from '../utils/math';

type OrnamentType = 'heavy' | 'medium' | 'light';

interface OrnamentProps {
  count: number;
  type: OrnamentType;
  color: string;
  isFormed: boolean;
  geometry: THREE.BufferGeometry;
  metalness?: number;
  roughness?: number;
  transparent?: boolean;
  opacity?: number;
}

const dummy = new THREE.Object3D();

export const Ornaments = ({ 
  count, 
  type, 
  color, 
  isFormed, 
  geometry,
  metalness,
  roughness,
  transparent = false,
  opacity = 1
}: OrnamentProps) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  
  // 物理配置：不同权重的装饰物 - 更小更精致
  const config = useMemo(() => {
    switch(type) {
      case 'heavy': return { scale: 0.15, speed: 1.0 }; // 礼物盒：小而慢
      case 'medium': return { scale: 0.12, speed: 2.0 }; // 彩球：小而中速
      case 'light': return { scale: 0.1, speed: 4.0 }; // 灯光：极小而快
    }
  }, [type]);

  // 数据准备 - 使用装饰物专用分布，底部更密集
  const data = useMemo(() => {
    return new Array(count).fill(0).map((_, i) => ({
      chaosPos: getChaosPosition(20), // 散得更开
      targetPos: getOrnamentPosition(i, count, 5.5, 13), // 使用装饰物专用分布，底部更密集
      currentPos: new THREE.Vector3(),
      rotationSpeed: (Math.random() - 0.5) * 0.001, // 更慢更平滑的旋转
      rotationAxis: new THREE.Vector3(
        Math.random() - 0.5,
        Math.random() - 0.5,
        Math.random() - 0.5
      ).normalize(), // 随机旋转轴，让旋转更自然
    }));
  }, [count]);

  // 初始化位置
  useLayoutEffect(() => {
    data.forEach((d, i) => {
      d.currentPos.copy(d.chaosPos);
      dummy.position.copy(d.chaosPos);
      dummy.updateMatrix();
      meshRef.current?.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current!.instanceMatrix.needsUpdate = true;
  }, [data]);

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    
    data.forEach((d, i) => {
      // 1. 计算目标点
      const target = isFormed ? d.targetPos : d.chaosPos;
      
      // 2. 物理模拟：带权重的 Lerp
      d.currentPos.lerp(target, delta * config.speed);
      
      // 3. 应用变换
      dummy.position.copy(d.currentPos);
      
      // 自转效果 - 更平滑自然的旋转（只绕Y轴旋转，避免混乱）
      dummy.rotation.y += d.rotationSpeed * delta * 60; // 只绕Y轴旋转，更优雅
      
      // 缩放呼吸和闪烁 (仅在树形态时激活)
      const scaleBase = config.scale;
      const breathing = isFormed ? Math.sin(state.clock.elapsedTime * 2 + i) * 0.15 * scaleBase : 0;
      const pulse = isFormed && type === 'light' ? Math.sin(state.clock.elapsedTime * 4 + i * 0.1) * 0.1 * scaleBase : 0;
      dummy.scale.setScalar(scaleBase + breathing + pulse);

      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });
    
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  // 根据类型和传入参数决定材质属性 - 奢华材质
  const finalMetalness = metalness !== undefined ? metalness : (type === 'light' ? 0.95 : 0.85);
  const finalRoughness = roughness !== undefined ? roughness : (type === 'light' ? 0.1 : 0.2);

  return (
    <instancedMesh ref={meshRef} args={[geometry, undefined, count]} frustumCulled={false}>
      {/* 极度奢华的物理材质 */}
      <meshStandardMaterial 
        color={color} 
        roughness={finalRoughness} 
        metalness={finalMetalness} 
        emissive={type === 'light' ? color : (type === 'heavy' ? color : '#000')}
        emissiveIntensity={type === 'light' ? 2.5 : (type === 'heavy' ? 0.3 : 0)}
        transparent={transparent}
        opacity={opacity}
      />
    </instancedMesh>
  );
};
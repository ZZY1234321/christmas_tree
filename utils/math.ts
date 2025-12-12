import * as THREE from 'three';

// 生成圆锥形圣诞树的点分布 - 饱满的树形，底部更密集
export const getTreePosition = (
  i: number, 
  count: number, 
  radius: number, 
  height: number
) => {
  const p = i / count;
  const y = THREE.MathUtils.mapLinear(p, 0, 1, -height / 2, height / 2);
  
  // 简单的圆锥形分布 - 底部大，顶部小
  const r = (1 - p) * radius;
  
  // 底部区域增加密度：在底部（p > 0.6）时增加螺旋密度
  const spiralDensity = p > 0.6 ? 40 : 30; // 底部更密集的螺旋
  const theta = p * Math.PI * spiralDensity + Math.random() * 0.5;
  
  // 添加随机性，让树看起来更饱满自然
  // 底部区域增加更多的随机偏移，增加密度感
  const densityMultiplier = p > 0.6 ? 0.5 : 0.3; // 底部更大的随机范围
  const randomRadius = (Math.random() - 0.5) * r * densityMultiplier;
  const finalRadius = r + randomRadius;
  
  const x = finalRadius * Math.cos(theta);
  const z = finalRadius * Math.sin(theta);
  
  // 底部区域增加更多的垂直随机偏移，增加密度
  const verticalDensity = p > 0.6 ? 0.25 : 0.15;
  const yOffset = (Math.random() - 0.5) * verticalDensity;
  
  return new THREE.Vector3(x, y + yOffset, z);
};

// 生成球体（混沌）内的随机点
export const getChaosPosition = (radius: number) => {
  const vec = new THREE.Vector3(
    Math.random() - 0.5,
    Math.random() - 0.5,
    Math.random() - 0.5
  ).normalize().multiplyScalar(radius);
  return vec;
};
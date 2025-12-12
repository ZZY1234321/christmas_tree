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

// 生成装饰物位置 - 按圣诞树圆锥形状的面积分布
// 坐标系统：p=0 对应 y=-height/2（底部，y值小），p=1 对应 y=height/2（顶部，y值大）
// 圣诞树是圆锥形：底部面积大（π*r²），顶部面积小
// 应该按面积分布装饰物：底部（p值小）更多，顶部（p值大）更少
export const getOrnamentPosition = (
  i: number,
  count: number,
  radius: number,
  height: number
) => {
  const normalizedIndex = i / count;
  
  // 按面积分布：让更多装饰物在底部（p值小的区域）
  // 使用反向幂次：1 - (1-normalizedIndex)^power，让更多装饰物在底部
  // 使用3.5的幂次，让约85%的装饰物在底部50%的区域
  const p = 1 - Math.pow(1 - normalizedIndex, 3.5);
  const y = THREE.MathUtils.mapLinear(p, 0, 1, -height / 2, height / 2);
  
  // 圆锥形分布 - 底部大（p小，r大），顶部小（p大，r小）
  const r = (1 - p) * radius;
  
  // 根据高度调整螺旋密度
  // 底部区域（p < 0.3，即y值小的区域）密度最高
  const spiralDensity = p < 0.3 ? 55 : (p < 0.6 ? 38 : 28);
  
  // 使用螺旋分布，底部更密集
  const spiralAngle = i * Math.PI * 2 / count * spiralDensity;
  const randomAngle = Math.random() * Math.PI * 2 * 0.25;
  const theta = spiralAngle + randomAngle;
  
  // 添加随机性，底部区域随机范围更大（因为面积大）
  const randomMultiplier = p < 0.3 ? 0.5 : (p < 0.6 ? 0.35 : 0.22);
  const randomRadius = (Math.random() - 0.5) * r * randomMultiplier;
  const finalRadius = Math.max(0.1, r + randomRadius);
  
  const x = finalRadius * Math.cos(theta);
  const z = finalRadius * Math.sin(theta);
  
  // 底部区域增加垂直随机偏移
  const verticalOffset = p < 0.3 ? 0.22 : (p < 0.6 ? 0.14 : 0.08);
  const yOffset = (Math.random() - 0.5) * verticalOffset;
  
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
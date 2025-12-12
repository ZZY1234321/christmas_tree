import { useRef, useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { Raycaster, Vector2 } from 'three';

interface MouseInteractionProps {
  onMouseMove: (position: THREE.Vector3 | null) => void;
}

export const MouseInteraction = ({ onMouseMove }: MouseInteractionProps) => {
  const { camera, gl } = useThree();
  const raycaster = useRef(new Raycaster());
  const mouse = useRef(new Vector2());

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      // 归一化鼠标坐标到 [-1, 1]
      mouse.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = -(event.clientY / window.innerHeight) * 2 + 1;

      // 使用射线投射检测鼠标指向的3D位置
      raycaster.current.setFromCamera(mouse.current, camera);
      
      // 创建一个虚拟平面在树的中心位置来获取3D坐标
      const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
      const intersection = new THREE.Vector3();
      raycaster.current.ray.intersectPlane(plane, intersection);
      
      // 将交点投影到树的圆锥体上
      const distance = Math.sqrt(intersection.x ** 2 + intersection.y ** 2);
      const treeRadius = 6;
      const treeHeight = 14;
      
      if (distance < treeRadius * 1.5 && Math.abs(intersection.y) < treeHeight / 2) {
        // 在树范围内，计算树表面的点
        const angle = Math.atan2(intersection.x, intersection.z);
        const normalizedY = intersection.y / (treeHeight / 2);
        const radius = treeRadius * (1 - Math.abs(normalizedY) * 0.5);
        
        const treeSurfacePoint = new THREE.Vector3(
          Math.cos(angle) * radius,
          intersection.y,
          Math.sin(angle) * radius
        );
        
        onMouseMove(treeSurfacePoint);
      } else {
        onMouseMove(null);
      }
    };

    gl.domElement.addEventListener('mousemove', handleMouseMove);
    return () => {
      gl.domElement.removeEventListener('mousemove', handleMouseMove);
    };
  }, [camera, gl, onMouseMove]);

  return null;
};


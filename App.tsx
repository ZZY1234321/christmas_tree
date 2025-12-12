import { useState, Suspense, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, ContactShadows, Float } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';
import { LuxuryFoliage } from './components/LuxuryFoliage';
import { Ornaments } from './components/Ornaments';
import { StarLights } from './components/StarLights';
import { TreeStar } from './components/TreeStar';
import { MouseInteraction } from './components/MouseInteraction';

const BOX_GEO = new THREE.BoxGeometry(1, 1, 1);
const SPHERE_GEO = new THREE.SphereGeometry(1, 16, 16);

export default function GrandChristmasTree() {
  const [isFormed, setIsFormed] = useState(false);
  const [mousePosition, setMousePosition] = useState<THREE.Vector3 | null>(null);
  
  // 用于区分点击和拖拽
  const mouseDownRef = useRef<{ x: number; y: number } | null>(null);
  const isDraggingRef = useRef(false);

  return (
    <div className="w-full h-screen bg-black relative font-serif">
      {/* UI 控制层 */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 z-10 pointer-events-none w-full">
        <h1 className="text-6xl text-transparent bg-clip-text bg-gradient-to-b from-[#FFD700] to-[#FFFFFF] font-thin tracking-widest drop-shadow-lg text-center italic" style={{ fontFamily: 'Balqis, serif' }}>
          Merry Christmas
        </h1>
      </div>
      
      <Canvas 
        camera={{ position: [0, 0, 25], fov: 45 }} 
        dpr={[1, 2]}
        gl={{ preserveDrawingBuffer: true }}
        onPointerDown={(e) => {
          // 记录鼠标按下位置
          mouseDownRef.current = { x: e.clientX, y: e.clientY };
          isDraggingRef.current = false;
        }}
        onPointerMove={(e) => {
          // 如果鼠标移动距离超过阈值，认为是拖拽
          if (mouseDownRef.current) {
            const dx = e.clientX - mouseDownRef.current.x;
            const dy = e.clientY - mouseDownRef.current.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance > 5) { // 5像素的阈值
              isDraggingRef.current = true;
            }
          }
        }}
        onPointerUp={(e) => {
          // 如果移动距离很小且没有拖拽，认为是点击
          if (mouseDownRef.current && !isDraggingRef.current) {
            const dx = e.clientX - mouseDownRef.current.x;
            const dy = e.clientY - mouseDownRef.current.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance <= 5) {
              console.log('屏幕被点击，当前状态:', isFormed);
              setIsFormed(!isFormed);
            }
          }
          mouseDownRef.current = null;
          isDraggingRef.current = false;
        }}
      >
        <color attach="background" args={['#050805']} />
        
        {/* 奢华的环境光 - 深祖母绿和高光金色 */}
        <ambientLight intensity={0.5} color="#FFD700" />
        
        {/* 主光源 - 金色高光 */}
        <directionalLight 
          position={[10, 20, 10]} 
          intensity={1.2} 
          color="#FFD700" 
          castShadow
        />
        
        {/* 补光 - 深祖母绿 */}
        <pointLight 
          position={[-10, 10, -10]} 
          intensity={0.8} 
          color="#004225" 
          distance={40}
          decay={1.5}
        />
        
        {/* 半球光 - 奢华配色 */}
        <hemisphereLight 
          intensity={0.6} 
          color="#FFD700" 
          groundColor="#004225" 
        />
        
        {/* 闪烁的星星光源 */}
        <StarLights count={60} />
        
        {/* 鼠标交互 */}
        <MouseInteraction onMouseMove={setMousePosition} />

        <Suspense fallback={null}>
          <group position={[0, -2, 0]}>
            <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
              
              {/* 1. 针叶系统 - 支持鼠标交互 */}
              <LuxuryFoliage 
                count={30000} 
                isFormed={isFormed} 
                mousePosition={mousePosition}
              />
              
              {/* 2. 豪华装饰物系统 - 双坐标系统，不同权重 */}
              
              {/* 2. 豪华装饰物系统 - 减少数量，让树形更清晰 */}
              
              {/* 中：红色装饰球 */}
              <Ornaments 
                count={500} 
                type="medium" 
                color="#DC143C"
                geometry={SPHERE_GEO} 
                isFormed={isFormed} 
              />
              
              {/* 中：金色装饰球 */}
              <Ornaments 
                count={450} 
                type="medium" 
                color="#FFD700"
                geometry={SPHERE_GEO} 
                isFormed={isFormed} 
              />
              
              {/* 中：深祖母绿装饰球 */}
              <Ornaments 
                count={500} 
                type="medium" 
                color="#004225"
                geometry={SPHERE_GEO} 
                isFormed={isFormed} 
              />
              
              {/* 轻：金色发光灯光 - 快速归位 */}
              <Ornaments 
                count={400} 
                type="light" 
                color="#FFD700" 
                geometry={SPHERE_GEO} 
                isFormed={isFormed} 
              />
              
              {/* 轻：白色发光灯光 */}
              <Ornaments 
                count={350} 
                type="light" 
                color="#FFFFFF" 
                geometry={SPHERE_GEO} 
                isFormed={isFormed} 
              />
              
            </Float>
            
            {/* 树顶星芒 */}
            <TreeStar position={[0, 7, 0]} isFormed={isFormed} />
          </group>
          
          <ContactShadows opacity={0.3} scale={30} blur={2} far={10} color="#000000" />
        </Suspense>

        <OrbitControls 
          enablePan={false} 
          autoRotate 
          autoRotateSpeed={0.5} 
          minPolarAngle={Math.PI / 4} 
          maxPolarAngle={Math.PI / 1.5}
          makeDefault
        />

        {/* 后期处理：电影级金色光晕 */}
        <EffectComposer>
          <Bloom 
            luminanceThreshold={0.8} 
            mipmapBlur 
            intensity={1.2} 
            radius={0.6}
          />
          <Vignette eskil={false} offset={0.1} darkness={1.1} />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
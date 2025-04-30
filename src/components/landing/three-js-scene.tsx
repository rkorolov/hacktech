// // src/components/ThreeJsScene.tsx
// "use client";

// // --- TSX JSX augmentation for RectAreaLight primitive ---
// import type { Object3DNode } from '@react-three/fiber';
// import { RectAreaLight as ThreeRectAreaLight } from 'three/examples/jsm/lights/RectAreaLight';

// declare global {
//   namespace JSX {
//     interface IntrinsicElements {
//       rectAreaLight: Object3DNode<ThreeRectAreaLight, typeof ThreeRectAreaLight>;
//     }
//   }
// }

// import { useRef, useState, useEffect } from 'react';
// import { Canvas, useFrame, useThree, extend } from '@react-three/fiber';
// import { OrbitControls, TorusKnot } from '@react-three/drei';
// import * as THREE from 'three';
// import { RectAreaLightHelper } from 'three/examples/jsm/helpers/RectAreaLightHelper.js';
// import { RectAreaLightUniformsLib } from 'three/examples/jsm/lights/RectAreaLightUniformsLib.js';
// import { motion } from 'framer-motion';

// // Register the RectAreaLight primitive
// extend({ RectAreaLight: THREE.RectAreaLight });

// // Initialize area-light uniforms (run once)
// RectAreaLightUniformsLib.init();

// function Scene() {
//   const knot = useRef<THREE.Mesh>(null!);
//   const redLightRef = useRef<THREE.RectAreaLight>(null!);
//   const greenLightRef = useRef<THREE.RectAreaLight>(null!);
//   const blueLightRef = useRef<THREE.RectAreaLight>(null!);
//   const { viewport } = useThree();

//   // Rotate knot continuously
//   useFrame(({ clock }) => {
//     if (knot.current) {
//       knot.current.rotation.y = clock.getElapsedTime() * 0.5;
//     }
//   });

//   // Attach and cleanup RectAreaLightHelper
//   useEffect(() => {
//     [redLightRef, greenLightRef, blueLightRef].forEach(ref => {
//       if (ref.current) {
//         const helper = new RectAreaLightHelper(ref.current);
//         ref.current.add(helper);
//       }
//     });
//     return () => {
//       [redLightRef, greenLightRef, blueLightRef].forEach(ref => {
//         if (ref.current) {
//           const helper = ref.current.children.find(
//             child => child instanceof RectAreaLightHelper
//           );
//           if (helper) ref.current.remove(helper);
//         }
//       });
//     };
//   }, []);

//   return (
//     <>
//       {/* Three RectAreaLights */}
//       <rectAreaLight
//         ref={redLightRef}
//         width={4}
//         height={10}
//         intensity={3.5}
//         color="#ec4899"
//         position={[-5, 5, 5]}
//         lookAt={[0, 5, 0]}
//       />
//       <rectAreaLight
//         ref={greenLightRef}
//         width={4}
//         height={10}
//         intensity={3.5}
//         color="#a855f7"
//         position={[0, 5, 5]}
//         lookAt={[0, 5, 0]}
//       />
//       <rectAreaLight
//         ref={blueLightRef}
//         width={4}
//         height={10}
//         intensity={3.5}
//         color="#3b82f6"
//         position={[5, 5, 5]}
//         lookAt={[0, 5, 0]}
//       />

//       {/* Torus Knot Mesh */}
//       <TorusKnot ref={knot} args={[1.5, 0.5, 200, 16]} position={[0, 5, 0]}>
//         <meshStandardMaterial color="#ffffff" roughness={0} metalness={0} />
//       </TorusKnot>

//       {/* Camera Controls */}
//       <OrbitControls
//         enablePan={false}
//         enableZoom={false}
//         minDistance={5}
//         maxDistance={20}
//         target={[0, 5, 0]}
//       />
//     </>
//   );
// }

// export function ThreeJsScene() {
//   const [mounted, setMounted] = useState(false);

//   useEffect(() => {
//     setMounted(true);
//   }, []);

//   if (!mounted) return null;

//   return (
//     <motion.div
//       className="w-full h-full"
//       initial={{ opacity: 0, y: 20 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ duration: 0.8, ease: 'easeOut' }}
//     >
//       <Canvas
//         gl={{ alpha: true }}
//         camera={{ position: [0, 5, -10], fov: 45 }}
//         style={{ background: 'transparent' }}
//       >
//         <Scene />
//       </Canvas>
//     </motion.div>
//   );
// }

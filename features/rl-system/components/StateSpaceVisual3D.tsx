"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Text, Line } from "@react-three/drei";
import * as THREE from "three";

// Customer trajectory (same as 2D)
const trajectory = [
  { x: 0.12, y: 0.85 },
  { x: 0.2, y: 0.72 },
  { x: 0.32, y: 0.58 },
  { x: 0.44, y: 0.48 },
  { x: 0.54, y: 0.38 },
  { x: 0.66, y: 0.3 },
  { x: 0.78, y: 0.22 },
  { x: 0.88, y: 0.15 },
];

// Value function
function valueAt(x: number, y: number): number {
  const s1 = x;
  const s2 = 1 - y;
  return 0.3 * s1 + 0.5 * s2 + 0.2 * s1 * s2;
}

// Green → White → Red color scale
function valueToColor(v: number): THREE.Color {
  const t = Math.min(1, Math.max(0, v));
  
  if (t >= 0.5) {
    const p = (t - 0.5) * 2;
    return new THREE.Color(
      (255 - p * 200) / 255,
      (255 - p * 60) / 255,
      (255 - p * 180) / 255
    );
  } else {
    const p = t * 2;
    return new THREE.Color(
      (220 + p * 35) / 255,
      (80 + p * 175) / 255,
      (80 + p * 175) / 255
    );
  }
}

function ValueSurface() {
  const meshRef = useRef<THREE.Mesh>(null);
  
  const { geometry, colors } = useMemo(() => {
    const size = 40;
    const geo = new THREE.PlaneGeometry(2, 2, size - 1, size - 1);
    const positions = geo.attributes.position;
    const colorArray = new Float32Array(positions.count * 3);
    
    for (let i = 0; i < positions.count; i++) {
      const x = (positions.getX(i) + 1) / 2; // 0 to 1
      const y = (positions.getY(i) + 1) / 2; // 0 to 1
      const v = valueAt(x, 1 - y);
      
      // Set Z height based on value
      positions.setZ(i, v * 0.8);
      
      // Set vertex color
      const color = valueToColor(v);
      colorArray[i * 3] = color.r;
      colorArray[i * 3 + 1] = color.g;
      colorArray[i * 3 + 2] = color.b;
    }
    
    geo.setAttribute('color', new THREE.BufferAttribute(colorArray, 3));
    geo.computeVertexNormals();
    
    return { geometry: geo, colors: colorArray };
  }, []);

  return (
    <mesh ref={meshRef} geometry={geometry} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
      <meshStandardMaterial vertexColors side={THREE.DoubleSide} />
    </mesh>
  );
}

function CustomerPath() {
  const sphereRef = useRef<THREE.Mesh>(null);
  const timeRef = useRef(0);
  
  const points = useMemo(() => {
    return trajectory.map(p => {
      const x = (p.x - 0.5) * 2;
      const z = (p.y - 0.5) * 2;
      const v = valueAt(p.x, p.y);
      const y = v * 0.8 + 0.02; // Slightly above surface
      return new THREE.Vector3(x, y, z);
    });
  }, []);
  
  const curve = useMemo(() => {
    return new THREE.CatmullRomCurve3(points);
  }, [points]);
  
  const linePoints = useMemo(() => {
    return curve.getPoints(50).map(p => [p.x, p.y, p.z] as [number, number, number]);
  }, [curve]);
  
  useFrame((state, delta) => {
    timeRef.current += delta * 0.3;
    if (timeRef.current > 1) timeRef.current = 0;
    
    if (sphereRef.current) {
      const point = curve.getPoint(timeRef.current);
      sphereRef.current.position.copy(point);
    }
  });

  return (
    <>
      <Line points={linePoints} color="#1a1a1a" lineWidth={2} />
      {/* Trajectory points */}
      {points.map((point, idx) => (
        <mesh key={idx} position={point}>
          <sphereGeometry args={[0.03, 16, 16]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
      ))}
      {/* Animated customer sphere */}
      <mesh ref={sphereRef}>
        <sphereGeometry args={[0.06, 16, 16]} />
        <meshStandardMaterial color="#1a1a1a" emissive="#333" />
      </mesh>
    </>
  );
}

function AxisLabels() {
  return (
    <>
      <Text
        position={[1.2, 0, 0]}
        fontSize={0.12}
        color="#666"
        anchorX="center"
        anchorY="middle"
      >
        State factor 1
      </Text>
      <Text
        position={[0, 0, 1.2]}
        fontSize={0.12}
        color="#666"
        anchorX="center"
        anchorY="middle"
        rotation={[0, Math.PI / 2, 0]}
      >
        State factor 2
      </Text>
      <Text
        position={[-1.15, 0.5, -1.15]}
        fontSize={0.12}
        color="#666"
        anchorX="center"
        anchorY="middle"
      >
        Value
      </Text>
    </>
  );
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 10, 5]} intensity={0.8} />
      <directionalLight position={[-5, 5, -5]} intensity={0.3} />
      
      <ValueSurface />
      <CustomerPath />
      <AxisLabels />
      
      {/* Grid helper */}
      <gridHelper args={[2, 10, "#ddd", "#eee"]} position={[0, -0.01, 0]} />
      
      <OrbitControls 
        enablePan={false}
        minDistance={2}
        maxDistance={5}
        minPolarAngle={0.3}
        maxPolarAngle={Math.PI / 2.2}
        autoRotate
        autoRotateSpeed={0.5}
      />
    </>
  );
}

export function StateSpaceVisual3D() {
  return (
    <div className="canvas-container">
      <Canvas
        camera={{ position: [2.5, 2, 2.5], fov: 45 }}
        style={{ background: "transparent" }}
      >
        <Scene />
      </Canvas>
      <p className="caption">Drag to rotate · Customer climbs the value surface over time</p>
      
      <style jsx>{`
        .canvas-container {
          width: 100%;
          height: 400px;
          border-radius: 8px;
          overflow: hidden;
          border: 1px solid var(--border);
          background: linear-gradient(135deg, #fafafa 0%, #f0f0f0 100%);
        }
        .caption {
          text-align: center;
          font-size: 12px;
          color: var(--muted);
          margin-top: var(--space-2);
        }
      `}</style>
    </div>
  );
}


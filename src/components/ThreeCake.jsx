import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const ThreeCake = ({ isBlown, triggerConfetti }) => {
  const containerRef = useRef(null);
  const rendererRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const flamesRef = useRef([]);
  const cakeGroupRef = useRef(null);
  const animationFrameId = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // --- Scene Setup ---
    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight || 400;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Soft pink/white gradient background matching the theme
    scene.background = null; // Transparent background to let CSS handle gradient

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 5, 12);
    camera.lookAt(0, 1.5, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // --- Lighting ---
    const ambientLight = new THREE.AmbientLight(0xfff0f5, 0.8); // Lavender blush / soft pink tone
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.0);
    dirLight.position.set(5, 10, 5);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    dirLight.shadow.bias = -0.001;
    scene.add(dirLight);

    // Warm candle lights (point lights)
    const candleLights = [];

    // --- Create Cake Group ---
    const cakeGroup = new THREE.Group();
    cakeGroupRef.current = cakeGroup;
    scene.add(cakeGroup);

    // 1. Plate / Stand
    const plateGeom = new THREE.CylinderGeometry(3.5, 3.7, 0.2, 32);
    const plateMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.1,
      metalness: 0.1,
    });
    const plate = new THREE.Mesh(plateGeom, plateMat);
    plate.position.y = 0;
    plate.receiveShadow = true;
    plate.castShadow = true;
    cakeGroup.add(plate);

    const standGeom = new THREE.CylinderGeometry(1.5, 2.2, 0.6, 32);
    const stand = new THREE.Mesh(standGeom, plateMat);
    stand.position.y = -0.3;
    stand.receiveShadow = true;
    cakeGroup.add(stand);

    // Materials
    const cakeBaseMat = new THREE.MeshStandardMaterial({
      color: 0xffb7c5, // Beautiful soft cherry blossom pink
      roughness: 0.4,
      metalness: 0.05,
    });

    const cakeTopMat = new THREE.MeshStandardMaterial({
      color: 0xfff0f5, // Soft lavender white / cream
      roughness: 0.3,
      metalness: 0.05,
    });

    const creamMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.2,
    });

    const strawberryMat = new THREE.MeshStandardMaterial({
      color: 0xe0115f, // Ruby red strawberry
      roughness: 0.6,
    });

    // 2. Lower Tier (Large Cake)
    const lowerGeom = new THREE.CylinderGeometry(2.8, 2.8, 1.8, 64);
    const lowerCake = new THREE.Mesh(lowerGeom, cakeBaseMat);
    lowerCake.position.y = 0.9;
    lowerCake.castShadow = true;
    lowerCake.receiveShadow = true;
    cakeGroup.add(lowerCake);

    // Lower Tier Drip Cream (simple representation using spheres/torus or small details)
    const creamDecorGroup = new THREE.Group();
    const decorCount = 16;
    for (let i = 0; i < decorCount; i++) {
      const angle = (i / decorCount) * Math.PI * 2;
      const radius = 2.85;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const pipGeom = new THREE.SphereGeometry(0.15, 8, 8);
      const pip = new THREE.Mesh(pipGeom, creamMat);
      pip.position.set(x, 1.8, z);
      pip.scale.set(1, 0.7, 1);
      creamDecorGroup.add(pip);
    }
    cakeGroup.add(creamDecorGroup);

    // 3. Upper Tier (Small Cake)
    const upperGeom = new THREE.CylinderGeometry(1.8, 1.8, 1.3, 64);
    const upperCake = new THREE.Mesh(upperGeom, cakeTopMat);
    upperCake.position.y = 2.45;
    upperCake.castShadow = true;
    upperCake.receiveShadow = true;
    cakeGroup.add(upperCake);

    // Upper Cream pipings
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const radius = 1.85;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const pipGeom = new THREE.SphereGeometry(0.12, 8, 8);
      const pip = new THREE.Mesh(pipGeom, creamMat);
      pip.position.set(x, 3.1, z);
      creamDecorGroup.add(pip);

      // Add small strawberry toppings on the upper rim
      if (i % 2 === 0) {
        const strawGeom = new THREE.ConeGeometry(0.15, 0.25, 8);
        const straw = new THREE.Mesh(strawGeom, strawberryMat);
        straw.position.set(x * 0.85, 3.2, z * 0.85);
        straw.rotation.x = Math.random() * 0.2 - 0.1;
        straw.rotation.z = Math.random() * 0.2 - 0.1;
        cakeGroup.add(straw);
      }
    }

    // 4. Candles
    const candleCount = 5;
    const candleRadius = 1.1; // Place candles in a small circle on top tier
    const candleColors = [0xff69b4, 0x87cefa, 0xffd700, 0xda70d6, 0xadff2f]; // Pink, Blue, Gold, Orchid, Green
    const flames = [];

    for (let i = 0; i < candleCount; i++) {
      const angle = (i / candleCount) * Math.PI * 2;
      const x = Math.cos(angle) * candleRadius;
      const z = Math.sin(angle) * candleRadius;

      // Candle Stick
      const stickGeom = new THREE.CylinderGeometry(0.08, 0.08, 0.8, 16);
      const stickMat = new THREE.MeshStandardMaterial({
        color: candleColors[i],
        roughness: 0.5,
      });
      const stick = new THREE.Mesh(stickGeom, stickMat);
      stick.position.set(x, 3.5, z);
      stick.castShadow = true;
      cakeGroup.add(stick);

      // Wick (sumbu lilin)
      const wickGeom = new THREE.CylinderGeometry(0.015, 0.015, 0.15, 8);
      const wickMat = new THREE.MeshStandardMaterial({ color: 0x333333 });
      const wick = new THREE.Mesh(wickGeom, wickMat);
      wick.position.set(x, 3.95, z);
      cakeGroup.add(wick);

      // Flame (visualized as a tiny teardrop shape)
      const flameGeom = new THREE.ConeGeometry(0.08, 0.25, 8);
      // Flame material glows (emissive)
      const flameMat = new THREE.MeshBasicMaterial({
        color: 0xffaa44,
      });
      const flame = new THREE.Mesh(flameGeom, flameMat);
      flame.position.set(x, 4.15, z);
      cakeGroup.add(flame);
      flames.push(flame);

      // Light from candle
      const pointLight = new THREE.PointLight(0xff7700, 1.2, 6);
      pointLight.position.set(x, 4.2, z);
      pointLight.castShadow = true;
      pointLight.shadow.bias = -0.002;
      cakeGroup.add(pointLight);
      candleLights.push(pointLight);
    }

    flamesRef.current = flames;

    // --- Animation loop ---
    let frame = 0;
    const animate = () => {
      frame += 0.01;
      
      // Rotate the cake slowly
      if (cakeGroup) {
        cakeGroup.rotation.y += 0.005;
      }

      // Animate candle flames (flicker and scale effect)
      if (!isBlown) {
        flames.forEach((flame, index) => {
          // Flicker scale
          const scaleY = 1.0 + Math.sin(frame * 15 + index) * 0.15;
          const scaleXZ = 1.0 + Math.cos(frame * 12 + index) * 0.1;
          flame.scale.set(scaleXZ, scaleY, scaleXZ);

          // Flicker color glow
          const intensity = 1.0 + Math.sin(frame * 20 + index) * 0.2;
          candleLights[index].intensity = intensity;
        });
      } else {
        // Shrink flames and fade lights if blown
        flames.forEach((flame, index) => {
          if (flame.scale.y > 0.01) {
            flame.scale.y -= 0.1;
            flame.scale.x -= 0.1;
            flame.scale.z -= 0.1;
            flame.position.y -= 0.01;
            
            // Fade light intensity
            if (candleLights[index].intensity > 0) {
              candleLights[index].intensity -= 0.1;
            }
          } else {
            flame.visible = false;
            candleLights[index].intensity = 0;
          }
        });
      }

      renderer.render(scene, camera);
      animationFrameId.current = requestAnimationFrame(animate);
    };

    animate();

    // --- Resize Handler ---
    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight || 400;
      
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      
      rendererRef.current.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    // --- Cleanup ---
    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      if (rendererRef.current && rendererRef.current.domElement) {
        rendererRef.current.domElement.remove();
      }
    };
  }, []);

  // Watch for isBlown prop change to trigger actions
  useEffect(() => {
    if (isBlown && triggerConfetti) {
      triggerConfetti();
    }
  }, [isBlown, triggerConfetti]);

  return (
    <div 
      ref={containerRef} 
      className="three-cake-container" 
      style={{ 
        width: '100%', 
        height: '420px', 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        position: 'relative',
        cursor: 'grab'
      }} 
    />
  );
};

export default ThreeCake;

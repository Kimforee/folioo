import * as THREE from 'three';
import { OrbitControls } from 'jsm/controls/OrbitControls.js';
import { EffectComposer } from 'jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'jsm/postprocessing/UnrealBloomPass.js';
import { FontLoader } from 'jsm/loaders/FontLoader.js';
import { TextGeometry } from 'jsm/geometries/TextGeometry.js';

const canvas = document.getElementById('bgCanvas');
const w = window.innerWidth;
const h = window.innerHeight;
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x000000, 0.035);
const camera = new THREE.PerspectiveCamera(75, w / h, 0.1, 1000);
camera.position.z = 3;
const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
renderer.setSize(w, h);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.1;

// Post-processing
const renderScene = new RenderPass(scene, camera);
const bloomPass = new UnrealBloomPass(new THREE.Vector2(w, h), 1.5, 0.4, 100);
bloomPass.threshold = 0;
bloomPass.strength = 2.5;
bloomPass.radius = 0;
const composer = new EffectComposer(renderer);
composer.addPass(renderScene);
composer.addPass(bloomPass);

// Adding 3D text
// const fontLoader = new FontLoader();
// fontLoader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', (font) => {
//   const textGeometry = new TextGeometry('', {
//     font: font,
//     size: 5,
//     height: 1,
//     curveSegments: 12,
//     bevelEnabled: true,
//     bevelThickness: 0.1,
//     bevelSize: 0.1,
//     bevelOffset: 0,
//     bevelSegments: 5,
//   });
//   const textMaterial = new THREE.MeshBasicMaterial({ color: 0xffa100 });
//   const textMesh = new THREE.Mesh(textGeometry, textMaterial);
//   textMesh.position.set(-20, 10, 0);
//   scene.add(textMesh);
// });

function getRandomSpherePoint({ radius = 10 }) {
  const minRadius = radius * 0.25;
  const maxRadius = radius - minRadius;
  const range = Math.random() * maxRadius + minRadius;
  const u = Math.random();
  const v = Math.random();
  const theta = 2 * Math.PI * u;
  const phi = Math.acos(2 * v - 1);
  return {
    x: range * Math.sin(phi) * Math.cos(theta),
    y: range * Math.sin(phi) * Math.sin(theta),
    z: range * Math.cos(phi),
  };
}

const geo = new THREE.BoxGeometry(1, 1, 1);
const mat = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const edges = new THREE.EdgesGeometry(geo);
function getBox() {
  const box = new THREE.LineSegments(edges, mat);
  return box;
}
const boxGroup = new THREE.Group();
boxGroup.userData.update = (timeStamp) => {
  boxGroup.rotation.x = timeStamp * 0.0001;
  boxGroup.rotation.y = timeStamp * 0.0001;
};
scene.add(boxGroup);

const numBoxes = 1000;
const radius = 45;
for (let i = 0; i < numBoxes; i++) {
  const box = getBox();
  const { x, y, z } = getRandomSpherePoint({ radius });
  box.position.set(x, y, z);
  box.rotation.set(x, y, z);
  boxGroup.add(box);
}

const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444);
scene.add(hemiLight);

document.addEventListener('mousemove', (event) => {
  const mouseX = (event.clientX / window.innerWidth) * 2 - 1;
  const mouseY = -(event.clientY / window.innerHeight) * 2 + 1;

  boxGroup.position.x = mouseX * 10;
  boxGroup.position.y = mouseY * 10;
});

function animate(timeStamp = 0) {
  requestAnimationFrame(animate);
  boxGroup.userData.update(timeStamp);
  composer.render(scene, camera);
  controls.update();

    // Update hero image gradient
    const hue = (timeStamp * 0.0001) % 360;
    const heroImage = document.querySelector('.hero-image');
    if (heroImage) {
      heroImage.style.background = `linear-gradient(45deg, hsl(${hue}, 100%, 50%), hsl(${(hue + 120) % 360}, 100%, 25%))`;
    }
}


animate();

function handleWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener('resize', handleWindowResize, false);

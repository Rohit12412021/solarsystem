import * as THREE from "https://cdn.skypack.dev/three@0.129.0";
import { OrbitControls } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/controls/OrbitControls.js";

let scene, camera, renderer, controls;
let planet_sun, planet_mercury, planet_venus, planet_earth, planet_mars, planet_jupiter, planet_saturn, planet_uranus, planet_neptune;
let globalSpeedMultiplier = 1;

let orbitRadii = {
  mercury: 50,
  venus: 60,
  earth: 70,
  mars: 80,
  jupiter: 100,
  saturn: 120,
  uranus: 140,
  neptune: 160
};

let revolutionSpeeds = {
  mercury: 2,
  venus: 1.5,
  earth: 1,
  mars: 0.8,
  jupiter: 0.7,
  saturn: 0.6,
  uranus: 0.5,
  neptune: 0.4
};

function createMaterialArray() {
  const skyboxPaths = [
    '../img/skybox/space_ft.png',
    '../img/skybox/space_bk.png',
    '../img/skybox/space_up.png',
    '../img/skybox/space_dn.png',
    '../img/skybox/space_rt.png',
    '../img/skybox/space_lf.png'
  ];
  return skyboxPaths.map(img => {
    const texture = new THREE.TextureLoader().load(img);
    return new THREE.MeshBasicMaterial({ map: texture, side: THREE.BackSide });
  });
}

function setSkyBox() {
  const materialArray = createMaterialArray();
  const geometry = new THREE.BoxGeometry(1000, 1000, 1000);
  const skybox = new THREE.Mesh(geometry, materialArray);
  scene.add(skybox);
}

function loadPlanetTexture(texture, radius, widthSegments, heightSegments, type) {
  const geometry = new THREE.SphereGeometry(radius, widthSegments, heightSegments);
  const map = new THREE.TextureLoader().load(texture);
  const material = type === 'standard'
    ? new THREE.MeshStandardMaterial({ map })
    : new THREE.MeshBasicMaterial({ map });
  return new THREE.Mesh(geometry, material);
}

function createRing(innerRadius) {
  const geometry = new THREE.RingGeometry(innerRadius, innerRadius - 0.1, 100);
  const material = new THREE.MeshBasicMaterial({ color: '#ffffff', side: THREE.DoubleSide });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.rotation.x = Math.PI / 2;
  scene.add(mesh);
}

function init() {
  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(85, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 100;

  setSkyBox();

  // Load planets
  planet_sun = loadPlanetTexture("../img/sun_hd.jpg", 20, 100, 100, 'basic');
  planet_mercury = loadPlanetTexture("../img/mercury_hd.jpg", 2, 100, 100, 'standard');
  planet_venus = loadPlanetTexture("../img/venus_hd.jpg", 3, 100, 100, 'standard');
  planet_earth = loadPlanetTexture("../img/earth_hd.jpg", 4, 100, 100, 'standard');
  planet_mars = loadPlanetTexture("../img/mars_hd.jpg", 3.5, 100, 100, 'standard');
  planet_jupiter = loadPlanetTexture("../img/jupiter_hd.jpg", 10, 100, 100, 'standard');
  planet_saturn = loadPlanetTexture("../img/saturn_hd.jpg", 8, 100, 100, 'standard');
  planet_uranus = loadPlanetTexture("../img/uranus_hd.jpg", 6, 100, 100, 'standard');
  planet_neptune = loadPlanetTexture("../img/neptune_hd.jpg", 5, 100, 100, 'standard');

  // Add planets to scene
  [
    planet_sun, planet_mercury, planet_venus, planet_earth, planet_mars,
    planet_jupiter, planet_saturn, planet_uranus, planet_neptune
  ].forEach(planet => scene.add(planet));

  // Light source (Sun)
  const sunLight = new THREE.PointLight(0xffffff, 1, 0);
  sunLight.position.copy(planet_sun.position);
  scene.add(sunLight);

  // Create orbits
  Object.values(orbitRadii).forEach(radius => createRing(radius));

  // Renderer setup
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  controls = new OrbitControls(camera, renderer.domElement);
  controls.minDistance = 12;
  controls.maxDistance = 1000;
}

function planetRevolver(time, speed, planet, orbitRadius) {
  const orbitSpeed = 0.001 * globalSpeedMultiplier;
  const angle = time * orbitSpeed * speed;
  planet.position.x = planet_sun.position.x + orbitRadius * Math.cos(angle);
  planet.position.z = planet_sun.position.z + orbitRadius * Math.sin(angle);
}

function animate(time) {
  requestAnimationFrame(animate);

  const rotationSpeed = 0.005 * globalSpeedMultiplier;

  // Rotate planets
  [
    planet_sun, planet_mercury, planet_venus, planet_earth,
    planet_mars, planet_jupiter, planet_saturn, planet_uranus, planet_neptune
  ].forEach(p => p.rotation.y += rotationSpeed);

  // Revolution
  planetRevolver(time, revolutionSpeeds.mercury, planet_mercury, orbitRadii.mercury);
  planetRevolver(time, revolutionSpeeds.venus, planet_venus, orbitRadii.venus);
  planetRevolver(time, revolutionSpeeds.earth, planet_earth, orbitRadii.earth);
  planetRevolver(time, revolutionSpeeds.mars, planet_mars, orbitRadii.mars);
  planetRevolver(time, revolutionSpeeds.jupiter, planet_jupiter, orbitRadii.jupiter);
  planetRevolver(time, revolutionSpeeds.saturn, planet_saturn, orbitRadii.saturn);
  planetRevolver(time, revolutionSpeeds.uranus, planet_uranus, orbitRadii.uranus);
  planetRevolver(time, revolutionSpeeds.neptune, planet_neptune, orbitRadii.neptune);

  controls.update();
  renderer.render(scene, camera);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

window.addEventListener("resize", onWindowResize, false);

// Speed Slider Functionality
const slider = document.getElementById("speed-slider");
const speedText = document.getElementById("speed-value");

slider.addEventListener("input", () => {
  globalSpeedMultiplier = parseFloat(slider.value);
  speedText.textContent = `${globalSpeedMultiplier.toFixed(1)}x`;
});

// Start the app
init();
animate(0);

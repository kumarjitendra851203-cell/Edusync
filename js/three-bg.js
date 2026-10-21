/* ═══════════ THREE.JS animated background ═══════════ */
(function init3D() {
  const canvas = document.getElementById('three-canvas');
  if (!canvas || typeof THREE === 'undefined') return;
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true }); } catch (e) { return; }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 30;

  const pGeo = new THREE.BufferGeometry(), count = 800, pos = new Float32Array(count * 3);
  for (let i = 0; i < count * 3; i++) pos[i] = (Math.random() - 0.5) * 100;
  pGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const particles = new THREE.Points(pGeo, new THREE.PointsMaterial({ color: 0x4f8ef7, size: 0.2, transparent: true, opacity: 0.6 }));
  scene.add(particles);

  const geos = [new THREE.IcosahedronGeometry(1.5, 0), new THREE.OctahedronGeometry(1.2, 0), new THREE.TetrahedronGeometry(1.3, 0)];
  const colors = [0x4f8ef7, 0x2dd4bf, 0xa78bfa], shapes = [];
  for (let i = 0; i < 6; i++) {
    const mesh = new THREE.Mesh(geos[i % 3], new THREE.MeshBasicMaterial({ color: colors[i % 3], wireframe: true, transparent: true, opacity: 0.15 }));
    mesh.position.set((Math.random() - 0.5) * 40, (Math.random() - 0.5) * 30, (Math.random() - 0.5) * 20 - 10);
    mesh.userData = { rx: Math.random() * .005, ry: Math.random() * .005 };
    scene.add(mesh); shapes.push(mesh);
  }
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight; camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
  (function animate() {
    requestAnimationFrame(animate);
    if (document.hidden) return;
    const t = Date.now() * .001;
    particles.rotation.y = t * 0.02; particles.rotation.x = t * 0.01;
    shapes.forEach(s => { s.rotation.x += s.userData.rx; s.rotation.y += s.userData.ry; });
    renderer.render(scene, camera);
  })();
})();

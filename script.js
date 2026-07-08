// 1. Setup Dasar Ruang 3D (Menggunakan objek global THREE)
const container = document.getElementById('canvas-container');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0a0a0a); 

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 0, 5); 

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
container.appendChild(renderer.domElement);

// 2. Sistem Pencahayaan Merata
const ambientLight = new THREE.AmbientLight(0xffffff, 0.8); 
scene.add(ambientLight);

const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x444444, 1.0); 
hemisphereLight.position.set(0, 20, 0);
scene.add(hemisphereLight);

const frontDirectionalLight = new THREE.DirectionalLight(0x00ffcc, 1.5); 
frontDirectionalLight.position.set(5, 5, 5);
scene.add(frontDirectionalLight);

// 3. Memuat Berkas File 3D (.glb) menggunakan THREE.GLTFLoader global
const loader = new THREE.GLTFLoader();
let sLogo = null;

loader.load('infinity_loop.glb', (gltf) => {
    sLogo = gltf.scene;
    
    // Memaksa file 3D berada di tengah & skala ukuran pas di layar
    const box = new THREE.Box3().setFromObject(sLogo);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    
    const maxDim = Math.max(size.x, size.y, size.z);
    const fov = camera.fov * (Math.PI / 180);
    
    sLogo.position.x += (sLogo.position.x - center.x);
    sLogo.position.y += (sLogo.position.y - center.y);
    sLogo.position.z += (sLogo.position.z - center.z);
    
    scene.add(sLogo);
    console.log("File 3D sukses dimuat tanpa hambatan CORS!");
}, undefined, (error) => {
    console.error('Gagal memuat file 3D:', error);
});

// 4. Perputaran Alami Saat Diam (Idle Animation)
let isTransitioning = false;
const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);
    
    if (sLogo && !isTransitioning) {
        sLogo.rotation.y = clock.getElapsedTime() * 0.4;
        sLogo.rotation.x = Math.sin(clock.getElapsedTime() * 0.2) * 0.08;
    }
    
    renderer.render(scene, camera);
}
animate();

// 5. Animasi Transisi Tembus Masuk Portal Menggunakan GSAP global
const trigger = document.getElementById('portal-trigger');
trigger.addEventListener('click', () => {
    if (!sLogo || isTransitioning) return;
    isTransitioning = true;

    document.getElementById('text').style.opacity = '0';

    const tl = gsap.timeline({
        onComplete: () => {
            scene.background = new THREE.Color(0xf5f5f5);
            alert("Berhasil menembus objek 3D! Selamat datang di Portofolio Arsitektur.");
        }
    });

    tl.to(sLogo.rotation, {
        x: 0,
        y: Math.PI * 4, 
        z: 0,
        duration: 1.8,
        ease: "power2.inOut"
    }, 0);

    tl.to(camera.position, {
        z: -1, 
        duration: 1.8,
        ease: "expo.in"
    }, 0);

    tl.to(camera, {
        fov: 140,
        duration: 1.8,
        ease: "expo.in",
        onUpdate: () => camera.updateProjectionMatrix()
    }, 0);
});

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

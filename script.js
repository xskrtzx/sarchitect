// Mengimpor Three.js dan GLTFLoader secara resmi lewat skema ES Modul
import * as THREE from 'https://skypack.dev';
import { GLTFLoader } from 'https://skypack.dev';

// 1. Setup Dasar Ruang 3D
const container = document.getElementById('canvas-container');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0a0a0a); 

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 0, 5); 

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
container.appendChild(renderer.domElement);

// 2. Sistem Pencahayaan Studio Merata
const ambientLight = new THREE.AmbientLight(0xffffff, 0.8); 
scene.add(ambientLight);

const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x444444, 1.0); 
hemisphereLight.position.set(0, 20, 0);
scene.add(hemisphereLight);

const frontDirectionalLight = new THREE.DirectionalLight(0x00ffcc, 1.5); 
frontDirectionalLight.position.set(5, 5, 5);
scene.add(frontDirectionalLight);

// 3. Memuat Berkas File 3D (.glb)
const loader = new GLTFLoader();
let sLogo = null;
const statusText = document.getElementById('text');

loader.load(
    'logo-s.glb', 
    (gltf) => {
        sLogo = gltf.scene;
        
        // Menengahkan posisi objek secara otomatis di layar browser
        const box = new THREE.Box3().setFromObject(sLogo);
        const center = box.getCenter(new THREE.Vector3());
        
        sLogo.position.x += (sLogo.position.x - center.x);
        sLogo.position.y += (sLogo.position.y - center.y);
        sLogo.position.z += (sLogo.position.z - center.z);
        
        scene.add(sLogo);
        
        // Ubah teks instruksi setelah file 3D sukses terunduh sepenuhnya
        statusText.innerText = "Klik Logo S untuk Masuk";
        console.log("File 3D sukses dimuat!");
    },
    (xhr) => {
        // Fungsi untuk melacak proses unduhan jika file Anda berukuran besar
        if (xhr.total > 0) {
            const percent = Math.round((xhr.loaded / xhr.total) * 100);
            statusText.innerText = `Memuat: ${percent}%`;
        }
    }, 
    (error) => {
        statusText.innerText = "Gagal memuat file .glb";
        console.error('Kendala berkas:', error);
    }
);

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

// 5. Animasi Transisi Tembus Masuk Portal
const trigger = document.getElementById('portal-trigger');
trigger.addEventListener('click', () => {
    if (!sLogo || isTransitioning) return;
    isTransitioning = true;

    statusText.style.opacity = '0';

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

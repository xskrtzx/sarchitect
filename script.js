import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// 1. Inisialisasi Dasar Ruang 3D
const container = document.getElementById('canvas-container');
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 0, 4); // Posisi awal kamera di depan objek

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
container.appendChild(renderer.domElement);

// 2. Sistem Pencahayaan Teatrikal agar Material Objek 3D Terlihat Nyata
const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
scene.add(ambientLight);

const frontLight = new THREE.DirectionalLight(0x00ffcc, 1.5); // Cahaya neon sian dari depan
frontLight.position.set(0, 2, 4);
scene.add(frontLight);

const backLight = new THREE.DirectionalLight(0xffffff, 1.0); // Rim light dari belakang objek
backLight.position.set(0, -2, -4);
scene.add(backLight);

// 3. Memuat Berkas File 3D Anda (.gltf atau .glb)
const loader = new GLTFLoader();
let sLogo = null;

// GANTI 'logo-s.glb' dengan nama file 3D Anda yang ditaruh di GitHub nanti
loader.load('1_twisted_gerono.glb', (gltf) => {
    sLogo = gltf.scene;
    
    // Atur skala ukuran objek 3D Anda agar pas di layar
    sLogo.scale.set(1.5, 1.5, 1.5); 
    
    // Tengahkan titik pusat objek 3D Anda
    const box = new THREE.Box3().setFromObject(sLogo);
    const center = box.getCenter(new THREE.Vector3());
    sLogo.position.sub(center); 

    scene.add(sLogo);
}, undefined, (error) => {
    console.error('Gagal memuat file 3D, pastikan nama file benar:', error);
});

// 4. Perputaran Alami Saat Diam (Idle)
let isTransitioning = false;
const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);
    
    // Putar objek secara halus jika file sudah berhasil dimuat dan tidak sedang diklik
    if (sLogo && !isTransitioning) {
        sLogo.rotation.y = clock.getElapsedTime() * 0.5;
        sLogo.rotation.x = Math.sin(clock.getElapsedTime() * 0.3) * 0.1;
    }
    
    renderer.render(scene, camera);
}
animate();

// 5. Animasi Kamera Menembus File 3D (Portal Zoom-In)
const trigger = document.getElementById('portal-trigger');
trigger.addEventListener('click', () => {
    if (!sLogo || isTransitioning) return;
    isTransitioning = true;

    // Sembunyikan teks petunjuk
    document.getElementById('text').style.opacity = '0';

    const tl = gsap.timeline({
        onComplete: () => {
            // Aksi setelah kamera berhasil menerobos masuk melewati objek 3D
            document.body.style.backgroundColor = "#f5f5f5";
            alert("Kamera berhasil menembus file 3D Logo S!");
        }
    });

    // Paksa objek menghadap lurus ke arah kamera agar lubang tengahnya bisa dilewati
    tl.to(sLogo.rotation, {
        x: 0,
        y: Math.PI * 4, // Berputar cepat dua putaran penuh
        z: 0,
        duration: 2.0,
        ease: "power2.inOut"
    }, 0);

    // Dorong kamera maju ke depan meluncur menembus titik tengah koordinat objek
    tl.to(camera.position, {
        z: -0.5, // Koordinat Z minus artinya kamera sudah melewati posisi objek (Z=0)
        duration: 2.0,
        ease: "expo.in"
    }, 0);

    // Efek distorsi kecepatan tinggi lensa (Field of View melebar)
    tl.to(camera, {
        fov: 130,
        duration: 2.0,
        ease: "expo.in",
        onUpdate: () => camera.updateProjectionMatrix()
    }, 0);
});

// Menyesuaikan ukuran jika jendela browser diubah
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

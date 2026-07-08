import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

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

// Pencahayaan
const ambientLight = new THREE.AmbientLight(0xffffff, 0.8); 
scene.add(ambientLight);
const frontLight = new THREE.DirectionalLight(0x00ffcc, 1.5); 
frontLight.position.set(5, 5, 5);
scene.add(frontLight);

// 2. Memuat File 3D (.glb)
const loader = new GLTFLoader();
let sLogo = null;
const statusText = document.getElementById('text');

loader.load('logo-s.glb', (gltf) => {
    sLogo = gltf.scene;
    const box = new THREE.Box3().setFromObject(sLogo);
    const center = box.getCenter(new THREE.Vector3());
    sLogo.position.x += (sLogo.position.x - center.x);
    sLogo.position.y += (sLogo.position.y - center.y);
    sLogo.position.z += (sLogo.position.z - center.z);
    scene.add(sLogo);
    
    statusText.innerText = "Klik Logo S untuk Masuk";
}, (xhr) => {
    if (xhr.total > 0) {
        statusText.innerText = `Memuat: ${Math.round((xhr.loaded / xhr.total) * 100)}%`;
    }
}, (error) => {
    statusText.innerText = "Gagal memuat berkas 3D";
});

// Loop Animasi Putar Diam
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

// 3. Efek Transisi Portal Kamera (Klik Menembus Objek)
const trigger = document.getElementById('portal-trigger');
trigger.addEventListener('click', () => {
    if (!sLogo || isTransitioning) return;
    isTransitioning = true;

    statusText.style.opacity = '0';
    // Ubah warna menu sudut menjadi gelap karena latar belakang akan berubah terang
    document.querySelectorAll('#corner-nav a').forEach(a => a.style.color = 'rgba(0,0,0,0.4)');

    const tl = gsap.timeline({
        onComplete: () => {
            // Matikan visual render 3D agar performa hemat
            container.style.display = 'none';
            document.querySelector('.ui-layer').style.display = 'none';
            
            // Tampilkan Bagian 2 (Portofolio) secara halus
            switchPage('portfolio-section');
        }
    });

    tl.to(sLogo.rotation, { x: 0, y: Math.PI * 4, duration: 1.8, ease: "power2.inOut" }, 0);
    tl.to(camera.position, { z: -1, duration: 1.8, ease: "expo.in" }, 0);
    tl.to(camera, { fov: 140, duration: 1.8, ease: "expo.in", onUpdate: () => camera.updateProjectionMatrix() }, 0);
});

// 4. Manajemen Perpindahan Halaman Aplikasi Tunggal (SPA)
function switchPage(targetId) {
    // Sembunyikan semua halaman terlebih dahulu
    document.querySelectorAll('.page-section').forEach(section => {
        section.classList.add('hidden-section');
        section.classList.remove('active-section');
    });

    // Nyalakan hanya halaman target tujuan
    const targetSection = document.getElementById(targetId);
    if(targetSection) {
        targetSection.classList.remove('hidden-section');
        targetSection.classList.add('active-section');
        
        if(targetId === 'portfolio-section') initPortfolioMechanics();
    }
}

// 5. Sistem Navigasi Sudut Kontrol Klik Manual
document.querySelector('.top-left').addEventListener('click', (e) => {
    e.preventDefault();
    container.style.display = 'block';
    document.querySelector('.ui-layer').style.display = 'flex';
    statusText.style.opacity = '0.5';
    isTransitioning = false;
    camera.position.set(0, 0, 5);
    camera.fov = 60;
    camera.updateProjectionMatrix();
    document.querySelectorAll('#corner-nav a').forEach(a => a.style.color = 'rgba(255,255,255,0.4)');
    switchPage(''); // Menyembunyikan portofolio & profil kembali ke home awal
});

document.querySelector('.top-right').addEventListener('click', (e) => {
    e.preventDefault();
    container.style.display = 'none';
    document.querySelector('.ui-layer').style.display = 'none';
    document.querySelectorAll('#corner-nav a').forEach(a => a.style.color = 'rgba(0,0,0,0.4)');
    switchPage('portfolio-section');
});

document.querySelector('.bottom-left').addEventListener('click', (e) => {
    e.preventDefault();
    container.style.display = 'none';
    document.querySelector('.ui-layer').style.display = 'none';
    document.querySelectorAll('#corner-nav a').forEach(a => a.style.color = 'rgba(0,0,0,0.4)');
    switchPage('profile-section');
});

// 6. Logika Jalur Gerak Horizontal & Paralaks Kursor
let currentX = 0, targetX = 0, isDragging = false, startX = 0;
function initPortfolioMechanics() {
    const track = document.getElementById('track');
    const cards = document.querySelectorAll('.project-card');
    const ticker = document.getElementById('coord-ticker');
    
    // Ticker Koordinat Berjalan
    clearInterval(window.tickerInterval);
    window.tickerInterval = setInterval(() => {
        let text = ticker.innerText;
        ticker.innerText = text.substring(1) + text.substring(0, 1);
    }, 50);

    // Geser Menggunakan Tarikan Mouse (Horizontal Drag)
    window.addEventListener('mousedown', (e) => {
        isDragging = true;
        startX = e.clientX - currentX;
        if(track) track.style.cursor = 'grabbing';
    });

    window.addEventListener('mouseup', () => {
        isDragging = false;
        if(track) track.style.cursor = 'grab';
    });

    window.addEventListener('mousemove', (e) => {
        if (!track) return;
        
        if (!isDragging) {
            // Efek Paralaks Bidang Gambar Asimetris
            const mouseX = (e.clientX / window.innerWidth) - 0.5;
            const mouseY = (e.clientY / window.innerHeight) - 0.5;
            cards.forEach(card => {
                const speed = parseFloat(card.getAttribute('data-speed'));
                gsap.to(card, {
                    x: currentX + (mouseX * speed * 700),
                    y: mouseY * speed * 350,
                    rotation: mouseX * speed * 12,
                    duration: 0.6
                });
            });
            return;
        }
        
        targetX = e.clientX - startX;
        targetX = Math.min(0, Math.max(targetX, -1300)); // Pembatas jangkauan seret
        currentX = targetX;
        
        gsap.to(track, { x: currentX, duration: 0.5, ease: "power2.out" });

        // Otomatis pindah ke Bagian 3 jika track ditarik sampai habis ujung kanan
        if (currentX <= -1250) {
            switchPage('profile-section');
        }
    });
}

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

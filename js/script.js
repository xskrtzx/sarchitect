import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';


// Tambahkan variabel navigasi di bagian paling atas file script.js
let currentX = 0;
let targetX = 0;
let isDragging = false;
let startX = 0;

// Cari bagian fungsi klik `trigger.addEventListener('click', ...)` 
// GANTI properti `onComplete` di dalam timeline GSAP Anda dengan struktur berikut ini:

    const tl = gsap.timeline({
        onComplete: () => {
           // Mengubah latar belakang menjadi putih sesaat untuk efek flash portal
            scene.background = new THREE.Color(0xf5f5f5);
            
            // OTOMATIS BERPINDAH KE FILE PORTFOLIO.HTML
            window.location.href = "portfolio.html";
        }
    });

// ================= LOGIKA NAVIGASI HORIZONTAL & PARALAKS ASIMETRIS =================
function initPortfolioMechanics() {
    const track = document.getElementById('track');
    const cards = document.querySelectorAll('.project-card');
    const ticker = document.getElementById('coord-ticker');
    
    // Ticker Koordinat Bergerak Loop di Latar Belakang
    setInterval(() => {
        let text = ticker.innerText;
        ticker.innerText = text.substring(1) + text.substring(0, 1);
    }, 50);

    // Navigasi Menggunakan Geser Mouse (Horizontal Drag)
    window.addEventListener('mousedown', (e) => {
        isDragging = true;
        startX = e.clientX - currentX;
        track.style.cursor = 'grabbing';
    });

    window.addEventListener('mousemove', (e) => {
        if (!isDragging) {
            // EFEK PARALAKS MOUSE DIAGONAL (Saat cursor digerakkan tanpa drag)
            const mouseX = (e.clientX / window.innerWidth) - 0.5;
            const mouseY = (e.clientY / window.innerHeight) - 0.5;
            
            cards.forEach(card => {
                const speed = parseFloat(card.getAttribute('data-speed'));
                // Menggeser bidang foto secara asimetris berdasarkan kecepatan elemen masing-masing
                gsap.to(card, {
                    x: currentX + (mouseX * speed * 800),
                    y: mouseY * speed * 400,
                    rotation: mouseX * speed * 15,
                    duration: 0.5,
                    ease: "power1.out"
                });
            });
            return;
        }
        
        // Eksekusi Translasi Sumbu Track saat melakukan Dragging
        targetX = e.clientX - startX;
        // Batasi geseran agar track tidak hilang keluar batas layar luar
        targetX = Math.min(0, Math.max(targetX, -1200)); 
        currentX = targetX;
        
        gsap.to(track, {
            x: currentX,
            duration: 0.6,
            ease: "power2.out"
        });
    });

    window.addEventListener('mouseup', () => {
        isDragging = false;
        track.style.cursor = 'grab';
    });

    // AKSES LOGIKA MENUJU BAGIAN 3 (OTOMATIS TERBUKA JIKA TRACK DI-DRAG SAMPAI UJUNG KANAN)
    window.addEventListener('mousemove', () => {
        if (currentX <= -1150) {
            // Jika geseran sudah mentok kanan, munculkan halaman profil arsitektur
            document.getElementById('portfolio-section').classList.add('hidden-section');
            document.getElementById('profile-section').classList.remove('hidden-section');
        }
    });
}




// Scene
const container = document.getElementById('canvas-container');
const statusText = document.getElementById('text');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0a0a0a);

// Camera
const camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    100
);
camera.position.set(0, 0, 4);

// Renderer
const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: false
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1;

container.appendChild(renderer.domElement);

// Lighting
scene.add(new THREE.AmbientLight(0xffffff, 1));
const hemi = new THREE.HemisphereLight(0xffffff, 0x444444, 1.5);
hemi.position.set(0, 20, 0);
scene.add(hemi);

const dir = new THREE.DirectionalLight(0xffffff, 2);
dir.position.set(5, 5, 5);
scene.add(dir);

// =======================
// Loader
// =======================
const loader = new GLTFLoader();
let sLogo = null;
let logoSize = 1;
let isTransitioning = false;
let isIntroFinished = false; // Penanda agar animasi bernapas tidak menggagalkan intro GSAP

loader.load(
    "assets/logo-s.glb",
    (gltf) => {
        sLogo = gltf.scene;

        // Center object
        const box = new THREE.Box3().setFromObject(sLogo);
        const center = box.getCenter(new THREE.Vector3());
        sLogo.position.sub(center);

        // Auto scale
        logoSize = box.getSize(new THREE.Vector3()).length();
        const targetScale = 2 / logoSize;

        // Shadow
        sLogo.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });

        scene.add(sLogo);      
        
        // Mulai dari skala 0
        sLogo.scale.setScalar(0);
        
        // Animasi Intro Logo Muncul
        gsap.to(sLogo.scale, {
            x: targetScale,
            y: targetScale,
            z: targetScale,
            duration: 1.5,
            ease: "back.out(2)",
            onComplete: () => {
                isIntroFinished = true; // Aktifkan efek bernapas setelah intro selesai
            }
        });
        
        statusText.innerHTML = "Klik Logo S untuk Masuk";
        gsap.to("#corner-nav", {
            opacity: 1,
            duration: 2,
            ease: "power2.out"
        });
        console.log("GLB Loaded");
    },
    (xhr) => {
        if (xhr.lengthComputable) {
            const percent = Math.round((xhr.loaded / xhr.total) * 100);
            statusText.innerHTML = `Memuat ${percent}%`;
        } else {
            statusText.innerHTML = "Memuat...";
        }
    },
    (err) => {
        console.error(err);
        statusText.innerHTML = "Logo gagal dimuat";
    }
);

// Animation Loop
const clock = new THREE.Clock();
function animate() {
    requestAnimationFrame(animate);
    
    if (sLogo && !isTransitioning) {
        const t = clock.getElapsedTime();
        
        // Efek Rotasi Idle
        sLogo.rotation.y = t * 0.45;
        sLogo.rotation.x = Math.sin(t * 0.8) * 0.08;
        
        // Efek Bernapas (Hanya jalan setelah animasi intro GSAP selesai)
        if (isIntroFinished) {
            const breathe = 1 + Math.sin(t * 1.5) * 0.02;
            sLogo.scale.setScalar((2 / logoSize) * breathe);
        }
    }
    renderer.render(scene, camera);
}
animate();

// Corner Animation
const cornerAnimation = gsap.timeline({ repeat: -1 });
cornerAnimation
.to(".top-left", { y: -5, duration: 3, yoyo: true, repeat: 1, ease: "sine.inOut" }, 0)
.to(".top-right", { x: 8, duration: 5, yoyo: true, repeat: 1, ease: "sine.inOut" }, 0)
.to(".bottom-right", { opacity: 0.55, duration: 1.2, yoyo: true, repeat: 1, ease: "power1.inOut" }, 0);

// THE MIND Glitch
function glitchMind() {
    gsap.timeline()
    .to(".bottom-left", { x: -3, duration: 0.03 })
    .to(".bottom-left", { x: 4, duration: 0.03 })
    .to(".bottom-left", { x: 0, duration: 0.03 });
}
setInterval(glitchMind, 12000);

// Portal Animation
const trigger = document.getElementById("portal-trigger");
if (trigger) {
    trigger.addEventListener("click", () => {
        if (!sLogo || isTransitioning) return;
        isTransitioning = true;
        statusText.style.opacity = 0;
        cornerAnimation.pause();
        
        const tl = gsap.timeline({
            onComplete: () => {
                // Mengubah latar belakang menjadi putih sesaat untuk efek flash portal
                scene.background = new THREE.Color(0xf5f5f5);
                // OTOMATIS BERPINDAH KE FILE PORTFOLIO.HTML
                window.location.href = "portfolio.html";
            }
        });
        
        // Animasi Logo berputar cepat
        tl.to(sLogo.rotation, {
            y: Math.PI * 4,
            x: 0,
            duration: 2,
            ease: "power2.inOut"
        }, 0);
        
        // Kamera maju kedepan
        tl.to(camera.position, {
            z: -1,
            duration: 2,
            ease: "expo.in"
        }, 0);
        
        // Kamera mengubah FOV (Efek Warp/Hyperdrive)
        tl.to(camera, {
            fov: 140,
            duration: 2,
            ease: "expo.in",
            onUpdate() {
                camera.updateProjectionMatrix();
            }
        }, 0);

        // ===== Animasi sudut keluar layar =====
        tl.to(".top-left", { x: -350, y: -120, opacity: 0, duration: 2, ease: "expo.in" }, 0);
        tl.to(".top-right", { x: 350, y: -120, opacity: 0, duration: 2, ease: "expo.in" }, 0);
        tl.to(".bottom-left", { x: -350, y: 120, opacity: 0, duration: 2, ease: "expo.in" }, 0);
        tl.to(".bottom-right", { x: 350, y: 120, opacity: 0, duration: 2, ease: "expo.in" }, 0);
    });
}

// Resize Browser
window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

// Cursor Hover
document.querySelectorAll(".corner").forEach(item => {
    item.addEventListener("mouseenter", () => {
        document.body.style.cursor = "pointer";
    });
    item.addEventListener("mouseleave", () => {
        document.body.style.cursor = "default";
    });
});

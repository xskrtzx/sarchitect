import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// =====================================================
// SETUP SCENE
// =====================================================

const container = document.getElementById("canvas-container");
const statusText = document.getElementById("text");

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0a0a0a);

// Camera
const camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    100
);

camera.position.set(0, 0, 5);

// Renderer
const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: false
});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.shadowMap.enabled = true;

container.appendChild(renderer.domElement);

// =====================================================
// LIGHTING
// =====================================================

scene.add(new THREE.AmbientLight(0xffffff, 0.8));

const hemisphereLight = new THREE.HemisphereLight(
    0xffffff,
    0x444444,
    1.2
);
hemisphereLight.position.set(0, 20, 0);
scene.add(hemisphereLight);

const directionalLight = new THREE.DirectionalLight(
    0xffffff,
    2
);

directionalLight.position.set(5, 8, 6);
directionalLight.castShadow = true;

scene.add(directionalLight);

// =====================================================
// LOAD MODEL
// =====================================================

const loader = new GLTFLoader();

let sLogo = null;
let isTransitioning = false;

loader.load(

    "logo-s.glb",

    (gltf) => {

        sLogo = gltf.scene;

        // Aktifkan shadow
        sLogo.traverse((child) => {

            if (child.isMesh) {

                child.castShadow = true;
                child.receiveShadow = true;

            }

        });

        // Hitung bounding box
        const box = new THREE.Box3().setFromObject(sLogo);

        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());

        // Pusatkan model
        sLogo.position.sub(center);

        // Skala otomatis
        const maxDim = Math.max(size.x, size.y, size.z);

        if (maxDim > 0) {

            const scale = 2.2 / maxDim;
            sLogo.scale.setScalar(scale);

        }

        scene.add(sLogo);

        statusText.textContent = "Klik Logo S untuk Masuk";

        console.log("Model berhasil dimuat.");

    },

    (xhr) => {

        if (xhr.total) {

            const percent = Math.round((xhr.loaded / xhr.total) * 100);

            statusText.textContent =
                `Memuat Model... ${percent}%`;

        }

    },

    (error) => {

        console.error(error);

        statusText.textContent =
            "Gagal memuat file logo-s.glb";

    }

);

// =====================================================
// ANIMATION LOOP
// =====================================================

const clock = new THREE.Clock();

function animate() {

    requestAnimationFrame(animate);

    if (sLogo && !isTransitioning) {

        const t = clock.getElapsedTime();

        sLogo.rotation.y = t * 0.5;

        sLogo.rotation.x = Math.sin(t * 0.8) * 0.08;

    }

    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);

}

animate();

// =====================================================
// PORTAL TRANSITION
// =====================================================

const trigger = document.getElementById("portal-trigger");

trigger.addEventListener("click", () => {

    if (!sLogo || isTransitioning) return;

    isTransitioning = true;

    statusText.style.opacity = "0";

    const timeline = gsap.timeline({

        onComplete: () => {

            scene.background = new THREE.Color(0xf5f5f5);

            alert(
                "Berhasil menembus objek 3D!\nSelamat datang di Portofolio Arsitektur."
            );

        }

    });

    timeline.to(

        sLogo.rotation,

        {

            x: 0,

            y: Math.PI * 4,

            duration: 1.8,

            ease: "power2.inOut"

        },

        0

    );

    timeline.to(

        camera.position,

        {

            z: 0.3,

            duration: 1.8,

            ease: "expo.in"

        },

        0

    );

    timeline.to(

        camera,

        {

            fov: 120,

            duration: 1.8,

            ease: "expo.in",

            onUpdate: () => {

                camera.updateProjectionMatrix();

            }

        },

        0

    );

});

// =====================================================
// RESIZE
// =====================================================

window.addEventListener("resize", () => {

    camera.aspect = window.innerWidth / window.innerHeight;

    camera.updateProjectionMatrix();

    renderer.setSize(
        window.innerWidth,
        window.innerHeight
    );

});

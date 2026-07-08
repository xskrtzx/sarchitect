import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// =======================
// Scene
// =======================

const container = document.getElementById('canvas-container');
const statusText = document.getElementById('text');

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0a0a0a);

// =======================
// Camera
// =======================

const camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    100
);

camera.position.set(0, 0, 4);

// =======================
// Renderer
// =======================

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

// =======================
// Lighting
// =======================

scene.add(new THREE.AmbientLight(0xffffff, 1));

const hemi = new THREE.HemisphereLight(
    0xffffff,
    0x444444,
    1.5
);

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
let isTransitioning = false;

loader.load(

    "assets/logo-s.glb",

    (gltf) => {

        sLogo = gltf.scene;

        // Center object
        const box = new THREE.Box3().setFromObject(sLogo);
        const center = box.getCenter(new THREE.Vector3());

        sLogo.position.sub(center);

        // Auto scale
        const size = box.getSize(new THREE.Vector3()).length();

        if (size > 0) {

            const scale = 2 / size;

            sLogo.scale.setScalar(scale);

        }

        // Shadow
        sLogo.traverse((child) => {

            if (child.isMesh) {

                child.castShadow = true;
                child.receiveShadow = true;

            }

        });

        scene.add(sLogo);

        statusText.innerHTML = "Klik Logo S untuk Masuk";
        gsap.to("#corner-nav",{
            opacity:1,
            duration:1.5,
            delay:0.5
        });
        console.log("GLB Loaded");

    },

    (xhr) => {

        if (xhr.lengthComputable) {

            const percent = Math.round(
                xhr.loaded / xhr.total * 100
            );

            statusText.innerHTML =
                `Memuat ${percent}%`;

        } else {

            statusText.innerHTML = "Memuat...";

        }

    },

    (err) => {

        console.error(err);

        statusText.innerHTML =
            "Logo gagal dimuat";

    }

);

// =======================
// Animation
// =======================

const clock = new THREE.Clock();

function animate() {

    requestAnimationFrame(animate);

    if (sLogo && !isTransitioning) {

        const t = clock.getElapsedTime();

        sLogo.rotation.y = t * 0.5;

        sLogo.rotation.x = Math.sin(t) * 0.08;

    }

    renderer.render(scene, camera);

}

animate();

// =======================
// Portal Animation
// =======================

const trigger = document.getElementById("portal-trigger");

trigger.addEventListener("click", () => {

    if (!sLogo || isTransitioning) return;

    isTransitioning = true;

    statusText.style.opacity = 0;

    const tl = gsap.timeline({

        onComplete: () => {

            scene.background = new THREE.Color(0xf5f5f5);

            alert("Selamat datang di S Architect");

        }

    });

    tl.to(

        sLogo.rotation,

        {

            y: Math.PI * 4,

            x: 0,

            duration: 2,

            ease: "power2.inOut"

        },

        0

    );

    tl.to(

        camera.position,

        {

            z: -1,

            duration: 2,

            ease: "expo.in"

        },

        0

    );

    tl.to(

        camera,

        {

            fov: 140,

            duration: 2,

            ease: "expo.in",

            onUpdate() {

                camera.updateProjectionMatrix();

            }

        },

        0

    );

});

// =======================
// Resize
// =======================

window.addEventListener("resize", () => {

    camera.aspect =
        window.innerWidth / window.innerHeight;

    camera.updateProjectionMatrix();

    renderer.setSize(
        window.innerWidth,
        window.innerHeight
    );

    renderer.setPixelRatio(
        Math.min(window.devicePixelRatio, 2)
    );

});

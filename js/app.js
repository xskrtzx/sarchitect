import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.166/build/three.module.js";

const scene = new THREE.Scene();

scene.background = new THREE.Color(0x050505);

const camera = new THREE.PerspectiveCamera(
60,
window.innerWidth/window.innerHeight,
0.1,
1000
);

camera.position.z = 8;

const renderer = new THREE.WebGLRenderer({
antialias:true
});

renderer.setSize(
window.innerWidth,
window.innerHeight
);

document
.getElementById("scene")
.appendChild(renderer.domElement);

const ambient = new THREE.AmbientLight(
0xffffff,
1.5
);

scene.add(ambient);

const rim = new THREE.DirectionalLight(
0xc7ff00,
4
);

rim.position.set(3,4,5);

scene.add(rim);

/*
S Monument
sementara berupa torus ganda
*/

const material =
new THREE.MeshStandardMaterial({

color:0x999999,

metalness:.4,

roughness:.9

});

const topRing =
new THREE.Mesh(

new THREE.TorusGeometry(
1.2,
0.25,
32,
100
),

material

);

topRing.position.y=1;

scene.add(topRing);

const bottomRing =
new THREE.Mesh(

new THREE.TorusGeometry(
1.2,
0.25,
32,
100
),

material

);

bottomRing.position.y=-1;

scene.add(bottomRing);

let mouseX=0;
let mouseY=0;

window.addEventListener(
"mousemove",
(e)=>{

mouseX=
(e.clientX/window.innerWidth-.5);

mouseY=
(e.clientY/window.innerHeight-.5);

}
);

let blueprint=false;

document
.getElementById("blueprint")
.addEventListener("click",()=>{

blueprint=!blueprint;

if(blueprint){

scene.background=
new THREE.Color(0x001f4d);

material.wireframe=true;

}else{

scene.background=
new THREE.Color(0x050505);

material.wireframe=false;

}

});

window.addEventListener(
"click",
()=>{

camera.position.z=3;

}
);

function animate(){

requestAnimationFrame(animate);

topRing.rotation.y+=0.003;
bottomRing.rotation.y-=0.003;

scene.rotation.y=
mouseX*0.4;

scene.rotation.x=
mouseY*0.2;

renderer.render(
scene,
camera
);

}

animate();

window.addEventListener(
"resize",
()=>{

camera.aspect=
window.innerWidth/window.innerHeight;

camera.updateProjectionMatrix();

renderer.setSize(
window.innerWidth,
window.innerHeight
);

}
);

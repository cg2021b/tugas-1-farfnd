import * as THREE from 'https://threejsfundamentals.org/threejs/resources/threejs/r132/build/three.module.js';
import {OrbitControls} from 'https://threejsfundamentals.org/threejs/resources/threejs/r132/examples/jsm/controls/OrbitControls.js';

let scene, camera, renderer;
    
// 1. Scene
scene = new THREE.Scene();
scene.background = new THREE.Color(0x505050);

// 2. Camera
const fov = 75;
const aspectRatio = window.innerWidth / window.innerHeight;
const near = 0.1;
const far = 1000;
camera = new THREE.PerspectiveCamera( fov, aspectRatio , near, far );
camera.position.set(10, 10, 150);    

// 3. Lights
let lights = []

lights.push( new THREE.PointLight(0xFFFFFF, 1));
lights[0].position.set(0, 100, 0);
lights.push( new THREE.PointLight(0xFFFFFF, 0.25));
lights[1].position.set(-100, -100, -100);
lights.push( new THREE.AmbientLight(0x555555, 1));

scene.add(...lights); 

// 4. Renderer
let canvas = document.querySelector('#myCanvas');
renderer = new THREE.WebGLRenderer({canvas, antialias: true});   
renderer.setSize(window.innerWidth, window.innerHeight);
const controls = new OrbitControls(camera, canvas);

// 5. Objects
controls.target.set(0, Math.round( Math.pow(300, 1/3)/2 ), 0);
controls.update();

let objects = [];
let timeout = 1000;

function generateBall() {
    let red = Math.floor(Math.random() * 2) * 128 + 128;
    let green = Math.floor(Math.random() * 2) * 128 + 128;
    let blue = Math.floor(Math.random() * 2) * 128 + 96;
    
    const radius = 8; 
    const geometry = new THREE.SphereGeometry(radius, 16, 16);
    const material = new THREE.MeshPhongMaterial({color: `rgb(${red}, ${green}, ${blue})`, shininess: 100});
    const sphere = new THREE.Mesh(geometry, material);

    let posX = (Math.random() - 0.5) * 400;
    let posY = (Math.random() - 0.5) * 300;
    let posZ = (Math.random() - 0.5) * 500;

    sphere.position.set(posX, posY, posZ);

    scene.add(sphere);
    objects.push(sphere);

    if(objects.length < 300) {
        timeout = (timeout / 10) * 9;
        setTimeout(generateBall, timeout);
    }
}
generateBall();

function resizeRendererToDisplaySize(renderer) {
    const canvas = renderer.domElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const needResize = canvas.width !== width || canvas.height !== height;
    if (needResize)
        renderer.setSize(width, height, false);
    return needResize;
}

// 6. Raycasting
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let benda1, benda2, score = 0;

function onMouseMove(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

function onMouseHover() {
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children, false);

    if (intersects.length > 0) {
        intersects[0].object.material.transparent = true;
        intersects[0].object.material.opacity = 0.5;
    }
}

function calculateScore()
{
    for(let i = 0; i < scene.children.length; i++)
    {
        if(scene.children[i].material)
        {
            if(benda2 && benda1)
            {
                if(benda1.material.color.getHex() === benda2.material.color.getHex())
                {
                    scene.remove(benda1);
                    scene.remove(benda2);
                    score++;
                    document.getElementById("score").innerHTML = `Score: <b>${score}</b>`;
                }
                benda1 = null;
                benda2 = null;
            }

            if (scene.children[i] == benda1 || scene.children[i] == benda2)
                scene.children[i].material.opacity = 0.5;
            else
                scene.children[i].material.opacity = 1.0;
        }
    }

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children, false);

    if(intersects.length > 0) intersects[0].object.material.transparent = true;
}

function onClick() {
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children);
    
    if(intersects.length > 0) {
        if(!benda1 && !benda2) {
            benda1 = intersects[0].object;
        }

        else if(benda1 &&!benda2 && intersects[0].object != benda1) {
            benda2 = intersects[0].object;
        }

        else if(benda1 && benda2) {
            benda1 = intersects[0].object;
            benda2 = null;
        }
    }

    else {
        benda1 = null;
        benda2 = null;
    }
}

window.addEventListener("mousemove", onMouseMove, false);
window.addEventListener("click", onClick);

function mainLoop() {
    if (resizeRendererToDisplaySize(renderer)) {
        const canvas = renderer.domElement;
        camera.aspect = canvas.clientWidth / canvas.clientHeight ;
        camera.updateProjectionMatrix();
    }

    calculateScore();
    onMouseHover();

    renderer.render( scene, camera );
    requestAnimationFrame( mainLoop );
}

requestAnimationFrame( mainLoop );

mainLoop();
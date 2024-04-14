import * as THREE from 'three';

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as dat from 'dat.gui';
import {RGBELoader} from 'three/examples/jsm/loaders/RGBELoader.js';
import { myAnaglyphEffect } from './effect.js';
import { DeviceOrientationControls } from './DeviceOrient.js';

import { SteerControls } from './steerOrient.js';

//import { VRButton } from 'three/examples/jsm/webxr/VRButton.js';

let effect;

const hdrTextureURL = new URL('../img/Env1.hdr', import.meta.url)

const renderer = new THREE.WebGLRenderer();

renderer.shadowMap.enabled = true; //enable shadow

renderer.setSize(window.innerWidth, window.innerHeight);
const container = document.getElementById('ThreeJsCanvas')
container.appendChild(renderer.domElement);

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
    45, //field of view
    window.innerWidth / window.innerHeight, //aspect ratio
    0.1, //near
    1000 //far
);
camera.position.set(-10, 30, 30);

//controls
let controls
controls = new SteerControls(camera);


//HDR img loader
const loader = new RGBELoader();
loader.load(hdrTextureURL, function(texture) {
    texture.mapping = THREE.EquirectangularReflectionMapping;
    scene.background = texture;
    scene.environment = texture
    //scene.environment.castShadow = true;
})


//Sphere
const sphereGeo = new THREE.SphereGeometry(6, 30, 30);
const sphereMat = new THREE.MeshStandardMaterial({
    roughness: 0.2,
    metalness:0.5
});
const sphere = new THREE.Mesh(sphereGeo, sphereMat);
//spheres.push(sphere);
scene.add(sphere);

const spheres = [];
const poolSize = 36;
let deactivationQueue = [];
const frameDelay = 2;
for (let i = 0; i < poolSize; i++) {
    const sphereSize = 0.6; // Or any size you prefer
    const sphereRGeo = new THREE.SphereGeometry(sphereSize, 16, 12);
    const sphereR = new THREE.Mesh(sphereRGeo, sphereMat);

    sphereR.visible = false; // Start with the sphere deactivated
    sphereR.frameCounter = 0;
    scene.add(sphereR); // Add the sphere to the scene
    spheres.push(sphereR);
}

function logScale(value, valueMin, valueMax, targetMin, targetMax) {
    // Ensure value is within min and max
    const clampedValue = Math.max(Math.min(value, valueMax), valueMin);
    // Normalize value on a 0-1 scale relative to its min/max
    const normalized = (clampedValue - valueMin) / (valueMax - valueMin);
    // Apply logarithmic scaling
    const logScaled = Math.log10(normalized + 1); // +1 to avoid log(0)
    // Map to target range
    return logScaled * (targetMax - targetMin) + targetMin;
}

// function expoScale(value, valueMin, valueMax, targetMin, targetMax) {
//     // Ensure value is within min and max
//     const clampedValue = Math.max(Math.min(value, valueMax), valueMin);
//     // Normalize value on a 0-1 scale relative to its min/max
//     const normalized = (clampedValue - valueMin) / (valueMax - valueMin);
//     // Apply exponential scaling
//     const expoScaled = Math.exp(normalized) - 1; // -1 to start at 0
//     // Adjust scale to fit target range
//     const scaledMax = Math.exp(1) - 1; // Maximum scale value based on e^1 - 1
//     return (expoScaled / scaledMax) * (targetMax - targetMin) + targetMin;
// }

function actSphere(){
    for (let i = 0; i < spheres.length; i++ ){
        if (!spheres[i].visible){
            spheres[i].position.x = Math.random() * 60 - 30;
            spheres[i].position.y = Math.random() * 60 - 30;
            spheres[i].position.z = Math.random() * 60 - 30;
            spheres[i].scale.x = spheres[i].scale.y = spheres[i].scale.z = Math.random() * 3 + 1;
            spheres[i].visible = true;
            return spheres[i];
            // Optionally reset other properties
            //return; // Deactivate one sphere at a time
        }
    }
    console.warn("Pool exhausted. Consider increasing pool size.");
    return null;
}

function adjustSpheres(cameraSpeed) {
    const desiredCount = Math.floor(logScale(cameraSpeed, 0, 300, 1, poolSize));
    const currentVisibleCount = spheres.filter(sphere => sphere.visible).length;
    const excessSpheres = currentVisibleCount - desiredCount;

    if (excessSpheres > 0) {
        // Add only a few spheres to the deactivation queue to ensure gradual deactivation
        spheres.filter(sphere => sphere.visible).slice(0, excessSpheres).forEach(sphere => {
            if (!deactivationQueue.find(entry => entry.sphere === sphere)) {
                deactivationQueue.push({ sphere: sphere, frameCounter: 0 });
            }
        });
    } else {
        // If the current count is less than the desired, activate additional spheres gradually
        for (let i = 0; i < -excessSpheres; i++) {
            actSphere(); // Consider adding a delay or condition here for more control
        }
    }
}




renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 2;

//effect
effect =  new myAnaglyphEffect(renderer);
effect.setSize( window.innerWidth, window.innerHeight);
effect.eyeSep = 0;

//GUI
const gui = new dat.GUI();

const options = {
    sphereColor: '#f7ecbd',
    wireframe: false,
    speed: 0.01,
    deviceSimulation: false
};

gui.addColor(options, 'sphereColor').onChange(function (e) {
    sphere.material.color.set(e);
});

gui.add(options, 'wireframe').onChange(function (e) {
    sphere.material.wireframe = e;
});

gui.add(options, 'speed', 0/*min val*/, 0.1/*max val*/);

gui.add(options, 'deviceSimulation').onChange(function(e) {
    initDeviceOrientationControls();
})

// Sphere bounce
let step = 0;

//MousePosition and Raycaster
const mousePosition = new THREE.Vector2();

window.addEventListener('mousemove', function (e) {
    mousePosition.x = (e.clientX / window.innerWidth) * 2 - 1;
    mousePosition.y = -(e.clientY / window.innerHeight) * 2 + 1;
});

//mouse interaction, raycast
const rayCaster = new THREE.Raycaster();

const sphereId = sphere.id; //use id to set change when intersects with camera-mouse raycaster

//camera speed
let cameraSpeed = 0;
let prevTime = performance.now();
let prevPosition = new THREE.Vector3().copy(camera.position);

//Animate
function animate(time) {
    const timer = 0.001 * Date.now();
    for ( let i = 0, il = spheres.length; i < il; i ++ ) {

        const sphere = spheres[ i ];

        sphere.position.x = 5 * Math.cos( timer + i );
        sphere.position.y = 5 * Math.sin( timer + i * 1.1 );

    }

    //camera speed
    //Prevent the camera to jump to high num
    const deltaTime = (time - prevTime)/1000;
    if (deltaTime > 0 && !isNaN(deltaTime)) { // Ensure deltaTime is positive and valid
        const currentPosition = new THREE.Vector3().copy(camera.position);
        const distance = prevPosition.distanceTo(currentPosition);

        cameraSpeed = (0.9 * cameraSpeed) + (0.1 * distance / deltaTime); // Apply smoothing

        prevPosition.copy(camera.position);
        prevTime = time;
    } else if (isNaN(deltaTime)) {
        // Skip the first frame's faulty deltaTime calculation, Prevent the camera to jump to high num
        prevTime = time;
    }
    // console.log(cameraSpeed);
    // const currentPosition = new THREE.Vector3().copy(camera.position);

    // const distance = prevPosition.distanceTo(currentPosition);

    // if (deltaTime > 0){
    //     cameraSpeed = distance / deltaTime;
    // }

    // prevTime = time;
    // prevPosition.copy(camera.position);

    adjustSpheres(cameraSpeed);

    // Process the deactivation queue
    if (deactivationQueue.length > 0) {
        const entry = deactivationQueue[0]; // Always work with the first entry
        entry.frameCounter++;

        if (entry.frameCounter >= frameDelay) {
            // Once the frame delay is reached, deactivate the sphere and remove the entry from the queue
            entry.sphere.visible = false;
            deactivationQueue.shift(); // Remove the first element from the queue
        }
    }

    if (cameraSpeed > 120){
        effect.eyeSep += 0.3;
        //spheresInstance = true;
    }
    else if (cameraSpeed <= 120){
        effect.eyeSep -= 0.05;
        // if (effect.eyeSep < 0){
        //     effect.eyeSep = 0
        // }
    }

    if (effect.eyeSep < 0){
        effect.eyeSep = 0
    } else if (effect.eyeSep > 10){
        effect.eyeSep -= 1
    }
    // console.log(effect.eyeSep)

    //sphere
    step += options.speed;
    sphere.position.y = 10 * Math.abs(Math.sin(step));

    rayCaster.setFromCamera(mousePosition, camera); //raycast for object selection, from camera to normalized mouse position
    const intersects = rayCaster.intersectObjects(scene.children); // contains all the objects intersects with the rays
    //console.log(intersects);

    for (let i = 0; i < intersects.length; i++) {
        if (intersects[i].object.id === sphereId)
            intersects[i].object.material.color.set(0xF7ECBD);
    }

    // Update controls if needed
    if (controls && controls.update) controls.update();

    //camera.lookAt( scene.position );

    //controls.update(); // GPT: For now, this does nothing but can be used for future enhancements like damping
    renderer.render(scene, camera);
    effect.render( scene, camera );
}

renderer.setAnimationLoop(animate);

window.addEventListener('resize', function(){
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
const GRID_DIMENSIONS = {
    x: 7,
    y: 7,
    z: 7
};
// grid offset to center grid at origin
const offset_x = Math.floor(GRID_DIMENSIONS.x / 2)
const offset_y = Math.floor(GRID_DIMENSIONS.y / 2)
const offset_z = Math.floor(GRID_DIMENSIONS.z / 2)

var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

window.addEventListener('resize', function() {
    var width = window.innerWidth;
    var height = window.innerHeight;
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
});

function makeGrid() {
    for (let i = 0 ; i< GRID_DIMENSIONS.x; i++) {
        for (let j = 0; j < GRID_DIMENSIONS.y; j++) {
            for (let k = 0; k < GRID_DIMENSIONS.z; k++) {
                const geometry = new THREE.BoxGeometry(1,1,1);
                const edgesGeometry = new THREE.EdgesGeometry( geometry );
                const wireframe = new THREE.LineSegments( edgesGeometry,
                    new THREE.LineBasicMaterial( { color: 0x999999, transparent: true, opacity: 0.02 } ) ); 
                wireframe.position.set(i-offset_x,j-offset_y,k-offset_z);
                scene.add(wireframe);
            }
        }
    }
}
makeGrid()
var axesHelper = new THREE.AxesHelper( 5 );
scene.add( axesHelper );

camera.position.set(8,2,8);
camera.lookAt(0,0,0);

const rotateAxis = new THREE.Vector3(0, 1, 0);
const rotationMatrix = new THREE.Matrix4();
rotationMatrix.makeRotationY(Math.PI/1024)

const snake = new Snake(0,0,0, 5);
snake.registerKeybindings();
scene.add(snake.group)

// game logic
var update = function() {
    camera.position.applyMatrix4(rotationMatrix);
    smoothFollow();
    // camera.lookAt(head.x, head.y, head.z);
    snake.update();
};

function smoothFollow() {
    const qat = camera.quaternion;
    const eye = camera.position;
    const head = snake.getHead()
    const center = new THREE.Vector3(head.x, head.y, head.z)
    const m = new THREE.Matrix4();
    m.lookAt(eye, center, new THREE.Vector3(0,1,0))
    const qat2 = new THREE.Quaternion()
    qat2.setFromRotationMatrix(m);
    camera.quaternion.slerp(qat2, 0.04)
}

// draw scene
var render = function() {
    renderer.render(scene, camera);
};

// run game loop (update, render, repeat)
var GameLoop = function() {
    update();
    render();
    if (snake.state == "ALIVE") {
        requestAnimationFrame(GameLoop);
    } else {
        alert(`Score: ${snake.score}`)
    }
};

GameLoop();

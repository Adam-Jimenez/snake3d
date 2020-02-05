const SNAKE_MOVE_DELAY = 1000; // milis

class Snake {
    constructor(x,y,z, length=3) {
        this.direction = new THREE.Vector3( 1, 0, 0 );
        this.normal = new THREE.Vector3(0, 1, 0);
        this.leftRight = new THREE.Vector3(0, 0, 1);
        this.body = []
        this.body.push({ x, y, z })
        this.lastUpdate = new Date().getTime();
        this.group = new THREE.Object3D();
        this.refreshGroup();
        this.length = length;
    }
    getHead() {
        return this.body[this.body.length-1]
    }
    getTail() {
        return this.body[0]
    }
    registerKeybindings() {
        document.addEventListener('keyup', (e) => {
            if (e.code === "ArrowUp") {
                this.rotateUp();
            }        
            else if (e.code === "ArrowDown") {
                this.rotateDown();
            }
            else if (e.code === "ArrowLeft") {
                this.rotateLeft();
            }
            else if (e.code === "ArrowRight") {
                this.rotateRight();
            }
        });
    }
    rotateLeft() {
        this.direction.applyAxisAngle(this.normal, Math.PI/2)
        this.leftRight.applyAxisAngle(this.normal, Math.PI/2)
    }
    rotateRight() {
        this.direction.applyAxisAngle(this.normal, -Math.PI/2)
        this.leftRight.applyAxisAngle(this.normal, -Math.PI/2)
    }
    rotateUp() {
        this.direction.applyAxisAngle(this.leftRight, Math.PI/2)
        this.normal.applyAxisAngle(this.leftRight, Math.PI/2)
    }
    rotateDown() {
        this.direction.applyAxisAngle(this.leftRight, -Math.PI/2)
        this.normal.applyAxisAngle(this.leftRight, -Math.PI/2)
    }
    move() {
        const { x, y, z } = this.getHead();
        const dx = this.direction.x;
        const dy = this.direction.y;
        const dz = this.direction.z;
        this.body.push({ x:x+dx, y:y+dy, z:z+dz });
        if (this.body.length > this.length) {
            this.body.splice(0, 1);
        }
    }
    update() {
        const now = new Date().getTime() 
        if (now - this.lastUpdate >= SNAKE_MOVE_DELAY) {
            this.lastUpdate = now
            this.move();
            this.refreshGroup()
        }
    }
    refreshGroup() {
        // clear object group
        for (let i = this.group.children.length-1; i >= 0; i--) {
            this.group.remove(this.group.children[i])
        }
        // recreate body parts
        for (let i = 0; i < this.body.length; i++) {
            const { x, y, z } = this.body[i]
            const bodyPart = this.makeBodyPart(x, y, z)
            this.group.add(bodyPart)
        }
        const direction = new THREE.ArrowHelper( this.direction, this.getHead(), 2, 0xFF0000);
        const normal = new THREE.ArrowHelper( this.normal, this.getHead(), 2, 0x00FF00);
        const leftRight = new THREE.ArrowHelper( this.leftRight, this.getHead(), 2, 0x0000FF);
        this.group.add(direction);
        this.group.add(normal);
        this.group.add(leftRight);
    }

    makeBodyPart(x,y,z) {
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const material = new THREE.MeshBasicMaterial({ color: 0x00FF00, transparent: true, opacity: 0.5});
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(x,y,z);
        return mesh
    }
}

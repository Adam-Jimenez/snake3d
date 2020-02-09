const states = {
    ALIVE: "ALIVE",
    DEAD: "DEAD"
}

class Snake {
    constructor(x,y,z, length=3) {
        this.score = 0;
        this.moveDelay = 1000;
        this.state = states.ALIVE
        this.direction = new THREE.Vector3( 1, 0, 0 );
        this.normal = new THREE.Vector3(0, 1, 0);
        this.leftRight = new THREE.Vector3(0, 0, 1);
        this.body = []
        this.body.push({ x, y, z })
        this.lastUpdate = new Date().getTime();
        this.group = new THREE.Object3D();
        this.spawnFood();
        this.refreshGroup();
        this.length = length;
        this.queueRotationFunction = () => {}
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
                this.queueRotationFunction = this.rotateUp
            }        
            else if (e.code === "ArrowDown") {
                this.queueRotationFunction = this.rotateDown
            }
            else if (e.code === "ArrowLeft") {
                this.queueRotationFunction = this.rotateLeft
            }
            else if (e.code === "ArrowRight") {
                this.queueRotationFunction = this.rotateRight
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
    wrapPosition(pos) {
        if (pos.x < -offset_x) {
            pos.x = GRID_DIMENSIONS.x - offset_x - 1
        }
        if (pos.y < -offset_y) {
            pos.y = GRID_DIMENSIONS.y - offset_y - 1
        }
        if (pos.z < -offset_z) {
            pos.z = GRID_DIMENSIONS.z - offset_z - 1
        }

        if (pos.x >= GRID_DIMENSIONS.x - offset_x) {
            pos.x = -offset_x
        }
        if (pos.y >= GRID_DIMENSIONS.y - offset_y) {
            pos.y = -offset_y
        }
        if (pos.z >= GRID_DIMENSIONS.z - offset_z) {
            pos.z = -offset_z
        }
        return pos
    }
    move() {
        const { x, y, z } = this.getHead();
        const dx = this.direction.x;
        const dy = this.direction.y;
        const dz = this.direction.z;
        const newPart = this.wrapPosition({ 
            x:Math.round(x+dx),
            y:Math.round(y+dy),
            z:Math.round(z+dz)
        })

        this.body.push(newPart);
        if (this.body.length > this.length) {
            this.body.splice(0, 1);
        }
        for (let i = 0; i<this.body.length-1; i++) {
            const part = this.body[i]
            if (part.x == newPart.x && part.y == newPart.y && part.z == newPart.z) {
                this.state = states.DEAD;
                break;
            }
        }
    }
    update() {
        const now = new Date().getTime() 
        if (now - this.lastUpdate >= this.moveDelay) {
            this.lastUpdate = now
            this.queueRotationFunction()
            this.queueRotationFunction = () => {}
            this.move();
            const head = this.getHead()
            const food = this.food
            if (head.x === food.x && head.y===food.y && head.z===food.z) {
                this.score += 1;
                this.length += 1;
                this.moveDelay = Math.max(this.moveDelay-50, 200);
                this.spawnFood();
            }
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
        const food = this.makeFood(this.food.x, this.food.y, this.food.z);
        this.group.add(food);

        const direction = new THREE.ArrowHelper( this.direction, this.getHead(), 2, 0xFF0000);
        const normal = new THREE.ArrowHelper( this.normal, this.getHead(), 2, 0x00FF00);
        const leftRight = new THREE.ArrowHelper( this.leftRight, this.getHead(), 2, 0x0000FF);
        this.group.add(direction);
        this.group.add(normal);
        this.group.add(leftRight);
    }

    makeBodyPart(x,y,z) {
        const color = this.state == states.ALIVE ? 0x00FF00 : 0xFF0000
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const material = new THREE.MeshBasicMaterial({ color: color, transparent: true, opacity: 0.5});
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(x,y,z);
        return mesh
    }
    makeFood(x,y,z) {
        const color = 0xFFFF00;
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const material = new THREE.MeshBasicMaterial({ color: color, transparent: true, opacity: 0.5});
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(x,y,z);
        return mesh
    }

    spawnFood() {
        const validPositions = [];
        for (let i = -offset_x; i< GRID_DIMENSIONS.x-offset_x; i++) {
            for (let j = -offset_y; j<GRID_DIMENSIONS.y-offset_y; j++) {
                for (let k = -offset_z; k<GRID_DIMENSIONS.z-offset_z; k++) {
                    const pos = { x: i, y: j, z: k};
                    if (this.body.filter(part => part.x === pos.x && part.y == pos.y && part.z == pos.z).length == 0) {
                        validPositions.push(pos);
                    }
                }
            }
        }
        if (validPositions.length == 0) {
            console.log("GG!");
        }
        const randomPosition = validPositions[Math.floor(Math.random() * validPositions.length)]
        this.food = randomPosition
        console.log(validPositions)
    }
}

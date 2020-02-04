const SNAKE_MOVE_DELAY = 1000; // milis

class Snake {
    constructor(x,y,z, length=3) {
        this.direction = { x: 1, y: 0, z: 0 }
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
            console.log(this.body)
        }
    }
    refreshGroup() {
            // clear object group
            for (let i = 0; i < this.group.children.length; i++) {
                this.group.remove(this.group.children[i])
            }
            // recreate body parts
            for (let i = 0; i < this.body.length; i++) {
                const { x, y, z } = this.body[i]
                const bodyPart = this.makeBodyPart(x, y, z)
                this.group.add(bodyPart)
            }
    }

    makeBodyPart(x,y,z) {
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const material = new THREE.MeshBasicMaterial({ color: 0x00FF00, transparent: true, opacity: 0.5});
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(x,y,z);
        return mesh
    }
}

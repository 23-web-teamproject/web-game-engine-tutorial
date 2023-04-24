import Vector from "/src/engine/data-structure/vector.js";

export default class RigidBody {
  constructor() {
    this.mass = 1;
    if (this.mass === 0) {
      this.inverseMass = 0;
    } else {
      this.inverseMass = 1 / this.mass;
    }
    this.velocity = new Vector(0, 0);
    this.acceleration = new Vector(0, 0);
    this.bounceness = 0.5;
    this.isStatic = false;
  }
}

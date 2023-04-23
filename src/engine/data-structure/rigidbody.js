import Vector from "/src/engine/data-structure/vector.js";

export default class RigidBody {
  constructor() {
    this.mass = 1;
    this.inverseMass = 1 / this.mass;
    this.velocity = new Vector(0, 0);
    this.acceleration = new Vector(0, 0);
    this.bounceness = 0.5;
    this.isStatic = false;
  }
}

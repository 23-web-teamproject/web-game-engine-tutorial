import Vector from "/src/engine/data-structure/vector.js";
import { clamp } from "/src/engine/utils.js";

export default class RigidBody {
  constructor(options = {}) {
    if (typeof options.mass === "number") {
      this.mass = clamp(options.mass, 0.1, 10);
    } else {
      this.mass = 1;
    }

    if (this.mass === 0) {
      this.inverseMass = 0;
    } else {
      this.inverseMass = 1 / this.mass;
    }

    if (typeof options.bounceness === "number") {
      this.bounceness = clamp(options.bounceness, 0, 1);
    } else {
      this.bounceness = 0.5;
    }

    if (typeof options.isStatic === "boolean") {
      this.isStatic = options.isStatic;
    } else {
      this.isStatic = false;
    }
  }
}

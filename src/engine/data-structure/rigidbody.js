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

    if (typeof options.staticFriction === "number") {
      this.staticFriction = clamp(options.staticFriction, 0, 1);
    } else {
      this.staticFriction = 0.2;
    }

    if (typeof options.dynamicFriction === "number") {
      this.dynamicFriction = clamp(options.dynamicFriction, 0, 1);
    } else {
      this.dynamicFriction = 0.1;
    }

    if (typeof options.isStatic === "boolean") {
      this.isStatic = options.isStatic;
    } else {
      this.isStatic = false;
    }
  }
}

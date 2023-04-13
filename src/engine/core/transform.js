import Vector from "/src/engine/core/vector.js";
import Matrix from "/src/engine/core/matrix.js";

export default class Transform {
  constructor() {
    this.position = new Vector(0, 0);
    this.scale = new Vector(1, 1);
    this.rotation = 0; // degree
  }

  toMatrix() {
    return new Matrix(this);
  }
}

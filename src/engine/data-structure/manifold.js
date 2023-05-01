export default class Manifold {
  constructor(objA, objB, normal, penetrationDepth) {
    this.objA = objA;
    this.objB = objB;
    this.normal = normal;
    this.penetrationDepth = penetrationDepth;
  }
}

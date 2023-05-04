/*
 * 물체와 물체가 충돌했을 때 그 물체들과 충격량, 반작용방향을 나타낸다.
 */
export default class Manifold {
  constructor(objA, objB, normal, penetrationDepth) {
    this.objA = objA;
    this.objB = objB;
    this.normal = normal;
    this.penetrationDepth = penetrationDepth;
  }
}

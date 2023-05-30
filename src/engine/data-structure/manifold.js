/**
 * 물체와 물체가 충돌했을 때 그 물체들과 충돌 깊이, 반작용방향을 나타낸다.
 */
class Manifold {
  /**
   * @constructor
   * @param {GameObject} objA
   * @param {GameObject} objB
   * @param {Vector} normal
   * @param {number} penetrationDepth
   */
  constructor(objA, objB, normal, penetrationDepth) {
    this.objA = objA;
    this.objB = objB;
    this.normal = normal;
    this.penetrationDepth = penetrationDepth;
  }
}

export default Manifold;

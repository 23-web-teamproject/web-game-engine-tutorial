import { typeCheck, typeCheckAndClamp } from "/src/engine/utils.js";

/**
 * 물리효과를 적용하기 위해 사용하는 기본적인 요소인 강체다.
 * 물체의 질량, 탄성계수, 정지 마찰 계수 등을 담고 있다.
 *
 */
class RigidBody {
  /**
   * @constructor
   * @param {object} [options]
   * @param {number} [options.mass=1]
   * @param {number} [options.bounceness=0.5]
   * @param {number} [options.staticFriction=0.2]
   * @param {number} [options.dynamicFriction=0.1]
   * @param {boolean} [options.isStatic=false]
   * @param {boolean} [options.isGravity=false]
   * @param {boolean} [options.isTrigger=false]
   */
  constructor(options = {}) {
    /**
     * 강체의 질량을 나타낸다.
     * 기본값은 1이다.
     * 값의 범위는 0.1 ~ 10이다.
     *
     * @type {Number}
     */
    this.mass = typeCheckAndClamp(options.mass, "number", 1, 0.1, 10);
    /**
     * 물리효과를 적용하기 위해 1 / 질량을 쓸 때가 있다.
     * 그래서 그 값을 미리 계산하여 저장하기 위해 사용한다.
     * 만약 질량이 0이라면 이 값도 0이다.
     *
     * @type {Number}
     */
    if (this.mass === 0) {
      this.inverseMass = 0;
    } else {
      this.inverseMass = 1 / this.mass;
    }
    /**
     * 강체의 탄성계수를 나타낸다.
     * 1에 가까울수록 충격량을 크게 받아 탄성이 커져보이게 된다.
     * 기본값은 0.5다.
     * 값의 범위는 0 ~ 1이다.
     *
     * @type {Number}
     */
    this.bounceness = typeCheckAndClamp(
      options.bounceness,
      "number",
      0.5,
      0,
      1
    );
    /**
     * 강체의 정지 마찰 계수를 나타낸다.
     * 기본값은 0.2다.
     * 값의 범위는 0 ~ 1이다.
     *
     * @type {Number}
     */
    this.staticFriction = typeCheckAndClamp(
      options.staticFriction,
      "number",
      0.2,
      0,
      1
    );
    /**
     * 강체의 운동 마찰 계수를 나타낸다.
     * 기본값은 0.1다.
     * 값의 범위는 0 ~ 1이다.
     *
     * @type {Number}
     */
    this.dynamicFriction = typeCheckAndClamp(
      options.dynamicFriction,
      "number",
      0.1,
      0,
      1
    );
    /**
     * 정적(static)상태인지를 나타낸다.
     * 만약 정적 상태라면 이 강체는 물리 효과가 적용되어 있지만,
     * 상호작용은 하지 않는다.
     * 하지만 이 강체와 충돌하는 다른 강체는 물리효과를 받는다.
     *
     * @type {boolean}
     */
    this.isStatic = typeCheck(options.isStatic, "boolean", false);
    /**
     * 중력의 영향을 받는 상태인지를 나타낸다.
     *
     * @type {boolean}
     */
    this.isGravity = typeCheck(options.isGravity, "boolean", false);
    /**
     * 트리거 상태인지를 나타낸다.
     * 트리거 상태라면 물리적인 상호작용은 하지 않고,
     * 이 객체에 충돌된 상태인지만 검사하게 된다.
     *
     * @type {boolean}
     */
    this.isTrigger = typeCheck(options.isTrigger, "boolean", false);
  }
}

export default RigidBody;

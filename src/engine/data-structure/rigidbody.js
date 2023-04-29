import { typeCheck, typeCheckAndClamp } from "/src/engine/utils.js";

export default class RigidBody {
  constructor(options = {}) {
    /*
     * 강체의 질량을 나타낸다.
     * 기본값으로 1이고, 0.1~10 사이의 값을 설정할 수 있다.
     */
    this.mass = typeCheckAndClamp(options.mass, "number", 1, 0.1, 10);

    /*
     * 물리효과를 적용하기 위해 1/질량을 쓸 때가 있다.
     * 그래서 그 값을 미리 계산하여 저장하기 위해 사용한다.
     * 만약 질량이 0이라면 이 값도 0이다.
     */
    if (this.mass === 0) {
      this.inverseMass = 0;
    } else {
      this.inverseMass = 1 / this.mass;
    }

    /*
     * 강체의 탄성도를 나타낸다.
     * 기본값으로 0.5고, 0~1사이의 값을 설정할 수 있다.
     * 1에 가까울수록 충격량을 크게 받아 탄성이 커져보이게 된다.
     */
    this.bounceness = typeCheckAndClamp(
      options.bounceness,
      "number",
      0.5,
      0,
      1
    );

    /*
     * 강체의 정지 마찰 계수를 나타낸다.
     * 기본값으로는 0.2다.
     * 값의 범위는 0 ~ 1이다.
     */
    this.staticFriction = typeCheckAndClamp(
      options.staticFriction,
      "number",
      0.2,
      0,
      1
    );

    /*
     * 강체의 운동 마찰 계수를 나타낸다.
     * 기본값으로는 0.1다.
     * 값의 범위는 0 ~ 1이다.
     */
    this.dynamicFriction = typeCheckAndClamp(
      options.dynamicFriction,
      "number",
      0.1,
      0,
      1
    );

    /*
     * 정적(static)상태인지를 나타낸다.
     * 만약 정적 상태라면 이 강체는 물리효과를 받지 않는다.
     * 하지만 이 강체와 충돌하는 다른 강체는 물리효과를 받는다.
     */
    this.isStatic = typeCheck(options.isStatic, "boolean", false);

    /*
     * 중력의 영향을 받는 상태인지를 나타낸다.
     */
    this.isGravity = typeCheck(options.isGravity, "boolean", true);
  }
}

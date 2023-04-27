import { clamp } from "/src/engine/utils.js";

export default class RigidBody {
  constructor(options = {}) {
    /*
     * 강체의 질량을 나타낸다.
     * 기본값으로 1이고, 0.1~10 사이의 값을 설정할 수 있다.
     */
    if (typeof options.mass === "number") {
      this.mass = clamp(options.mass, 0.1, 10);
    } else {
      this.mass = 1;
    }

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
    if (typeof options.bounceness === "number") {
      this.bounceness = clamp(options.bounceness, 0, 1);
    } else {
      this.bounceness = 0.5;
    }

    /*
     * 강체의 정지 마찰 계수를 나타낸다.
     */
    if (typeof options.staticFriction === "number") {
      this.staticFriction = clamp(options.staticFriction, 0, 1);
    } else {
      this.staticFriction = 0.2;
    }

    /*
     * 강체의 운동 마찰 계수를 나타낸다.
     */
    if (typeof options.dynamicFriction === "number") {
      this.dynamicFriction = clamp(options.dynamicFriction, 0, 1);
    } else {
      this.dynamicFriction = 0.1;
    }

    /*
     * 정적(static)상태인지를 나타낸다.
     * 만약 정적 상태라면 이 강체는 물리효과를 받지 않는다.
     * 하지만 이 강체와 충돌하는 다른 강체는 물리효과를 받는다.
     */
    if (typeof options.isStatic === "boolean") {
      this.isStatic = options.isStatic;
    } else {
      this.isStatic = false;
    }

    /*
     * 중력의 영향을 받는 상태인지를 나타낸다.
     */
    if (typeof options.isGravity === "boolean") {
      this.isGravity = options.isGravity;
    } else {
      this.isGravity = true;
    }
  }
}

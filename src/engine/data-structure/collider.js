/** 충돌처리에서 물체의 외형을 간단하게 표현하기 위해 Collider를 이용한다.*/
class Collider {
  constructor() {}
}

/**
 * 상자 형태의 외형을 나타낸다.
 *
 * @extends {Collider}
 * */
class BoxCollider extends Collider {
  constructor() {
    super();
  }
}

/**
 * 원 형태의 외형을 나타낸다.
 *
 * @extends {Collider}
 * */
class CircleCollider extends Collider {
  constructor() {
    super();
  }
}

export { BoxCollider, CircleCollider };

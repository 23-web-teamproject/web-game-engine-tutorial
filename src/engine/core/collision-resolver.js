import {
  BoxCollider,
  CircleCollider,
} from "/src/engine/data-structure/collider.js";

/**
 * 추상팩토리 패턴을 사용하여, Collider의 종류에 따라 충돌체크를 한다.
 * 팩토리를 통해 생성한 객체의 resolveCollision를 호출하여 충돌체크를 한다.
 *
 * 이 객체를 상속받았다면 resolveCollision으로 시작하는
 * 모든 메서드를 재정의하여 어떤 상황에도 충돌체크를 할 수 있도록 만들어야 한다.
 *
 * 충돌체크에 사용한 공식은 아래 링크에서 참고했다.
 * https://gamedevelopment.tutsplus.com/series/how-to-create-a-custom-physics-engine--gamedev-12715
 */
class CollisionResolver {
  /**
   * 주 객체를 먼저 등록하여 충돌체크를 진행한다.
   *
   * @constructor
   * @param {GameObject} obj - 주 객체
   */
  constructor(obj) {
    this.obj = obj;
  }

  /**
   * 다른 객체의 Collider 타입에 맞춰 충돌 감지 방법을 사용하여
   * 충돌 유무를 반환한다.
   *
   * @param {GameObject} other - 이 객체와 충돌인지 확인할 객체
   * @returns {boolean}
   */
  isCollideWith(other) {
    if (other.collider instanceof BoxCollider) {
      return this.isCollideWithBox(other);
    } else if (other.collider instanceof CircleCollider) {
      return this.isCollideWithCircle(other);
    }
  }

  /**
   * 객체의 Collider 타입에 맞춰 manifold를 생성해 반환한다.
   *
   * @param {GameObject} other - 이 객체와 충돌한 다른 객체
   * @returns {Manifold}
   */
  resolveCollision(other) {
    let manifold = null;
    if (other.collider instanceof BoxCollider) {
      manifold = this.resolveBoxCollision(other);
    } else if (other.collider instanceof CircleCollider) {
      manifold = this.resolveCircleCollision(other);
    }
    return manifold;
  }

  /**
   * 이 객체를 상속받으면 이 밑으로 등장하는 모든 메서드들을 재정의해야한다.
   */

  isCollideWithBox(box) {}

  isCollideWithCircle(circle) {}

  resolveBoxCollision(box) {}

  resolveCircleCollision(circle) {}
}

export default CollisionResolver;

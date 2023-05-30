import Manifold from "/src/engine/data-structure/manifold.js";
import Vector from "/src/engine/data-structure/vector.js";

import CollisionResolver from "/src/engine/core/collision-resolver.js";

import { clamp } from "/src/engine/utils.js";

/**
 * 원과 원 또는 원과 상자 사이의 충돌체크 및
 * 충돌깊이와 반작용방향을 연산하는 책임을 맡는다.
 *
 * @extends {CollisionResolver}
 */
class CircleCollisionResolver extends CollisionResolver {
  /**
   * 주 객체를 등록하여 충돌체크를 진행한다.
   *
   * @param {GameObject} circle
   */
  constructor(circle) {
    super(circle);
    this.circle = circle;
  }

  /**
   * 원과 상자가 충돌했다면 true를 반환한다.
   *
   * @param {GameObject} box - 이 객체와 충돌인지 확인할 객체
   * @returns {boolean}
   */
  isCollideWithBox(box) {
    // 원의 중심과 상자의 중심간 거리의 차를 구한다.
    const distance = this.circle
      .getColliderPosition()
      .minus(box.getColliderPosition());

    distance.x = Math.abs(distance.x);
    distance.y = Math.abs(distance.y);

    // 중심간 차의 절대값이 상자의 주변에 원이 접했을 때의 거리보다 크다면
    // 충돌하지 않은 것이다.
    if (
      distance.x >
        box.getBoundary().x / 2 + this.circle.getBoundary() ||
      distance.y > box.getBoundary().y / 2 + this.circle.getBoundary()
    ) {
      return false;
    }

    // 중심간 차의 절대값이 상자의 크기의 절반보다 작다면
    // 원이 상자 안에 있는 셈이므로 충돌한 것이다.
    if (
      distance.x <= box.getBoundary().x / 2 ||
      distance.y <= box.getBoundary().y / 2
    ) {
      return true;
    }

    // 꼭짓점부분에서 충돌이 될 가능성을 검사한다.
    const d = distance.minus(box.getBoundary().multiply(0.5));
    return (
      d.squareLength() <=
      this.circle.getBoundary() * this.circle.getBoundary()
    );
  }

  /**
   * 원과 원이 충돌했다면 true를 반환한다.
   *
   *                   *******
   *       *****      **     **
   *      *     *     *       *
   *      *  x  *     *   x   *
   *      *     *     *       *
   *       *****      **     **
   *                   *******
   *         +--+     +---+     <-- 원의 반지름
   *         +------------+     <-- 중심간의 거리
   *
   * 두 원의 반지름의 합이 중심간의 거리보다 작다면 충돌하지 않은 셈이다.
   *
   * @param {GameObject} circle - 이 객체와 충돌인지 확인할 객체
   * @returns {boolean}
   */
  isCollideWithCircle(circle) {
    const distance = this.circle
      .getColliderPosition()
      .minus(circle.getColliderPosition());

    return (
      (this.circle.getBoundary() + circle.getBoundary()) *
        (this.circle.getBoundary() + circle.getBoundary()) >
      distance.squareLength()
    );
  }

  /**
   * 원이 상자와 충돌했을 때 충돌깊이와 반작용방향을 반환한다.
   *
   * @param {GameObject} box - 이 객체와 충돌인지 확인할 객체
   * @returns {boolean}
   */
  resolveBoxCollision(box) {
    const rectCenter = box.getColliderPosition();

    const distance = this.circle.getColliderPosition().minus(rectCenter);

    const closest = new Vector(
      clamp(
        distance.x,
        -box.getBoundary().x / 2,
        box.getBoundary().x / 2
      ),
      clamp(
        distance.y,
        -box.getBoundary().y / 2,
        box.getBoundary().y / 2
      )
    );

    let inside = false;

    // 만약 원의 중심이 사각형의 안에 들어와 있다면...
    // closest는 항상 사각형 내로 clamp되어 있기 때문에
    // distance + rectCenter와 똑같아지게 된다.
    if (distance.isEquals(closest)) {
      inside = true;

      // 중심에서 어떤 축이 더 가까운지 찾는다.
      if (Math.abs(distance.x) < Math.abs(distance.y)) {
        // y편차가 더 작다는 말은?

        // 사각형에서 원과 가장 가까운 점을 찾아야 하므로
        // 가장 가까운 사각형의 경계를 점으로 선택한다.
        if (closest.x > 0) {
          closest.x = box.getBoundary().x / 2;
        } else {
          closest.x = -box.getBoundary().x / 2;
        }
      } else {
        if (closest.y > 0) {
          closest.y = box.getBoundary().y / 2;
        } else {
          closest.y = -box.getBoundary().y / 2;
        }
      }
    }

    let penetrationDepth = 0;
    let normal = distance.minus(closest);
    const d = normal.squareLength();

    if (
      d > this.circle.getBoundary() * this.circle.getBoundary() &&
      !inside
    ) {
      return;
    }

    if (inside) {
      normal = normal.multiply(-1).normalize();
      // 원이 사각형 안에 있다면 단순하게 충돌 깊이를 반지름 * 2로 설정한다.
      penetrationDepth = 2 * this.circle.getBoundary();
    } else {
      normal = normal.multiply(1).normalize();
      // 원이 사각형 밖에 있다면 충돌 깊이를 반지름에서 충돌한 거리를 뺀 값으로 설정한다.
      penetrationDepth = this.circle.getBoundary() - Math.sqrt(d);
    }

    return new Manifold(box, this.circle, normal, penetrationDepth);
  }

  /**
   * 원과 원이 충돌했을 때 충돌깊이와 반작용방향을 반환한다.
   *
   * @param {GameObject} circle - 이 객체와 충돌인지 확인할 객체
   * @returns {boolean}
   */
  resolveCircleCollision(circle) {
    const distance = circle
      .getColliderPosition()
      .minus(this.circle.getColliderPosition());

    // 두 원의 반지름을 더한 값을 제곱하되 정확한 값을 위해서
    // 제곱근을 씌우진 않는다.
    const sumOfRadius =
      this.circle.getBoundary() + circle.getBoundary();
    const squareOfRadius = sumOfRadius * sumOfRadius;

    // 두 원의 중심간 거리가 두 원의 반지름을 더한 값의 제곱보다 크면
    // 충돌하지 않았음을 의미한다.
    if (distance.squareLength() > squareOfRadius) {
      return;
    }

    const d = distance.length();

    // 두 원의 중심이 같은 경우를 생각해 임의로 방향과 충돌깊이를 설정한다.
    let penetrationDepth = this.circle.getBoundary();
    let normal = new Vector(-1, 0);
    if (d != 0) {
      // 두 원의 중심간 거리가 0이 아니라면
      // 충돌했으되 중심이 일치하지 않은 상황이다.
      // 반지름을 더한 값 - 중심간의 거리가 충돌한 깊이를 의미한다.
      penetrationDepth = sumOfRadius - d;
      // 중심간의 거리를 단위벡터화하면 힘(반작용)이 작용할 방향이 된다.
      normal = distance.multiply(1 / d).normalize();
    }

    return new Manifold(this.circle, circle, normal, penetrationDepth);
  }
}

export default CircleCollisionResolver;

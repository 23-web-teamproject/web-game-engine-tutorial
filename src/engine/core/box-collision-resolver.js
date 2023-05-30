import Manifold from "/src/engine/data-structure/manifold.js";
import Vector from "/src/engine/data-structure/vector.js";

import CollisionResolver from "/src/engine/core/collision-resolver.js";

import { clamp } from "/src/engine/utils.js";

/**
 * 상자와 상자 또는 상자와 원 사이의 충돌체크 및
 * 충돌깊이와 반작용방향을 연산하는 책임을 맡는다.
 *
 * @extends CollisionResolver
 */
class BoxCollisionResolver extends CollisionResolver {
  /**
   * 주 객체를 등록하여 충돌체크를 진행한다.
   *
   * @param {GameObject} box
   */
  constructor(box) {
    super(box);
    this.box = box;
  }

  /**
   * 상자와 상자가 충돌했다면 true를 반환한다.
   *
   * @param {GameObject} box - 이 객체와 충돌인지 확인할 객체
   * @returns {boolean}
   */
  isCollideWithBox(box) {
    // 단순하게 AABB충돌체크 방식을 사용한다.
    if (
      this.box.getColliderPosition().x -
        this.box.getBoundary().x / 2 >
        box.getColliderPosition().x + box.getBoundary().x / 2 ||
      this.box.getColliderPosition().x +
        this.box.getBoundary().x / 2 <
        box.getColliderPosition().x - box.getBoundary().x / 2 ||
      this.box.getColliderPosition().y -
        this.box.getBoundary().y / 2 >
        box.getColliderPosition().y + box.getBoundary().y / 2 ||
      this.box.getColliderPosition().y +
        this.box.getBoundary().y / 2 <
        box.getColliderPosition().y - box.getBoundary().y / 2
    ) {
      return false;
    }
    return true;
  }

  /**
   * 상자와 원이 충돌했다면 true를 반환한다.
   *
   * @param {GameObject} circle - 이 객체와 충돌인지 확인할 객체
   * @returns {boolean}
   */
  isCollideWithCircle(circle) {
    // 원의 중심과 상자의 중심간 거리의 차를 구한다.
    const distance = circle
      .getColliderPosition()
      .minus(this.box.getColliderPosition());

    distance.x = Math.abs(distance.x);
    distance.y = Math.abs(distance.y);

    // 중심간 차의 절대값이 상자의 주변에 원이 접했을 때의 거리보다 크다면
    // 충돌하지 않은 것이다.
    if (
      distance.x >
        this.box.getBoundary().x / 2 + circle.getBoundary() ||
      distance.y > this.box.getBoundary().y / 2 + circle.getBoundary()
    ) {
      return false;
    }

    // 중심간 차의 절대값이 상자의 크기의 절반보다 작다면
    // 원이 상자 안에 있는 셈이므로 충돌한 것이다.
    if (
      distance.x <= this.box.getBoundary().x / 2 ||
      distance.y <= this.box.getBoundary().y / 2
    ) {
      return true;
    }

    // 꼭짓점부분에서 충돌이 될 가능성을 검사한다.
    const d = distance.minus(this.box.getBoundary().multiply(0.5));
    return (
      d.squareLength() <= circle.getBoundary() * circle.getBoundary()
    );
  }

  /**
   * 상자와 상자가 충돌했을 때 충돌깊이와 반작용방향을 반환한다.
   *
   *               +-------+
   *     +-----+   |       |
   *     |  x  |   |   x   |
   *     +-----+   |       |
   *               +-------+
   *
   *        +--+   +---+    <-- 가로 길이의 절반
   *        +----------+    <-- 중심간의 거리
   *
   * 각 상자의 길이의 절반의 합이 중심간의 거리보다 작을 때에만 충돌이다.
   * 이 때 충돌한 깊이는 각 길이의 절반의 합과 중심간의 거리의 차로 구해진다.
   *
   * @param {GameObject} box - 이 객체와 충돌한 다른 객체
   * @returns {Manifold}
   */
  resolveBoxCollision(box) {
    const distance = box
      .getColliderPosition()
      .minus(this.box.getColliderPosition());

    // 충돌된 영역의 가로 길이
    const xOverlap =
      this.box.getBoundary().x / 2 +
      box.getBoundary().x / 2 -
      Math.abs(distance.x);
    // 충돌된 영역의 세로 길이
    const yOverlap =
      this.box.getBoundary().y / 2 +
      box.getBoundary().y / 2 -
      Math.abs(distance.y);

    if (xOverlap < 0 || yOverlap < 0) {
      return;
    }

    let normal = new Vector(0, -1);
    let penetrationDepth = 0;

    // 가로 길이가 세로 길이보다 크다면
    // 위->아래방향 또는
    // 아래->위방향으로 진행한 물체가 충돌한 것이다.
    if (xOverlap > yOverlap) {
      // obj이 other보다 아래에 있으면 위에서 아래로 충돌했다는 말이므로
      // 힘(반작용)은 위로 작용해야한다.
      // 그렇지 않으면 힘이 아래로 작용해야한다.
      if (distance.y < 0) {
        normal = new Vector(0, -1);
      } else {
        normal = new Vector(0, 1);
      }
      penetrationDepth = yOverlap;
    } else {
      // 세로 길이가 가로 길이보다 크다는 말은
      // 왼쪽->오른쪽방향 또는
      // 오른쪽->왼쪽방향으로 진행한 물체가 충돌한 것이다.
      // obj이 other보다 왼쪽에 있으면
      // 힘(반작용)은 왼쪽으로 작용해야한다.
      // 반대의 경우 오른쪽으로 작용해야한다.
      if (distance.x < 0) {
        normal = new Vector(-1, 0);
      } else {
        normal = new Vector(1, 0);
      }
      penetrationDepth = xOverlap;
    }

    return new Manifold(this.box, box, normal, penetrationDepth);
  }

  /**
   * 원이 상자와 충돌했을 때 충돌깊이와 반작용방향을 반환한다.
   *
   * @param {GameObject} circle - 이 객체와 충돌한 다른 객체
   * @returns {Manifold}
   */
  resolveCircleCollision(circle) {
    const rectCenter = this.box.getColliderPosition();

    const distance = circle.getColliderPosition().minus(rectCenter);

    const closest = new Vector(
      clamp(
        distance.x,
        -this.box.getBoundary().x / 2,
        this.box.getBoundary().x / 2
      ),
      clamp(
        distance.y,
        -this.box.getBoundary().y / 2,
        this.box.getBoundary().y / 2
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
          closest.x = this.box.getBoundary().x / 2;
        } else {
          closest.x = -this.box.getBoundary().x / 2;
        }
      } else {
        if (closest.y > 0) {
          closest.y = this.box.getBoundary().y / 2;
        } else {
          closest.y = -this.box.getBoundary().y / 2;
        }
      }
    }

    let penetrationDepth = 0;
    let normal = distance.minus(closest);
    const d = normal.squareLength();

    if (d > circle.getBoundary() * circle.getBoundary() && !inside) {
      return;
    }

    if (inside) {
      normal = normal.multiply(-1).normalize();
      // 원이 사각형 안에 있다면 단순하게 충돌 깊이를 반지름 * 2로 설정한다.
      penetrationDepth = 2 * circle.getBoundary();
    } else {
      normal = normal.multiply(1).normalize();
      // 원이 사각형 밖에 있다면 충돌 깊이를 반지름에서 충돌한 거리를 뺀 값으로 설정한다.
      penetrationDepth = circle.getBoundary() - Math.sqrt(d);
    }

    return new Manifold(this.box, circle, normal, penetrationDepth);
  }
}

export default BoxCollisionResolver;

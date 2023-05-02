import Manifold from "/src/engine/data-structure/manifold.js";
import Vector from "/src/engine/data-structure/vector.js";
import CollisionResolver from "/src/engine/core/collision-resolver.js";
import { clamp } from "/src/engine/utils.js";

export default class CircleCollisionResolver extends CollisionResolver {
  constructor(circle) {
    super(circle);
    this.circle = circle;
  }

  isCollideWithBox(box) {
    // 원에서 사각형의 변까지의 거리를 절댓값으로 구한다.
    const distance = this.circle
      .getWorldPosition()
      .minus(box.getWorldPosition());

    distance.x = Math.abs(distance.x);
    distance.y = Math.abs(distance.y);

    if (
      distance.x > box.getWorldSize().x / 2 + this.circle.radius ||
      distance.y > box.getWorldSize().y / 2 + this.circle.radius
    ) {
      return false;
    }

    if (
      distance.x <= box.getWorldSize().x / 2 ||
      distance.y <= box.getWorldSize().y / 2
    ) {
      return true;
    }

    // 꼭짓점부분에서 충돌이 될 가능성을 검사한다.
    const d = distance.minus(box.getWorldSize().multiply(0.5));
    return d.squareLength() <= this.circle.radius * this.circle.radius;
  }

  isCollideWithCircle(circle) {
    const distance = this.circle
      .getWorldPosition()
      .minus(circle.getWorldPosition());
    return (
      (this.circle.radius + circle.radius) *
        (this.circle.radius + circle.radius) >
      distance.squareLength()
    );
  }

  resolveBoxCollision(box) {
    const rectCenter = box.getWorldPosition();

    const distance = this.circle.getWorldPosition().minus(rectCenter);

    const closest = new Vector(
      clamp(distance.x, -box.getWorldSize().x / 2, box.getWorldSize().x / 2),
      clamp(distance.y, -box.getWorldSize().y / 2, box.getWorldSize().y / 2)
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
          closest.x = box.getWorldSize().x / 2;
        } else {
          closest.x = -box.getWorldSize().x / 2;
        }
      } else {
        if (closest.y > 0) {
          closest.y = box.getWorldSize().y / 2;
        } else {
          closest.y = -box.getWorldSize().y / 2;
        }
      }
    }

    let penetrationDepth = 0;
    let normal = distance.minus(closest);
    const d = normal.squareLength();

    //
    if (d > this.circle.radius * this.circle.radius && !inside) {
      return;
    }

    if (inside) {
      normal = normal.multiply(-1).normalize();
      penetrationDepth = 2 * this.circle.radius; // ???
    } else {
      normal = normal.multiply(1).normalize();
      penetrationDepth = this.circle.radius - Math.sqrt(d); // ???
    }

    return new Manifold(box, this.circle, normal, penetrationDepth);
  }

  resolveCircleCollision(circle) {
    const distance = circle
      .getWorldPosition()
      .minus(this.circle.getWorldPosition());

    // 두 원의 반지름을 더한 값을 제곱하되 정확한 값을 위해서
    // 제곱근을 씌우진 않는다.
    const sumOfRadius = this.circle.radius + circle.radius;
    const squareOfRadius = sumOfRadius * sumOfRadius;

    // 두 원의 중심간 거리가 두 원의 반지름을 더한 값의 제곱보다 크면
    // 충돌하지 않았음을 의미한다.
    if (distance.squareLength() > squareOfRadius) {
      return;
    }

    const d = distance.length();

    // 두 원의 중심이 같은 경우를 생각해 임의로 방향과 충돌깊이를 설정한다.
    let penetrationDepth = this.circle.radius;
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

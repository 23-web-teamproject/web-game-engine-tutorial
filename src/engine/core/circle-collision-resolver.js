import Vector from "/src/engine/data-structure/vector.js";
import CollisionResolver from "/src/engine/core/collision-resolver.js";

export default class CircleCollisionResolver extends CollisionResolver {
  constructor(circle) {
    super(circle);
    this.circle = circle;
  }

  isCollideWithBox(box) {
    // 원에서 사각형의 변까지의 거리를 절댓값으로 구한다.
    const distance = this.circle
      .getWorldPosition()
      .minus(box.getWorldPosition().add(box.getSize().multiply(0.5)));

    distance.x = Math.abs(distance.x);
    distance.y = Math.abs(distance.y);

    if (
      distance.x > box.getSize().x / 2 + this.circle.radius ||
      distance.y > box.getSize().y / 2 + this.circle.radius
    ) {
      return false;
    }

    if (
      distance.x <= box.getSize().x / 2 ||
      distance.y <= box.getSize().y / 2
    ) {
      return true;
    }

    // 꼭짓점부분에서 충돌이 될 가능성을 검사한다.
    const d = distance.minus(box.getSize().multiply(0.5));
    return d.squareLength() <= this.circle.radius * this.circle.radius;
  }

  isCollideWithCircle(circle) {
    const posDiff = this.circle
      .getWorldPosition()
      .minus(circle.getWorldPosition());
    return (
      (this.circle.radius + circle.radius) *
        (this.circle.radius + circle.radius) >
      posDiff.squareLength()
    );
  }

  resolveBoxCollision(box) {
    const rectCenter = new Vector(
      box.getWorldPosition().x + box.getSize().x / 2,
      box.getWorldPosition().y + box.getSize().y / 2
    );
    const posDiff = new Vector(
      this.circle.getWorldPosition().x - rectCenter.x,
      this.circle.getWorldPosition().y - rectCenter.y
    );

    const closest = new Vector(
      Math.min(
        box.getWorldPosition().x + box.getSize().x,
        Math.max(box.getWorldPosition().x, this.circle.getWorldPosition().x)
      ),
      Math.min(
        box.getWorldPosition().y + box.getSize().y,
        Math.max(box.getWorldPosition().y, this.circle.getWorldPosition().y)
      )
    );

    let inside = false;

    // 만약 원의 중심이 사각형의 안에 들어와 있다면...
    // closest는 항상 사각형 내로 clamp되어 있기 때문에
    // posDiff + rectCenter와 똑같아지게 된다.
    if (posDiff.isEquals(closest.minus(rectCenter))) {
      inside = true;

      // 중심에서 어떤 축이 더 가까운지 찾는다.
      if (Math.abs(posDiff.x) < Math.abs(posDiff.y)) {
        // y편차가 더 작다는 말은?

        // 사각형에서 원과 가장 가까운 점을 찾아야 하므로
        // 가장 가까운 사각형의 경계를 점으로 선택한다.
        if (rectCenter.x - closest.x > 0) {
          closest.x = box.getWorldPosition().x;
        } else {
          closest.x = box.getWorldPosition().x + box.getSize().x;
        }
      } else {
        if (rectCenter.y - closest.y > 0) {
          closest.y = box.getWorldPosition().y;
        } else {
          closest.y = box.getWorldPosition().y + box.getSize().y;
        }
      }
    }

    let penetrationDepth = 0;
    let normal = posDiff.minus(closest.minus(rectCenter));
    const d = normal.squareLength();

    //
    if (d > this.circle.radius * this.circle.radius && !inside) {
      return;
    }

    if (inside) {
      /*
       * 충돌검사의 주체가 사각형이라면 normal벡터는 반작용으로 인해
       * 원이 튕겨져 나갈 방향이다. 따라서 normal벡터에 -1을 곱해야
       * 작용으로 인해 사각형이 튕겨져 나갈 방향이다.
       * 그러나 충돌검사의 주체가 원이라면 normal벡터는 작용으로 인해
       * 사각형이 튕겨져 나갈 방향이므로,
       * normal벡터에 -1을 곱해야 반작용으로 인해 원이 튕겨져 나갈 방향이 된다.
       */
      normal = normal.multiply(-1).normalize();
      penetrationDepth =
        this.circle.radius +
        this.circle.getWorldPosition().minus(closest).length(); // ???
    } else {
      normal = normal.multiply(1).normalize();
      penetrationDepth =
        this.circle.getWorldPosition().minus(closest).length() -
        this.circle.radius; // ???
    }

    this.applyImpulse(box, normal, penetrationDepth);
  }

  resolveCircleCollision(circle) {
    const posDiff = this.circle
      .getWorldPosition()
      .minus(circle.getWorldPosition());

    // 두 원의 반지름을 더한 값을 제곱하되 정확한 값을 위해서
    // 제곱근을 씌우진 않는다.
    const squareRadius =
      (this.circle.radius + circle.radius) *
      (this.circle.radius + circle.radius);

    // 두 원의 중심간 거리가 두 원의 반지름을 더한 값의 제곱보다 크면
    // 충돌하지 않았음을 의미한다.
    if (posDiff.squareLength() > squareRadius) {
      return;
    }

    const distance = posDiff.length();

    // 두 원의 중심이 같은 경우를 생각해 임의로 방향과 충돌깊이를 설정한다.
    let penetrationDepth = this.circle.radius;
    let normal = new Vector(1, 0);
    if (distance != 0) {
      // 두 원의 중심간 거리가 0이 아니라면
      // 충돌했으되 중심이 일치하지 않은 상황이다.
      // 반지름을 더한 값 - 중심간의 거리가 충돌한 깊이를 의미한다.
      penetrationDepth = this.circle.radius + circle.radius - distance;
      // 중심간의 거리를 단위벡터화하면 힘(반작용)이 작용할 방향이 된다.
      normal = posDiff.normalize();
    }

    this.applyImpulse(circle, normal, penetrationDepth);
  }
}

/*
 * 추상팩토리 패턴을 사용하여, Collider의 종류에 따라 충돌검사를 사용한다.
 * 팩토리를 통해 생성한 객체의 resolveCollision를 호출하여 충돌검사를 한다.
 *
 * 이 객체를 상속받았다면 resolveCollision으로 시작하는
 * 모든 메서드를 재정의하여 어떤 상황에도 충돌체크를 할 수 있도록 만들어야 한다.
 */
import Vector from "/src/engine/data-structure/vector.js";

class CollisionResolver {
  constructor(obj) {
    this.obj = obj;
  }

  isCollideWith(other, otherType) {
    if (otherType === "box") {
      return this.isCollideWithBox(other);
    } else if (otherType === "circle") {
      return this.isCollideWithCircle(other);
    }
  }

  resolveCollision(other, otherType) {
    if (otherType === "box") {
      this.resolveBoxCollision(other);
    } else if (otherType === "circle") {
      this.resolveCircleCollision(other);
    }
  }

  applyImpulse(other, normal, penetrationDepth) {
    const diff = this.obj.getVelocity().minus(other.getVelocity());
    const dot = diff.dot(normal);

    // 두 객체의 속도(velocity:벡터)의 내적값이 양수라면
    // 두 객체가 서로 다른 방향으로 이동하고 있는 것이 아니라는 말이므로
    // 충돌체크를 하지 않는다.
    // 그런데 겹쳐져 있는 상태라면 그 상태를 해소해야 하는데
    // 이 경우 어떻게 해야할지 고민해보자.
    if (dot > 0) {
      return;
    }

    // 유니티에서는 탄성값을 적용할 때 avg, min, max 중 하나를 적용한다.
    // 여기서는 일단 min으로 적용한다.
    const e = Math.min(this.obj.getBounceness(), other.getBounceness());

    // 충격량을 구하는 방정식을 통해 충격량을 계산한다.
    // 저도 잘 몰라요.
    let j = -(1 + e) * dot;
    j /= this.obj.getInverseMass() + other.getInverseMass();
    const impulse = normal.multiply(j);

    this.obj.addVelocity(impulse.multiply(this.obj.getInverseMass()));
    other.addVelocity(impulse.multiply(-1 * other.getInverseMass()));

    this.positionalCorrection(other, normal, penetrationDepth);
  }

  /*
   * 충돌처리가 되었지만 서서히 빠져버리는 버그를 해결하기 위해
   * 충돌된 위치에서 정해진 값만큼 강제로 떨어지게 한다.
   */
  positionalCorrection(other, normal, penetrationDepth) {
    const percentage = 0.2; // ??? 0.2 ~ 0.8
    const slop = 0.1; // ??? 0.01 ~ 0.1
    const correction = normal.multiply(
      (Math.max(penetrationDepth - slop, 0) /
        (this.obj.getInverseMass() + other.getInverseMass())) *
        percentage
    );

    this.obj.matrix.x += this.obj.getInverseMass() * correction.x;
    this.obj.matrix.y += this.obj.getInverseMass() * correction.y;

    other.matrix.x -= other.getInverseMass() * correction.x;
    other.matrix.y -= other.getInverseMass() * correction.y;
  }

  /*
   * 이 객체를 상속받으면 이 밑으로 등장하는 모든 메서드들을 재정의해야한다.
   */

  isCollideWithBox(box) {}

  isCollideWithCircle(circle) {}

  resolveBoxCollision(box) {}

  resolveCircleCollision(circle) {}
}

class BoxCollisionResolver extends CollisionResolver {
  constructor(box) {
    super(box);
    this.box = box;
  }

  isCollideWithBox(box) {
    if (
      this.obj.getWorldPosition().x >
        box.getWorldPosition().x + box.getSize().x ||
      this.obj.getWorldPosition().x + this.obj.getSize().x <
        box.getWorldPosition().x ||
      this.obj.getWorldPosition().y >
        box.getWorldPosition().y + box.getSize().y ||
      this.obj.getWorldPosition().y + this.obj.getSize().y <
        box.getWorldPosition().y
    ) {
      return false;
    }
    return true;
  }

  isCollideWithCircle(circle) {
    // 원에서 사각형의 변까지의 거리를 절댓값으로 구한다.
    const distance = circle
      .getWorldPosition()
      .minus(this.box.getWorldPosition().add(this.box.getSize().multiply(0.5)));

    distance.x = Math.abs(distance.x);
    distance.y = Math.abs(distance.y);

    if (
      distance.x > this.box.getSize().x / 2 + circle.radius ||
      distance.y > this.box.getSize().y / 2 + circle.radius
    ) {
      return false;
    }

    if (
      distance.x <= this.box.getSize().x / 2 ||
      distance.y <= this.box.getSize().y / 2
    ) {
      return true;
    }

    // 꼭짓점부분에서 충돌이 될 가능성을 검사한다.
    const d = distance.minus(this.box.getSize().multiply(0.5));
    return d.squareLength() <= circle.radius * circle.radius;
  }

  resolveBoxCollision(box) {
    const posDiff = this.box.getWorldPosition().minus(box.getWorldPosition());

    // 충돌된 영역을 구함
    const lt = new Vector(
      Math.max(this.box.getWorldPosition().x, box.getWorldPosition().x),
      Math.max(this.box.getWorldPosition().y, box.getWorldPosition().y)
    );
    const rb = new Vector(
      Math.min(
        this.box.getWorldPosition().x + this.box.getSize().x,
        box.getWorldPosition().x + box.getSize().x
      ),
      Math.min(
        this.box.getWorldPosition().y + this.box.getSize().y,
        box.getWorldPosition().y + box.getSize().y
      )
    );

    let normal = new Vector(1, 0);
    let penetrationDepth = 0;

    // 충돌된 영역의 가로 길이
    const xOverlap = rb.x - lt.x;

    if (xOverlap > 0) {
      // 충돌된 영역의 세로 길이
      const yOverlap = rb.y - lt.y;

      if (yOverlap > 0) {
        // 가로 길이가 세로 길이보다 크다면
        // 위->아래방향 또는
        // 아래->위방향으로 진행한 물체가 충돌한 것이다.
        if (xOverlap > yOverlap) {
          // obj이 other보다 아래에 있으면 위에서 아래로 충돌했다는 말이므로
          // 힘(반작용)은 위로 작용해야한다.
          // 그렇지 않으면 힘이 아래로 작용해야한다.
          if (posDiff.y < 0) {
            normal = new Vector(0, -1);
          } else {
            normal = new Vector(0, 1);
          }
          penetrationDepth = xOverlap;
        } else {
          // 세로 길이가 가로 길이보다 크다는 말은
          // 왼쪽->오른쪽방향 또는
          // 오른쪽->왼쪽방향으로 진행한 물체가 충돌한 것이다.
          // obj이 other보다 왼쪽에 있으면
          // 힘(반작용)은 왼쪽으로 작용해야한다.
          // 반대의 경우 오른쪽으로 작용해야한다.
          if (posDiff.x < 0) {
            normal = new Vector(-1, 0);
          } else {
            normal = new Vector(1, 0);
          }
          penetrationDepth = yOverlap;
        }
      }
    }
    this.applyImpulse(box, normal, penetrationDepth);
  }

  resolveCircleCollision(circle) {
    const rectCenter = new Vector(
      this.box.getWorldPosition().x + this.box.getSize().x / 2,
      this.box.getWorldPosition().y + this.box.getSize().y / 2
    );
    const posDiff = new Vector(
      circle.getWorldPosition().x - rectCenter.x,
      circle.getWorldPosition().y - rectCenter.y
    );

    const closest = new Vector(
      Math.min(
        this.box.getWorldPosition().x + this.box.getSize().x,
        Math.max(this.box.getWorldPosition().x, circle.getWorldPosition().x)
      ),
      Math.min(
        this.box.getWorldPosition().y + this.box.getSize().y,
        Math.max(this.box.getWorldPosition().y, circle.getWorldPosition().y)
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
          closest.x = this.box.getWorldPosition().x;
        } else {
          closest.x = this.box.getWorldPosition().x + this.box.getSize().x;
        }
      } else {
        if (rectCenter.y - closest.y > 0) {
          closest.y = this.box.getWorldPosition().y;
        } else {
          closest.y = this.box.getWorldPosition().y + this.box.getSize().y;
        }
      }
    }

    let penetrationDepth = 0;
    let normal = posDiff.minus(closest.minus(rectCenter));
    const d = normal.squareLength();

    //
    if (d > circle.radius * circle.radius && !inside) {
      return;
    }

    if (inside) {
      normal = normal.multiply(1).normalize();
      penetrationDepth =
        circle.radius + circle.getWorldPosition().minus(closest).length(); // ???
    } else {
      normal = normal.multiply(-1).normalize();
      penetrationDepth =
        circle.getWorldPosition().minus(closest).length() - circle.radius; // ???
    }

    this.applyImpulse(circle, normal, penetrationDepth);
  }
}

class CircleCollisionResolver extends CollisionResolver {
  constructor(circle) {
    super(circle);
    this.circle = circle;
  }

  isCollideWithBox(box) {
    // 원에서 사각형의 변까지의 거리를 절댓값으로 구한다.
    const distance = this.circle
      .getWorldPosition()
      .minus(box.getWorldPosition().add(box.getSize().multiply(0.5)))
      .minus(box.getSize().multiply(0.5));

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
      normal = normal.multiply(1).normalize();
      penetrationDepth =
        this.circle.radius +
        this.circle.getWorldPosition().minus(closest).length(); // ???
    } else {
      normal = normal.multiply(-1).normalize();
      penetrationDepth =
        this.circle.getWorldPosition().minus(closest).length() -
        this.circle.radius; // ???
    }

    this.applyImpulse(circle, normal, penetrationDepth);
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

export { BoxCollisionResolver, CircleCollisionResolver };

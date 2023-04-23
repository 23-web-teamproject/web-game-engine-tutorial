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
    const e = Math.min(this.obj.bounceness, other.bounceness);

    // 충격량을 구하는 방정식을 통해 충격량을 계산한다.
    // 저도 잘 몰라요.
    let j = -(1 + e) * dot;
    j /= this.obj.inverseMass + other.inverseMass;
    const impulse = normal.multiply(j);
    //new Vector(j * normal.x, j * normal.y);
    // this.obj.addVelocity(impulse.multiply(this.obj.inverseMass));
    // other.addVelocity(impulse.multiply(other.inverseMass));
    this.obj.velocity = this.obj.velocity.add(
      new Vector(this.obj.inverseMass * impulse.x, this.obj.inverseMass * impulse.y)
    );

    other.velocity = other.velocity.minus(
      new Vector(other.inverseMass * impulse.x, other.inverseMass * impulse.y)
    );

    this.positionalCorrection(other, normal, penetrationDepth);
  }

  /*
   * 충돌처리가 되었지만 서서히 빠져버리는 버그를 해결하기 위해
   * 충돌된 위치에서 정해진 값만큼 강제로 떨어지게 한다.
   */
  positionalCorrection(other, normal, penetrationDepth) {
    const percentage = 0.05; // ??? 0.2 ~ 0.8
    const slop = 0.1; // ??? 0.01 ~ 0.1
    const correction = normal.multiply(
      (Math.max(penetrationDepth - slop, 0) /
        (this.obj.inverseMass + other.inverseMass)) *
        percentage
    );

    this.obj.matrix.x += this.obj.inverseMass * correction.x;
    this.obj.matrix.y += this.obj.inverseMass * correction.y;

    other.matrix.x -= other.inverseMass * correction.x;
    other.matrix.y -= other.inverseMass * correction.y;
  }

  /*
   * 이 객체를 상속받으면 이 밑으로 등장하는 모든 메서드들을 재정의해야한다.
   */
  resolveBoxCollision(other) {}

  resolveCircleCollision(other) {}
}

class BoxCollisionResolver extends CollisionResolver {
  constructor(box) {
    super(box);
    this.box = box;
  }

  resolveBoxCollision(box) {
    const posDiff = this.box.getWorldPos().minus(box.getWorldPos());
    // const posDiff = new Vector(
    //   this.box.getWorldPos().x - box.getWorldPos().x,
    //   this.box.getWorldPos().y - box.getWorldPos().y
    // );

    // 충돌된 영역을 구함
    const lt = new Vector(
      Math.max(this.box.getWorldPos().x, box.getWorldPos().x),
      Math.max(this.box.getWorldPos().y, box.getWorldPos().y)
    );
    const rb = new Vector(
      Math.min(
        this.box.getWorldPos().x + this.box.getSize().x,
        box.getWorldPos().x + box.getSize().x
      ),
      Math.min(
        this.box.getWorldPos().y + this.box.getSize().y,
        box.getWorldPos().y + box.getSize().y
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
      this.box.getWorldPos().x + this.box.getSize().x / 2,
      this.box.getWorldPos().y + this.box.getSize().y / 2
    );
    const posDiff = new Vector(
      circle.getWorldPos().x - rectCenter.x,
      circle.getWorldPos().y - rectCenter.y
    );

    const closest = new Vector(
      Math.min(
        this.box.getWorldPos().x + this.box.getSize().x,
        Math.max(this.box.getWorldPos().x, circle.getWorldPos().x)
      ),
      Math.min(
        this.box.getWorldPos().y + this.box.getSize().y,
        Math.max(this.box.getWorldPos().y, circle.getWorldPos().y)
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
          closest.x = this.box.getWorldPos().x;
        } else {
          closest.x = this.box.getWorldPos().x + this.box.getSize().x;
        }
      } else {
        if (rectCenter.y - closest.y > 0) {
          closest.y = this.box.getWorldPos().y;
        } else {
          closest.y = this.box.getWorldPos().y + this.box.getSize().y;
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
        circle.radius + circle.getWorldPos().minus(closest).length(); // ???
    } else {
      normal = normal.multiply(-1).normalize();
      penetrationDepth =
        circle.getWorldPos().minus(closest).length() - circle.radius; // ???
    }

    this.applyImpulse(circle, normal, penetrationDepth);
  }
}

class CircleCollisionResolver extends CollisionResolver {
  constructor(circle) {
    super(circle);
    this.circle = circle;
  }

  resolveBoxCollision(box) {
    const rectCenter = new Vector(
      box.getWorldPos().x + box.getSize().x / 2,
      box.getWorldPos().y + box.getSize().y / 2
    );
    const posDiff = new Vector(
      this.circle.getWorldPos().x - rectCenter.x,
      this.circle.getWorldPos().y - rectCenter.y
    );

    const closest = new Vector(
      Math.min(
        box.getWorldPos().x + box.getSize().x,
        Math.max(box.getWorldPos().x, this.circle.getWorldPos().x)
      ),
      Math.min(
        box.getWorldPos().y + box.getSize().y,
        Math.max(box.getWorldPos().y, this.circle.getWorldPos().y)
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
          closest.x = box.getWorldPos().x;
        } else {
          closest.x = box.getWorldPos().x + box.getSize().x;
        }
      } else {
        if (rectCenter.y - closest.y > 0) {
          closest.y = box.getWorldPos().y;
        } else {
          closest.y = box.getWorldPos().y + box.getSize().y;
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
        this.circle.radius + this.circle.getWorldPos().minus(closest).length(); // ???
    } else {
      normal = normal.multiply(-1).normalize();
      penetrationDepth =
        this.circle.getWorldPos().minus(closest).length() - this.circle.radius; // ???
    }

    this.applyImpulse(circle, normal, penetrationDepth);
  }

  resolveCircleCollision(circle) {
    const posDiff = this.circle.getWorldPos().minus(circle.getWorldPos());
    // const posDiff = new Vector(
    //   this.circle.matrix.x - circle.matrix.x,
    //   this.circle.matrix.y - circle.matrix.y
    // );

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

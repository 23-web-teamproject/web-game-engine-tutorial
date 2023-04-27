import CollisionResolver from "/src/engine/core/collision-resolver.js";

export default class BoxCollisionResolver extends CollisionResolver {
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

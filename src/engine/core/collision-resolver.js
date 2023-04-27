/*
 * 추상팩토리 패턴을 사용하여, Collider의 종류에 따라 충돌검사를 사용한다.
 * 팩토리를 통해 생성한 객체의 resolveCollision를 호출하여 충돌검사를 한다.
 *
 * 이 객체를 상속받았다면 resolveCollision으로 시작하는
 * 모든 메서드를 재정의하여 어떤 상황에도 충돌체크를 할 수 있도록 만들어야 한다.
 *
 * 충돌체크에 사용한 공식은 아래 링크에서 참고했다.
 * https://gamedevelopment.tutsplus.com/series/how-t-create-a-custom-physics-engnien--gamedev-12715
 */
export default class CollisionResolver {
  constructor(obj) {
    this.obj = obj;
  }

  isCollideWith(other) {
    if (other.collider.type === "box") {
      return this.isCollideWithBox(other);
    } else if (other.collider.type === "circle") {
      return this.isCollideWithCircle(other);
    }
  }

  resolveCollision(other) {
    if (other.collider.type === "box") {
      this.resolveBoxCollision(other);
    } else if (other.collider.type === "circle") {
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

    this.applyFriction(other, normal, j);

    this.positionalCorrection(other, normal, penetrationDepth);
  }

  /*
   * 정지 마찰 계수와 운동 마찰 계수를 통해 마찰력을 적용한다.
   */
  applyFriction(other, normal, j) {
    // 충격이 전달된 후의 속도로 계산을 진행한다.
    // 두 물체의 속도 벡터의 차로 마찰이 작용할 방향을 찾는다.
    const relativeVelocity = other.getVelocity().minus(this.obj.getVelocity());

    // relativeVelocity를 n에 정사영하여 normal방향 성분을 얻고,
    // 그 성분값을 다시 relativeVelocity에 빼서 normal에
    // 수직인 벡터를 구한다.
    let tangent = relativeVelocity.minus(
      normal.multiply(relativeVelocity.dot(normal))
    );
    tangent = tangent.normalize();

    // 마찰력의 크기를 구한다.
    let jt = -relativeVelocity.dot(tangent);
    jt /= this.obj.getInverseMass() + other.getInverseMass();

    // 두 물체 사이의 정지 마찰 계수를 구한다.
    const staticFriction = Math.sqrt(
      this.obj.getStaticFriction() * this.obj.getStaticFriction() +
        other.getStaticFriction() * other.getStaticFriction()
    );

    // 정지 마찰 계수보다 큰 힘이 주어질 경우
    // 운동 마찰 계수를 이용해 마찰력을 결정한다.
    let frictionImpulse = undefined;
    if (Math.abs(jt) < j * staticFriction) {
      frictionImpulse = tangent.multiply(jt);
    } else {
      // 두 물체 사이의 운동 마찰 계수를 구한다.
      const dynamicFriction = Math.sqrt(
        this.obj.getDynamicFriction() * this.obj.getDynamicFriction() +
          other.getDynamicFriction() * other.getDynamicFriction()
      );
      frictionImpulse = tangent.multiply(-j * dynamicFriction);
    }

    this.obj.addVelocity(frictionImpulse.multiply(-this.obj.getInverseMass()));
    other.addVelocity(frictionImpulse.multiply(other.getInverseMass()));
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

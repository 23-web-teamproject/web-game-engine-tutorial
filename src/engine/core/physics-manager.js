import {
  BoxCollider,
  CircleCollider,
} from "/src/engine/data-structure/collider.js";

import BoxCollisionResolver from "/src/engine/core/box-collision-resolver.js";
import CircleCollisionResolver from "/src/engine/core/circle-collision-resolver.js";

/**
 * 씬 객체에 물리효과를 적용하는 책임은 PhysicsManager이 맡는다.
 * 물리효과를 적용할 객체들에게만 물리효과를 적용한다.
 *
 * 참고한 사이트
 * https://github.com/tutsplus/ImpulseEngine/
 * https://github.com/Kareus/SP2C/
 * https://kareus.tistory.com/15
 */
class PhysicsManager {
  /**
   * 물리효과가 적용될 객체들
   *
   * @property {array}
   * @static
   */
  static physicsEnableGameObjectList = new Array();

  constructor() {}

  /**
   * 씬 객체 내에 존재하는 오브젝트들중
   * 물리효과가 켜진 오브젝트들에게 물리효과를 계산해 적용한다.
   *
   * @param {GameObject} scene - 현재 씬
   * @param {number} deltaTime - 이전 프레임과 현재 프레임의 시간차
   */
  static update(scene, deltaTime) {
    PhysicsManager.collectPhysicsEnabledGameObjectToList(scene);

    const objectList = PhysicsManager.physicsEnableGameObjectList;
    const length = objectList.length;

    const manifoldList = new Array();
    for (let i = 0; i < length; i++) {
      const obj = objectList[i];

      // 충돌체크를 진행할 대상의 Collider 타입에 따라
      // Resolver를 선택해 진행한다.
      let collisionResolver = null;
      if (obj.collider instanceof BoxCollider) {
        collisionResolver = new BoxCollisionResolver(obj);
      }
      if (obj.collider instanceof CircleCollider) {
        collisionResolver = new CircleCollisionResolver(obj);
      }

      // 현재 객체가 다른 객체와 충돌했는지 검사한다.
      // 만약 충돌했을 경우 이벤트함수를 실행하고 물리효과를 적용한다.
      for (let j = i + 1; j < length; j++) {
        const other = objectList[j];
        // 두 객체가 모두 static rigidbody일 경우에는
        // 충돌체크를 하지 않는다.
        if (obj.rigidbody.isStatic && other.rigidbody.isStatic) {
          continue;
        }

        // 두 객체의 레이어가 충돌체크를 하지 않는 레이어관계라면
        // 충돌체크를 하지 않는다.
        if (
          obj.getLayer().canPhysicsInteractLayerWith(other.getLayer()) === false
        ) {
          continue;
        }
        if (collisionResolver.isCollideWith(other)) {
          const manifold = collisionResolver.resolveCollision(other);
          if (manifold !== undefined) {
            manifoldList.push(manifold);
          }
        }
      }
    }

    /**
     * 물체의 가속도를 적분하여 속도에 누적한다.
     */
    objectList.forEach((obj) => {
      obj.integrateForce(deltaTime);
    });

    /**
     * 물체의 충돌을 계산하여 속도를 변화시킨다.
     */
    manifoldList.forEach((manifold) => {
      if (
        manifold.objA.rigidbody.isTrigger === false &&
        manifold.objB.rigidbody.isTrigger === false
      ) {
        PhysicsManager.applyImpulse(
          manifold.objA,
          manifold.objB,
          manifold.normal
        );
      }
      manifold.objA.onCollision(manifold.objB);
      manifold.objB.onCollision(manifold.objA);
    });

    /**
     * 속도를 적분하여 좌표값에 누적한다.
     */
    objectList.forEach((obj) => {
      obj.integrateVelocity(deltaTime);
    });

    /**
     * 서로 겹쳐지는 상황을 피하기 위해
     * 겹친 도형끼리 멀어지는 연산을 한다.
     */
    manifoldList.forEach((manifold) => {
      if (
        manifold.objA.rigidbody.isTrigger === false &&
        manifold.objB.rigidbody.isTrigger === false
      ) {
        PhysicsManager.positionalCorrection(manifold);
      }
    });

    // 더이상 참조하지 않기 위해 리스트를 초기화한다.
    PhysicsManager.physicsEnableGameObjectList = new Array();
  }

  /**
   * 씬 객체 내에 존재하는 모든 오브젝트들중
   * 물리효과를 받는 오브젝트들만 모아 리스트에 담는다.
   * 모든 객체를 조사해야하기 때문에 재귀호출하여 탐색한다.
   *
   * @param {GameObject} scene - 현재 씬
   */
  static collectPhysicsEnabledGameObjectToList(scene) {
    scene.childList.forEach((child) => {
      if (child.isActive) {
        if (child.isPhysicsEnable) {
          PhysicsManager.physicsEnableGameObjectList.push(child);
        }

        if (child.childList.length > 0) {
          PhysicsManager.collectPhysicsEnabledGameObjectToList(child);
        }
      }
    });
  }

  /**
   * 두 객체에게 충격량을 적용한다.
   *
   * @param {GameObject} objA - 서로 충돌한 객체1
   * @param {GameObject} objB - 서로 충돌한 객체2
   * @param {Vector} normal - 반작용 방향
   */
  static applyImpulse(objA, objB, normal) {
    const diff = objB.getVelocity().minus(objA.getVelocity());
    const dot = diff.dot(normal);

    // 두 객체의 속도(velocity:벡터)의 내적값이 양수라면
    // 두 객체가 서로 다른 방향으로 이동하고 있는 것이 아니라는 말이므로
    // 충돌체크를 하지 않는다.
    if (dot > 0) {
      return;
    }

    // 유니티에서는 탄성값을 적용할 때 avg, min, max 중 하나를 적용한다.
    // 여기서는 일단 min으로 적용한다.
    const e = Math.min(objA.getBounceness(), objB.getBounceness());

    // 충격량을 구하는 방정식을 통해 충격량을 계산한다.
    // 저도 잘 몰라요.
    let j = -(1 + e) * dot;
    j /= objA.getInverseMass() + objB.getInverseMass();
    const impulse = normal.multiply(j);

    objA.addVelocity(impulse.multiply(-objA.getInverseMass()));
    objB.addVelocity(impulse.multiply(objB.getInverseMass()));

    PhysicsManager.applyFriction(objA, objB, normal, j);
  }

  /**
   * 정지 마찰 계수와 운동 마찰 계수를 통해 마찰력을 적용한다.
   *
   * @param {GameObject} objA - 서로 충돌한 객체1
   * @param {GameObject} objB - 서로 충돌한 객체2
   * @param {Vector} normal - 반작용 방향
   * @param {number} j - 충격량
   */
  static applyFriction(objA, objB, normal, j) {
    // 충격이 전달된 후의 속도로 계산을 진행한다.
    // 두 물체의 속도 벡터의 차로 마찰이 작용할 방향을 찾는다.
    const relativeVelocity = objB.getVelocity().minus(objA.getVelocity());

    // relativeVelocity를 n에 정사영하여 normal방향 성분을 얻고,
    // 그 성분값을 다시 relativeVelocity에 빼서 normal에
    // 수직인 벡터를 구한다.
    let tangent = relativeVelocity.minus(
      normal.multiply(relativeVelocity.dot(normal))
    );
    tangent = tangent.normalize();

    // 마찰력의 크기를 구한다.
    let jt = -relativeVelocity.dot(tangent);
    jt /= objA.getInverseMass() + objB.getInverseMass();

    // 두 물체 사이의 정지 마찰 계수를 구한다.
    const staticFriction = Math.sqrt(
      objA.getStaticFriction() * objA.getStaticFriction() +
        objB.getStaticFriction() * objB.getStaticFriction()
    );

    // 정지 마찰 계수보다 큰 힘이 주어질 경우
    // 운동 마찰 계수를 이용해 마찰력을 결정한다.
    let frictionImpulse = null;
    if (Math.abs(jt) < j * staticFriction) {
      frictionImpulse = tangent.multiply(jt);
    } else {
      // 두 물체 사이의 운동 마찰 계수를 구한다.
      const dynamicFriction = Math.sqrt(
        objA.getDynamicFriction() * objA.getDynamicFriction() +
          objB.getDynamicFriction() * objB.getDynamicFriction()
      );
      frictionImpulse = tangent.multiply(-j * dynamicFriction);
    }

    objA.addVelocity(frictionImpulse.multiply(-objA.getInverseMass()));
    objB.addVelocity(frictionImpulse.multiply(objB.getInverseMass()));
  }

  /**
   * 충돌처리가 되었지만 서서히 빠져버리는 버그를 해결하기 위해
   * 충돌된 위치에서 정해진 값만큼 강제로 떨어지게 한다.
   *
   * @param {Manifold} manifold - 충돌체크의 결과
   */
  static positionalCorrection(manifold) {
    const percentage = 0.4; // ??? 0.2 ~ 0.8
    const slop = 0.05; // ??? 0.01 ~ 0.1
    const correction = manifold.normal.multiply(
      (Math.max(manifold.penetrationDepth - slop, 0) /
        (manifold.objA.getInverseMass() + manifold.objB.getInverseMass())) *
        percentage
    );

    let objACorrection = correction.multiply(-manifold.objA.getInverseMass());
    let objBCorrection = correction.multiply(manifold.objB.getInverseMass());
    manifold.objA.addPosition(objACorrection);
    manifold.objB.addPosition(objBCorrection);
  }
}

export default PhysicsManager;

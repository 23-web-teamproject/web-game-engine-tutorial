/*
 * 씬 객체에 물리효과를 적용하려면 PhysicsManager를 사용하여야 한다.
 * 물리효과를 적용할 객체들에게만 물리효과를 적용한다.
 */
import { CircleCollider } from "/src/engine/data-structure/collider.js";
import BoxCollisionResolver from "/src/engine/core/box-collision-resolver.js";
import CircleCollisionResolver from "/src/engine/core/circle-collision-resolver.js";
import Vector from "/src/engine/data-structure/vector.js";

export default class PhysicsManager {
  static physicsEnableGameObjectList = new Array();
  constructor() {}

  /*
   * 씬 객체 내에 존재하는 오브젝트들중
   * 물리효과가 켜진 오브젝트들에게 물리효과를 계산해 적용한다.
   */
  static update(scene, deltaTime) {
    PhysicsManager.collectPhysicsEnabledGameObjectToList(scene);

    const length = PhysicsManager.physicsEnableGameObjectList.length;
    for (let i = 0; i < length; i++) {
      const obj = PhysicsManager.physicsEnableGameObjectList[i];

      // 충돌체크를 진행할 대상의 Collider 타입에 따라
      // Resolver를 선택해 진행한다.
      // 기본적으로 BoxCollider를 사용해 충돌검사를 수행한다.
      let collisionResolver = new BoxCollisionResolver(obj);
      if (obj.collider instanceof CircleCollider) {
        collisionResolver = new CircleCollisionResolver(obj);
      }

      // 현재 객체가 다른 객체와 충돌했는지 검사한다.
      // 만약 충돌했을 경우 이벤트함수를 실행하고 물리효과를 적용한다.
      for (let j = i + 1; j < length; j++) {
        const other = PhysicsManager.physicsEnableGameObjectList[j];
        if (collisionResolver.isCollideWith(other)) {
          obj.onCollision(other);
          other.onCollision(obj);
          collisionResolver.resolveCollision(other);
        }
      }
    }

    // 모든 물리효과가 켜진 객체에게 물리효과를 적용한다.
    PhysicsManager.physicsEnableGameObjectList.forEach((obj) => {
      if (obj.rigidbody.isStatic) {
        obj.transform.velocity = new Vector(0, -1);
      } else {
        obj.updatePhysics(deltaTime);
      }
    });

    // 더이상 참조하지 않기 위해 리스트를 초기화한다.
    PhysicsManager.physicsEnableGameObjectList = new Array();
  }

  /*
   * 씬 객체 내에 존재하는 모든 오브젝트들중
   * 물리효과를 받는 오브젝트들만 모아 리스트에 담는다.
   * 모든 객체를 조사해야하기 때문에 재귀호출하여 탐색한다.
   */
  static collectPhysicsEnabledGameObjectToList(scene) {
    for (const child of Object.values(scene.childTable)) {
      if (child.isPhysicsEnable) {
        PhysicsManager.physicsEnableGameObjectList.push(child);
      }

      if (Object.keys(child.childTable).length > 0) {
        PhysicsManager.collectPhysicsEnabledGameObjectToList(child);
      }
    }
  }
}

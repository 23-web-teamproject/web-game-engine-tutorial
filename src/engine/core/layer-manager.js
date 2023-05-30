/**
 * 객체의 종류를 나누기 위해 레이어를 사용한다.
 * 예를 들어, 벽이나 땅같은 객체들은 지형 레이어에 속하고,
 * 아군이나 적은 유닛 레이어에, 화살이나 포탄, 총알 등은 투사체 레이어에 속한다.
 * 이는 물리엔진에서 활용되어 객체가 특정 레이어에 속하는
 * 객체의 충돌을 무시할 수 있다.
 * LayerManager에서는 각 레이어의 상태를 관리한다.
 */
class LayerManager {
  /**
   * 전체 레이어의 목록을 나타낸다.
   * 새로운 Layer클래스를 생성하는 순간 Layer클래스의 생성자에 의해
   * layerSet에 그 레이어가 추가된다.
   *
   * @property {Set}
   * @static
   */
  static layerSet = new Set();

  /**
   * map에 각 레이어별로 Set을 만들어
   * 다른 레이어와 충돌체크가 가능한지 나타낸다.
   *
   * 만약 어떤 레이어의 Set에 특정 레이어의 이름이 있다면
   * 그 레이어와 충돌체크를 진행하게 된다.
   * 반대로 어떤 레이어의 Set에 특정 레이어의 이름이 없다면
   * 그 레이어와 충돌체크를 진행하지 않는다.
   *
   * ex.
   * a의 Set이 {'a','b','c'}라면, a레이어는 a, b, c레이어와
   * 충돌체크를 진행하게 된다.
   *
   * @property {Map}
   * @static
   */
  static physicsInteractionMap = new Map();

  constructor() {}

  /**
   * physicsInterationMap에 모든 레이어별로 Set을 생성하고,
   * 각 Set에 모든 레이어를 추가한다.
   */
  static initializePhysicsInteractionState() {
    LayerManager.layerSet.forEach((layerName) => {
      const layerSet = new Set(LayerManager.layerSet);
      LayerManager.physicsInteractionMap.set(layerName, layerSet);
    });
  }

  /**
   * 두 레이어간 충돌체크를 할 것인지를 설정한다.
   * isEnable이 true라면 두 레이어간 충돌체크를 활성화한다.
   *
   * @param {Layer} layerA - 충돌체크를 설정할 레이어
   * @param {Layer} layerB - 충돌체크를 설정할 레이어
   * @param {boolean} isEnable - 충돌체크의 활성화 여부
   */
  static setPhysicsInteration(layerClassA, layerClassB, isEnable) {
    const layerA = layerClassA.name;
    const layerB = layerClassB.name;
    if (isEnable) {
      LayerManager.physicsInteractionMap.get(layerA).add(layerB);
      LayerManager.physicsInteractionMap.get(layerB).add(layerA);
    } else {
      LayerManager.physicsInteractionMap.get(layerA).delete(layerB);
      LayerManager.physicsInteractionMap.get(layerB).delete(layerA);
    }
  }
}

export default LayerManager;

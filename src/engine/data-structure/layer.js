import LayerManager from "/src/engine/core/layer-manager.js";

/**
 * Layer클래스는 객체가 어느 레이어에 속하는지를 나타내고,
 * 물리엔진에서 이 객체가 다른 객체와 충돌했는지 판단할 때
 * LayerManager에 명시된 상태에 따라 충돌을 무시할지 결정한다.
 */
class Layer {
  /**
   * 전체 레이어 목록에 새로운 레이어가 없다면 이 레이어를 목록에 추가하고,
   * physicsInteractionMap에 있는 다른 레이어에 이 레이어를 추가하여
   * 충돌체크를 진행하게 한다.
   *
   * @constructor
   * @param {function(new:Layer)} layerConstructor
   */
  constructor(layerConstructor) {
    if (LayerManager.layerSet.has(layerConstructor.name) === false) {
      LayerManager.physicsInteractionMap.set(
        layerConstructor.name,
        new Set(LayerManager.layerSet)
      );
      LayerManager.physicsInteractionMap.forEach((value) => {
        value.add(layerConstructor.name);
      });
      LayerManager.layerSet.add(layerConstructor.name);
    }
  }

  /**
   * 이 레이어와 다른 레이어가 충돌체크를 할 수 있다면 true를 반환한다.
   *
   * @param {Layer} otherLayer
   * @returns {boolean}
   */
  canPhysicsInteractLayerWith(otherLayer) {
    return LayerManager.physicsInteractionMap
      .get(this.constructor.name)
      .has(otherLayer.constructor.name);
  }
}

/**
 * 기본 레이어다.
 *
 * @extends {Layer}
 */
class DefaultLayer extends Layer {
  constructor() {
    super(DefaultLayer);
  }
}

/**
 * 지형을 나타내는 레이어다.
 *
 * @extends {Layer}
 */
class TerrainLayer extends Layer {
  constructor() {
    super(TerrainLayer);
  }
}

/**
 * 캐릭터, 적, NPC 등을 나타내는 레이어다.
 *
 * @extends {Layer}
 */
class UnitLayer extends Layer {
  constructor() {
    super(UnitLayer);
  }
}

export { DefaultLayer, Layer, TerrainLayer, UnitLayer };

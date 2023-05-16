import { GameObject, Vector, ParticleEffect } from "/src/engine/module.js";

export default class TutorialScene5 extends GameObject {
  constructor() {
    super();
    this.particleEffect = new ParticleEffect({
      isEnable: true,
      isScaleFade: false,
      isAlphaFade: true,
      countPerSecond: 15,
      direction: 45,
      diffuseness: 15,
      speed: 120,
      lifeTime: 10,
      transform: {
        position: new Vector(100,600)
      }
    });
    this.addChild(this.particleEffect);
  }
}

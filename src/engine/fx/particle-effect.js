import GameObject from "/src/engine/core/game-object.js";
import Sprite from "/src/engine/core/sprite.js";
import Vector from "/src/engine/data-structure/vector.js";

import { typeCheck, typeCheckAndClamp } from "/src/engine/utils.js";

/**
 * 파티클 이펙트에 사용할 파티클이다.
 * 파티클 효과의 종류는 점점 투명해지면서 사라지는 것,
 * 크기가 작아지면서 사라지는 것 등이 있다.
 *
 * @extends {Sprite}
 */
class Particle extends Sprite {
  /**
   * @constructor
   * @param {object} options
   * @param {number} [options.lifeTime]
   * @param {number} [options.initialLifeTime]
   * @param {boolean} [options.isScaleFade]
   * @param {boolean} [options.isAlphaFade]
   * @param {number} [options.direction]
   * @param {number} [options.diffuseness]
   * @param {number} [options.speed]
   * @param {Color} [options.color]
   * @param {boolean} [options.isColorOverlayEnable]
   * @param {Color} [options.overlayColor]
   * @param {boolean} [options.isPhysicsEnable]
   * @param {Transform} [options.transform]
   * @param {RigidBody} [options.rigidbody]
   */
  constructor(options) {
    super(options);
    /** @type {number} */
    this.lifeTime = options.lifeTime;
    /** @type {number} */
    this.initialLifeTime = options.lifeTime;
    /** @type {boolean} */
    this.isScaleFade = options.isScaleFade;
    /** @type {boolean} */
    this.isAlphaFade = options.isAlphaFade;

    /** @type {number} */
    this.direction =
      options.direction -
      options.diffuseness +
      Math.random() * options.diffuseness * 2;

    /** @type {number} */
    this.speed = options.speed;

    const rad = -(this.direction * Math.PI) / 180;
    /** @type {Vector} */
    this.forward = new Vector(
      Math.cos(rad) * this.speed,
      Math.sin(rad) * this.speed
    );
    if (this.isPhysicsEnable) {
      this.addVelocity(forward);
    }
  }

  /**
   * 파티클 효과를 업데이트한다.
   * 지속 시간이 지났다면 제거한다.
   *
   * @param {number} deltaTime - 이전 프레임와 현재 프레임의 시간차
   */
  update(deltaTime) {
    super.update(deltaTime);

    this.fadeAway();
    if (this.isPhysicsEnable === false) {
      this.spreadOut(deltaTime);
    }

    this.lifeTime -= deltaTime;

    if (this.lifeTime < 0) {
      this.destroy();
    }
  }

  /**
   * 각 파티클 효과가 켜져있다면 그 파티클 효과를 적용한다.
   */
  fadeAway() {
    if (this.isScaleFade) {
      this.setLocalScale(
        new Vector(
          this.lifeTime / this.initialLifeTime,
          this.lifeTime / this.initialLifeTime
        )
      );
    }
    if (this.isAlphaFade) {
      this.color.a = this.lifeTime / this.initialLifeTime;
    }
  }

  /**
   * 만약 물리효과가 적용되지 않는다면 직접 position을 변경해야한다.
   *
   * @param {number} deltaTime - 이전 프레임와 현재 프레임의 시간차
   */
  spreadOut(deltaTime) {
    this.addPosition(this.forward.multiply(deltaTime));
  }
}

/**
 * 폭죽이 터지는 효과나 탄환 궤적 효과 등을 만드는 객체다.
 *
 * @extends {GameObject}
 */
class ParticleEffect extends GameObject {
  /**
   * @constructor
   * @param {object} options
   * @param {boolean} [options.isEnable]
   * @param {number} [options.duration]
   * @param {boolean} [options.isScaleFade]
   * @param {boolean} [options.isAlphaFade]
   * @param {number} [options.countPerSecond]
   * @param {number} [options.direction]
   * @param {number} [options.diffuseness]
   * @param {number} [options.speed]
   * @param {number} [options.lifeTime]
   * @param {string} [options.imagePath]
   * @param {boolean} [options.isParticlePhysicsEnable]
   * @param {Color} [options.color]
   * @param {boolean} [options.isColorOverlayEnable]
   * @param {Color} [options.overlayColor]
   * @param {Transform} [options.transform]
   * @param {RigidBody} [options.rigidbody]
   */
  constructor(options) {
    super(options);

    /**
     * 파티클 이미지가 없을 때 기본으로 사용할 이미지의 경로
     *
     * @type {string}
     * */
    this.defaultParticleImage = "/src/engine/assets/defaultParticleImage.png";

    /**
     * 파티클이 생성되려면 isEnable이 true여야 한다.
     * 기본값은 false다.
     *
     * @type {boolean}
     */
    this.isEnable = typeCheck(options.isEnable, "boolean", false);
    /**
     * 파티클 이펙트의 지속시간을 말한다.
     * 이 값이 0이라면 파티클 이펙트가 무한히 재생된다.
     * 이 값이 3이라면 3초 동안만 파티클 이펙트가 재생된다.
     * 기본값은 0이다.
     */
    this.duration = typeCheckAndClamp(
      options.duration,
      "number",
      0,
      0,
      Number.MAX_VALUE
    );
    /**
     * 이 값이 true라면 파티클이 점점 크기가 작아지는 효과를 낸다.
     * 기본값은 true다.
     *
     * @type {boolean}
     */
    this.isScaleFade = typeCheck(options.isScaleFade, "boolean", true);
    /**
     * 이 값이 true라면 파티클이 점점 투명해진다.
     * 기본값은 true다.
     *
     * @type {boolean}
     */
    this.isAlphaFade = typeCheck(options.isAlphaFade, "boolean", true);
    /**
     * 1초동안 생성할 파티클의 개수를 의미한다.
     * 파티클 생성 주기는 이 값에 의해 결정된다.
     * 값의 범위는 1 ~ 100이다.
     * 기본값은 10이다.
     *
     * @type {number}
     */
    this.countPerSecond = typeCheckAndClamp(
      options.countPerSecond,
      "number",
      30,
      1,
      100
    );
    /**
     * 파티클이 생성되어 퍼져나가는 주 방향을 의미한다.
     * 값의 범위는 0 ~ 360이다.
     * 기본값은 0(degree)이다.
     *
     * @type {number}
     */
    this.direction = typeCheckAndClamp(options.direction, "number", 0, 0, 360);
    /**
     * 파티클이 생성되고 나서 퍼져나갈 때 퍼짐 정도를 의미한다.
     * 파티클이 퍼져나가는 방향은 최종적으로 아래에 명시된 범위이다.
     * direction - diffuseness ~ direction + diffuseness
     *
     * 만약 direction이 90도이고 diffuseness가 30도라면
     * 파티클은 60도 ~ 120도 사이 방향중에서 랜덤하게 결정된 방향으로 퍼진다.
     * 값의 범위는 0 ~ 180이다.
     * 기본값은 30(degree)이다
     *
     * @type {number}
     */
    this.diffuseness = typeCheckAndClamp(
      options.diffuseness,
      "number",
      30,
      0,
      180
    );
    /**
     * 파티클이 날아가는 속도를 의미한다.
     * 값이 낮을수록 파티클이 멀리 퍼지지 않게 된다.
     * 값의 범위는 10 ~ 1000이다.
     * 기본값은 10이다.
     *
     * @type {number}
     */
    this.speed = typeCheckAndClamp(options.speed, "number", 100, 10, 1000);
    /**
     * lifeTime은 생성된 파티클이 몇 초동안 화면에 보일지를 의미한다.
     * 값의 범위는 0.1 ~ 10.0이다.
     * 기본값은 3초다.
     *
     * @type {number}
     */
    this.lifeTime = typeCheckAndClamp(options.lifeTime, "number", 3, 0.1, 10);
    /**
     * 파티클의 이미지 경로를 의미한다.
     * 기본값으로는 엔진에 딸린 이미지를 불러오게 된다.
     *
     * @type {string}
     */
    this.imagePath = typeCheck(
      options.imagePath,
      "string",
      this.defaultParticleImage
    );
    /**
     * 만약 isPhysicsEnabled가 true라면, 파티클에도 물리효과가 적용된다.
     * 기본값은 false다.
     *
     * @type {boolean}
     */
    this.isParticlePhysicsEnable = typeCheck(
      options.isParticlePhysicsEnable,
      "boolean",
      false
    );
    /**
     * 파티클 효과가 켜진 후 지난 시간을 나타낸다.
     *
     * @type {number}
     */
    this.elapsedTime = 0;
    /**
     * 파티클 효과가 켜진 후 지난 시간을 나타낸다.
     * elapsedTime과 다른 점은 이 값은 파티클 생성에 사용되기 때문에
     * 이 값이 unitTime보다 커질 경우 파티클을 생성하게 된다.
     *
     * @type {number}
     */
    this.accumulatedTime = 0;

    if (this.isEnable) {
      this.run();
    }
  }

  /**
   * 만약 isEnable이 true라면 일정 시간마다 파티클을 생성한다.
   *
   * @param {number} deltaTime - 이전 프레임와 현재 프레임의 시간차
   */
  update(deltaTime) {
    super.update(deltaTime);
    if (this.isEnable) {
      this.elapsedTime += deltaTime;
      this.accumulatedTime += deltaTime;

      // 파티클 효과가 켜지면 파티클들을 생성한다.
      // 누적된 시간이 unitTime보다 커질 때에만 파티클을 생성한다.
      if (this.accumulatedTime > this.unitTime) {
        this.accumulatedTime %= this.unitTime;
        this.createParticle();
      }

      if (this.duration > 0 && this.elapsedTime > this.duration) {
        this.stop();
      }
    }
  }

  createParticle() {
    const options = {
      direction: this.direction,
      diffuseness: this.diffuseness,
      speed: this.speed,
      lifeTime: this.lifeTime,
      isPhysicsEnable: this.isParticlePhysicsEnable,
      isAlphaFade: this.isAlphaFade,
      isScaleFade: this.isScaleFade,
      imagePath: this.imagePath,
    };
    const newParticle = new Particle(options);
    this.addChild(newParticle);
    console.log(newParticle.isActive, newParticle.hasParentGameObject());
  }

  /**
   * 파티클 효과를 켠다.
   */
  run() {
    this.isEnable = true;
    // countPerSecond를 이용해서 파티클 1개를 생성하려면
    // 정확히 몇 초가 지나야지만 생성할 수 있는지 미리 계산한다.
    this.unitTime = 1 / this.countPerSecond;
    this.elapsedTime = 0;
    this.accumulatedTime = 0;
  }

  /**
   * 파티클 효과를 끈다.
   */
  stop() {
    this.isEnable = false;
  }
}

export default ParticleEffect;

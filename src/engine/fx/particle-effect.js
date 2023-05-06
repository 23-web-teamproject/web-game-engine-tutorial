/*
 * 폭죽이 터지는 효과나 탄환 궤적 효과 등을 내기 위해서는
 * 파티클 이펙트를 사용하면 된다.
 *
 * 파티클의 종류에는 점점 투명해지면서 사라지는 것, 크기가 작아지면서 사라지는 것 등이 있다.
 */
import GameObject from "/src/engine/core/game-object.js";
import Sprite from "/src/engine/core/sprite.js";
import Vector from "/src/engine/data-structure/vector.js";
import { typeCheck, typeCheckAndClamp } from "/src/engine/utils.js";

class Particle extends Sprite {
  constructor(options) {
    super(options);
    this.lifeTime = options.lifeTime;
    this.initialLifeTime = options.lifeTime;
    this.isScaleFade = options.isScaleFade;
    this.isAlphaFade = options.isAlphaFade;

    this.direction =
      options.direction -
      options.diffuseness +
      Math.random() * options.diffuseness * 2;

    this.speed = options.speed;

    const rad = -(this.direction * Math.PI) / 180;
    this.forward = new Vector(
      Math.cos(rad) * this.speed,
      Math.sin(rad) * this.speed
    );
    if (this.isPhysicsEnable) {
      this.addVelocity(forward);
    }
  }

  update(deltaTime) {
    this.fadeAway();
    if (this.isPhysicsEnable === false) {
      this.spreadOut(deltaTime);
    }

    this.lifeTime -= deltaTime;

    if (this.lifeTime < 0) {
      this.destroy();
    }
  }

  draw() {
    super.draw();
  }

  fadeAway() {
    if (this.isScaleFade) {
      this.setScale(
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

  /*
   * 만약 물리효과가 적용되지 않는다면 직접 position을 변경해야한다.
   */
  spreadOut(deltaTime) {
    this.addPosition(this.forward.multiply(deltaTime));
  }
}

export default class ParticleEffect extends GameObject {
  constructor(options) {
    super(options);

    this.defaultParticleImage = "/src/engine/assets/defaultParticleImage.png";

    /*
     * 파티클이 생성되려면 isEnable이 true여야 한다. 기본값은 false다.
     */
    this.isEnable = typeCheck(options.isEnable, "boolean", false);
    /*
     * 파티클이 점점 크기가 작아질건지를 의미한다.
     * 기본값은 true다.
     */
    this.isScaleFade = typeCheck(options.isScaleFade, "boolean", true);
    /*
     * 파티클이 점점 투명해질건지를 의미한다.
     * 기본값은 true다.
     */
    this.isAlphaFade = typeCheck(options.isAlphaFade, "boolean", true);
    /*
     * 1초동안 생성할 파티클의 개수를 의미한다.
     * 1 ~ 100 사이의 값을 지정할 수 있다. 기본값은 10이다.
     * 파티클 생성 주기는 이 값에 의해 결정된다.
     */
    this.countPerSecond = typeCheckAndClamp(
      options.countPerSecond,
      "number",
      30,
      1,
      100
    );
    /*
     * 파티클이 생성되어 퍼져나가는 주 방향을 의미한다.
     * 0 ~ 360 사이의 값을 지정할 수 있다. 기본값은 0(degree)이다.
     */
    this.direction = typeCheckAndClamp(options.direction, "number", 0, 0, 360);
    /*
     * 파티클이 생성되고 나서 퍼져나갈 때 퍼짐 정도를 의미한다.
     * 파티클이 퍼져나가는 방향은 최종적으로 아래에 명시된 범위이다.
     * direction - diffuseness ~ direction + diffuseness
     *
     * 만약 direction이 90도이고 diffuseness가 30도라면
     * 파티클은 60도 ~ 120도 사이 방향중에서 랜덤하게 결정된 방향으로 퍼진다.
     * 0 ~ 180 사이의 값을 지정할 수 있다. 기본값은 30(degree)이다
     */
    this.diffuseness = typeCheckAndClamp(
      options.diffuseness,
      "number",
      30,
      0,
      180
    );
    /*
     * 파티클이 날아가는 속도를 의미한다.
     * 값이 낮을수록 파티클이 멀리 퍼지지 않게 된다.
     * 100 ~ 1000 사이의 값을 지정할 수 있다. 기본값은 10이다.
     */
    this.speed = typeCheckAndClamp(options.speed, "number", 100, 10, 1000);
    /*
     * lifeTime은 생성된 파티클이 몇 초동안 화면에 보일지를 의미한다.
     * 0.1 ~ 10.0 사이의 값을 지정할 수 있다. 기본값은 3초다.
     */
    this.lifeTime = typeCheckAndClamp(options.lifeTime, "number", 3, 0.1, 10);
    /*
     * 파티클의 이미지 경로를 의미한다.
     * 기본값으로는 엔진에 딸린 이미지를 불러오게 된다.
     */
    this.imagePath = typeCheck(
      options.imagePath,
      "string",
      this.defaultParticleImage
    );
    /*
     * 만약 isPhysicsEnabled가 true라면, 파티클에도 물리효과를 적용해야한다.
     * 기본값은 false다.
     */
    this.isParticlePhysicsEnable = typeCheck(
      options.isParticlePhysicsEnable,
      "boolean",
      false
    );
    /*
     * 파티클을 일정 시간마다 생성하기 위해 시간이 얼마나 지났는지 알아야 하므로
     * 파티클효과가 켜진 후 지난 시간을 나타낸다.
     */
    this.elapsedTime = 0;

    if(this.isEnable){
      this.run();
    }
  }

  update(deltaTime) {
    super.update(deltaTime);
    if (this.isEnable) {
      this.elapsedTime += deltaTime;

      // 파티클 효과가 켜지면 파티클들을 생성한다.
      // 누적된 시간이 unitTime보다 커질 때에만 파티클을 생성한다.
      if (this.elapsedTime > this.unitTime) {
        this.elapsedTime %= this.unitTime;
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
      }
    }
  }

  run() {
    this.isEnable = true;
    // countPerSecond를 이용해서 파티클 1개를 생성하려면
    // 정확히 몇 초가 지나야지만 생성할 수 있는지 미리 계산한다.
    this.unitTime = 1 / this.countPerSecond;
    this.elapsedTime = 0;
  }

  stop() {
    this.isEnable = false;
  }
}

/*
 * 폭죽이 터지는 효과나 탄환 궤적 효과 등을 내기 위해서는
 * 파티클 이펙트를 사용하면 된다.
 *
 * 파티클의 종류에는 점점 투명해지면서 사라지는 것, 크기가 작아지면서 사라지는 것 등이 있다.
 */
import GameObject from "/src/engine/core/game-object.js";
import Sprite from "/src/engine/core/sprite.js";
import Vector from "/src/engine/data-structure/vector.js";

class Particle extends Sprite {
  constructor(options) {
    super(options.imageSrc);
    this.options = options;
    this.lifeTime = options.lifeTime;
    this.direction =
      options.direction -
      options.diffuseness +
      Math.random() * options.diffuseness * 2;
    this.speed = options.speed;
  }

  update(deltaTime) {
    this.lifeTime -= deltaTime;
    this.spreadOut(deltaTime);
    this.fadeAway();

    if (this.lifeTime < 0) {
      this.destroy();
    }
  }

  draw() {

    super.draw();
  }

  spreadOut(deltaTime) {
    const rad = (this.direction * Math.PI) / 180;
    const forward = new Vector(
      Math.cos(rad) * this.speed * deltaTime,
      Math.sin(rad) * this.speed * deltaTime
    );
    this.addPos(forward.x, forward.y);
  }

  fadeAway() {
    if (this.options.isScaleFade) {
      this.setScale(
        this.lifeTime / this.options.lifeTime,
        this.lifeTime / this.options.lifeTime
      );
    }
    if (this.options.isAlphaFade) {
      // TODO
      // alpha값 조절할 방법 추가해야함.
    }
  }
}

export default class ParticleEffect extends GameObject {
  constructor(options) {
    super();

    this.defaultParticleImage = "/src/engine/assets/defaultParticleImage.png";

    this.options = {
      /*
       * 파티클이 생성되려면 isEnable이 true여야 한다. 기본값은 false다.
       */
      isEnable: false,

      /*
       * 파티클이 점점 크기가 작아질건지를 의미한다.
       * 기본값은 true다.
       */
      isScaleFade: true,

      /*
       * 파티클이 점점 투명해질건지를 의미한다.
       * 기본값은 true다.
       */
      isAlphaFade: true,

      /*
       * 1초동안 생성할 파티클의 개수를 의미한다.
       * 1 ~ 100 사이의 값을 지정할 수 있다. 기본값은 10이다.
       * 파티클 생성 주기는 이 값에 의해 결정된다.
       */
      numberOverOneSecond: 30,

      /*
       * 파티클이 생성되어 퍼져나가는 주 방향을 의미한다.
       * 0 ~ 360 사이의 값을 지정할 수 있다. 기본값은 0(degree)이다.
       */
      direction: 0,

      /*
       * 파티클이 생성되고 나서 퍼져나갈 때 퍼짐 정도를 의미한다.
       * 파티클이 퍼져나가는 방향은 최종적으로 아래에 명시된 범위이다.
       * direction - diffuseness ~ direction + diffuseness
       *
       * 만약 direction이 90도이고 diffuseness가 30도라면
       * 파티클은 60도 ~ 120도 사이 방향중에서 랜덤하게 결정된 방향으로 퍼진다.
       * 0 ~ 180 사이의 값을 지정할 수 있다. 기본값은 30(degree)이다
       */
      diffuseness: 15,

      /*
       * 파티클이 날아가는 속도를 의미한다.
       * 값이 낮을수록 파티클이 멀리 퍼지지 않게 된다.
       * 100 ~ 1000 사이의 값을 지정할 수 있다. 기본값은 100이다.
       */
      speed: 100,

      /*
       * lifeTime은 생성된 파티클이 몇 초동안 화면에 보일지를 의미한다.
       * 0.1 ~ 5.0 사이의 값을 지정할 수 있다. 기본값은 3초다.
       */
      lifeTime: 3,

      /*
       * 파티클의 이미지 src를 의미한다.
       * 기본값으로는 엔진에 딸린 이미지를 불러오게 된다.
       */
      imageSrc: this.defaultParticleImage,
    };

    this.elapsedTime = 0;
    this.currentParticleCount = 0;
  }

  update(deltaTime) {
    super.update(deltaTime);
    if (this.isEnable) {
      this.elapsedTime += deltaTime;

      // 파티클 효과가 켜지면 파티클들을 생성한다.
      // 누적된 시간이 unitTime보다 커질 때에만 파티클을 생성한다.
      if (this.elapsedTime > this.unitTime) {
        this.elapsedTime %= this.unitTime;
        const newParticle = new Particle(this.options);
        // TODO
        // transformOrigin과 같은 속성이 좌상단으로 되어있다면?
        // 
        // const centerPos = newParticle.getCenterPos();
        // newParticle.addPos(-centerPos.x, -centerPos.y);
        this.addChild(newParticle);
      }
    }
  }

  render() {
    super.render();
  }

  run() {
    this.isEnable = true;
    // numberOverOneSecond를 이용해서 파티클 1개를 생성하려면
    // 정확히 몇 초가 지나야지만 생성할 수 있는지 미리 계산한다.
    this.unitTime = 1 / this.options.numberOverOneSecond;
    this.elapsedTime = 0;
  }

  stop() {
    this.isEnable = false;
  }
}

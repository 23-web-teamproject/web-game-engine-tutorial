/*
 * 이 객체는 이전 프레임과 현재 프레임의 시간차인
 *   deltaTime을 계산하는 일을 담당한다.
 *
 * 게임에서 1 프레임마다 캐릭터가 10픽셀씩 이동한다고 가정하자.
 * 60fps일 때는 1초에 60번 게임이 업데이트되므로,
 * 10픽셀 * 60 = 600픽셀만큼 캐릭터가 이동하게 된다.
 *
 * 반면 144fps일떄는 1초에 144번 게임이 업데이트되므로,
 * 10픽셀 * 144 = 1440픽셀만큼 캐릭터가 이동하게 된다.
 * 즉 프레임에 의해 캐릭터가 이동하는 거리가 달라지게 된다.
 *
 * fps에 따라서 캐릭터가 이동하는 거리가 달라지므로,
 * 정확한 이동거리를 보장할 수 없다.
 * 이를 보정하는 방법이 이동속도에 deltaTime을 곱하는 방법이다.
 *
 * 이 객체에서는 각 프레임간 시간차이를 계산하여 제공한다.
 * 엔진에서 매 update때마다 이 객체의 deltaTime을 하위의 오브젝트들에게 전달하여
 * 정확한 이동거리를 보장할 수 있게 한다.
 *
 * deltaTime에 대한 설명은 아래 게시글에서 찾아볼 수 있습니다.
 * https://bluemeta.tistory.com/1
 */

/*
 * deltaTime은 이전 프레임과 현재 프레임간의 시간 차이다.
 *
 *  frame     0         0.4   0.6             1
 *            +----------+-----+--------------+
 * deltaTime  |    0.4   | 0.2 |      0.4     |
 *
 * 위 그림에서 보이듯이 게임이 0.4초, 0.6초, 1초에 업데이트된다고 가정하자.
 * 캐릭터가 정확하게 100픽셀을 움직여야 한다고 하자.
 * 이 때 게임이 3번 업데이트되므로, 300픽셀을 움직이게 된다.
 * 하지만 업데이트될 때마다 deltaTime을 곱하면 아래처럼 정확히 100픽셀을 움직인다.
 *
 *  frame   deltaTime      이동 거리
 * -------+-----------+--------------
 *   0.4s |      0.4s | 100 x 0.4 = 40
 *   0.6s |      0.2s | 100 x 0.2 = 20
 *   1.0s |      0.4s | 100 x 0.4 = 40
 *
 * 이동거리를 모두 더하면 100픽셀이 된다.
 *
 * fps가 항상 고정된 수치는 아니기 때문에 fps가 요동칠 때마다
 * 정확한 이동거리를 보장해야한다. 이럴 때에 deltaTime이 그 책임을 담당한다.
 */
export default class Timer {
  constructor() {
    this.currentTime = performance.now();
    this.previousTime = this.currentTime;
    this.accumulatedTime = 0;
    this.deltaTimeLimit = 1 / 60;
  }

  update() {
    this.previousTime = this.currentTime;
    this.currentTime = performance.now();
    this.deltaTime = (this.currentTime - this.previousTime) / 1000;
    this.accumulatedTime += this.deltaTime;
    // if (this.accumulatedTime > this.deltaTimeLimit) {
    //   this.accumulatedTime = this.deltaTimeLimit;
    // }
  }
}

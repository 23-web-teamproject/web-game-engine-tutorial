/**
 * 게임에서 1 프레임마다 캐릭터가 10픽셀씩 이동한다고 가정하자.
 * 60fps일 때는 1초에 60번 게임이 업데이트되므로,
 * 10픽셀 * 60 = 600픽셀만큼 캐릭터가 이동하게 된다.
 *
 * 반면 144fps일때는 1초에 144번 게임이 업데이트되므로,
 * 10픽셀 * 144 = 1440픽셀만큼 캐릭터가 이동하게 된다.
 * 즉 프레임에 의해 캐릭터가 이동하는 거리가 달라지게 된다.
 *
 * fps에 따라서 캐릭터가 이동하는 거리가 달라지므로,
 * 정확한 이동거리를 보장할 수 없다.
 * 이를 보정하는 방법이 이동속도에 deltaTime을 곱하는 방법이다.
 *
 * 이 객체에서는 각 프레임간 시간차를 제공한다.
 * 엔진에서 매 update때마다 이 객체의 deltaTime을 하위의 오브젝트들에게 전달하여
 * 정확한 이동거리를 보장할 수 있게 한다.
 *
 * deltaTime에 대한 설명은 아래 게시글에서 찾아볼 수 있습니다.
 * https://bluemeta.tistory.com/1
 *
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
import { typeCheckAndClamp } from "/src/engine/utils.js";

/**
 * 이 객체는 이전 프레임과 현재 프레임의 시간차인
 * deltaTime을 계산하는 일을 담당한다.
 */
class Timer {
  constructor() {
    /**
     * 현재 프레임의 시간을 말한다.
     * 웹페이지가 열린 후 지난 시간이 저장된다.
     *
     * @type {number}
     */
    this.currentTime = this.getCurrentTime();
    /**
     * 이전 프레임의 시간을 말한다.
     *
     * @type {number}
     */
    this.previousTime = this.currentTime;
    /**
     * 현재 프레임의 시간과 이전 프레임의 시간의 차를 말한다.
     *
     * @type {number}
     */
    this.deltaTime = 0;
    /**
     * 매 프레임마다 누적된 deltaTime을 저장한다.
     *
     * @type {number}
     */
    this.accumulatedTime = 0;
    /**
     * 1초에 보여줄 프레임의 개수를 말한다.
     * 기본값으로 60이고, 24부터 MAX_VALUE 사이의 값을 저장할 수 있다.
     *
     * @type {number}
     */
    this.fps = 24;
    this.setFps(60);
    /**
     * 물리엔진에서는 가속도를 적분하여 속도를 나타내고,
     * 속도를 적분하여 이동거리를 나타내기 때문에
     * 정확한 연산을 위해서는 수식에서 사용할 ∇t가 일정해야한다.
     * 따라서 fixedDeltaTime은 이론적으로 1 프레임을 렌더링할 때
     * 걸리는 시간을 ∇t로 정한다.
     *
     * @type {number}
     */
    this.fixedDeltaTime = 0;
    this.setFixedDeltaTime();
  }

  /**
   * 현재 프레임과 이전 프레임간의 시간차를 구해 deltaTime에 저장하고,
   * 그 값을 accumulatedTime에 누적한다.
   *
   * 만약 accumulatedTime이 일정값보다 크다면 강제로 조정한다.
   * 이걸 조정하지 않으면 누적된 시간만큼 물리엔진을 업데이트하기 때문에
   * 긴 딜레이가 걸릴 수 있으므로 일부러 값을 낮춘다.
   */
  update() {
    this.currentTime = this.getCurrentTime();
    this.deltaTime = this.currentTime - this.previousTime;
    // 빠른 물리효과 업데이트를 위해 10을 곱하기로 했다.
    this.accumulatedTime += this.deltaTime * 10;
    if (this.accumulatedTime > 0.3) {
      this.accumulatedTime = 0.3;
    }
    this.previousTime = this.currentTime;
  }

  /**
   * 브라우저가 열린 후 또는 새로고침된 후 지난 시간을 반환한다.
   *
   * @returns {number} 초 단위의 지난 시간
   */
  getCurrentTime() {
    return performance.now() / 1000;
  }

  /**
   * 1초에 렌더링할 프레임의 개수를 설정한다.
   *
   * @param {number} fps - 프레임의 개수
   */
  setFps(fps) {
    this.fps = typeCheckAndClamp(fps, "number", 60, 24, Number.MAX_VALUE);
    this.setFixedDeltaTime();
  }

  /**
   * 물리엔진을 업데이트하기위한 fixedDeltaTime을 설정한다.
   * 이 때 Timer의 fps속성을 이용하여 계산한다.
   */
  setFixedDeltaTime() {
    this.fixedDeltaTime = 1 / this.fps;
  }
}

export default Timer;

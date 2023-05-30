import ResourceManager from "/src/engine/core/resource-manager.js";

/**
 * 사운드파일을 제어하는 역할을 담당한다.
 */
class SoundEffect {
  /**
   * @constructor
   * @param {string} path - 사운드파일의 경로
   */
  constructor(path) {
    this.source = ResourceManager.loadResource(path, Audio);
  }

  /**
   * 사운드 파일을 재생한다.
   */
  play() {
    this.source.play();
  }

  /**
   * 사운드 파일을 일시정지한다.
   */
  pause() {
    this.source.pause();
  }

  /**
   * 사운드 파일을 중지한다.
   */
  stop() {
    this.source.pause();
    this.source.currentTime = 0;
  }

  /**
   * 이 사운드 파일의 볼륨을 설정한다.
   *
   * @param {number} volumn - 음량 크기
   */
  setVolumn(volumn) {
    this.source.volume = volumn;
  }
}

export default SoundEffect;

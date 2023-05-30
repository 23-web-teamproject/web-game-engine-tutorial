import ResourceLoaderFactory from "/src/engine/core/resource-loader-factory.js";

/**
 * 리소스를 비동기로 로드하는 역할을 맡는다.
 * 모든 리소스가 불러와졌다면 등록된 콜백 함수를 호출한다.
 */
class ResourceManager {
  /**
   * 불러온 리소스의 개수
   *
   * @property {number}
   * @static
   */
  static loadedResourceCount = 0;
  /**
   * 불러와야할 리소스의 총 개수
   *
   * @property {number}
   * @static
   */
  static totalResourceCount = 0;
  /**
   * 모든 리소스가 불러와졌을 때 실행할 콜백함수
   *
   * @property {function}
   * @static
   */
  static allResourceLoadedCallback = () => {};

  constructor() {}

  /**
   * path를 경로로 하는 리소스를 생성한다.
   * 이 때 리소스는 constructor에 의해 생성된다.
   *
   * @param {string} path - 리소스의 경로
   * @param {Audio.constructor|Image.constructor} constructor - 리소스를 생성할 생성자
   * @param {function} [callback=() => {}] - 리소스가 생성된 이후에 실행할 콜백함수
   * @returns {HTMLAudioElement|HTMLImageElement}
   */
  static loadResource(path, constructor, callback = () => {}) {
    const resourceLoader = ResourceLoaderFactory.create(
      path,
      constructor,
      callback
    );

    return resourceLoader.load();
  }

  /**
   * 로드한 리소스의 개수를 count만큼 증가시킨다.
   *
   * @param {number} count - 로드한 리소스의 개수
   */
  static onResourceLoad(count) {
    ResourceManager.loadedResourceCount += count;

    if (ResourceManager.isAllResourceLoaded()) {
      ResourceManager.allResourceLoadedCallback();
      ResourceManager.removeResourceLoadedCallback();
    }
  }

  /**
   * 모든 리소스가 로드되었는지를 확인한다.
   *
   * @returns {boolean}
   */
  static isAllResourceLoaded() {
    return (
      ResourceManager.loadedResourceCount === ResourceManager.totalResourceCount
    );
  }

  /**
   * 모든 리소스가 로드되었을 때 실행될 콜백함수를 초기화한다.
   */
  static removeResourceLoadedCallback() {
    ResourceManager.allResourceLoadedCallback = () => {};
  }

  /**
   * 로드할 리소스의 총 개수를 증가시킨다.
   *
   * @param {number} count - 로드할 리소스의 개수
   */
  static addResourceCount(count) {
    ResourceManager.totalResourceCount += count;
  }

  /**
   * 모든 리소스가 로드되었을 때 실행할 콜백함수를 설정한다.
   *
   * @param {function} callback
   */
  static setAllResourceLoadedCallback(callback) {
    ResourceManager.allResourceLoadedCallback = callback;
  }

  /**
   * 로드해야할 리소스의 총 개수를 반환한다.
   *
   * @returns {number}
   */
  static getTotalResourceCount() {
    return ResourceManager.totalResourceCount;
  }

  /**
   * 로드한 리소스의 개수를 반환한다.
   *
   * @returns {number}
   */
  static getLoadedResourceCount() {
    return ResourceManager.loadedResourceCount;
  }
}

export default ResourceManager;

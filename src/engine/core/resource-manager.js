import SceneManager from "/src/engine/core/scene-manager.js";
import Path from "/src/engine/utils/path.js";

/**
 * 추상 팩토리 패턴을 사용하여 원하는 리소스를 불러오는
 * ResourceLoader 클래스를 생성해 반환한다.
 */
class ResourceLoaderFactory {
  constructor() {}

  /**
   *
   * @param {string} path - 리소스의 경로
   * @param {Audio|Image} Element - 리소스를 생성할 객체의 타입
   * @returns
   */
  static create(path, constructor) {
    if (constructor.name === "Audio") {
      return new AudioResourceLoader(path, constructor.name);
    } else if (constructor.name === "Image") {
      return new ImageResourceLoader(path, constructor.name);
    }
  }
}

/**
 * 리소스를 생성해 반환하는 추상클래스다.
 * 이 객체를 상속받은 하위 클래스에서 구체적인 생성방법을 정의한다.
 */
class ResourceLoader {
  /**
   * 생성자명에 따른 기본 리소스명을 의미한다.
   * 만약 리소스의 경로가 주어지지 않았다면 이 객체를 이용해
   * 기본 리소스를 생성하게 된다.
   *
   * @type {object}
   * @static
   */
  static defaultResourcePath = {
    Image: "defaultSpriteImage.png",
    Audio: "defaultSoundEffect.wav",
  };

  /**
   * @constructor
   * @param {string} path - 리소스의 경로
   * @param {string} constructorName - 리소스를 생성할 생성자명
   */
  constructor(path, constructorName) {
    if (typeof path === "string") {
      this.path = Path.convertToAbsoluteAssetPath(path);
    } else {
      this.path =
        "/src/engine/assets/" +
        ResourceLoader.defaultResourcePath[constructorName];
    }
  }

  /**
   * @abstract
   *
   * 이 클래스를 상속했다면 load()를 재정의하여
   * 구체적인 리소스 생성방법을 정의해야한다.
   */
  load() {}
}

/**
 * AudioElement를 생성해 반환한다.
 *
 * @extends ResourceLoader
 */
class AudioResourceLoader extends ResourceLoader {
  /**
   * @constructor
   * @param {string} path - 리소스의 경로
   * @param {string} constructorName - 리소스를 생성할 생성자명
   */
  constructor(path, constructorName) {
    super(path, constructorName);
  }

  /**
   * AudioElement를 생성해 반환한다.
   * @returns {HTMLAudioElement}
   */
  load() {
    const resource = new Audio(this.path);
    resource.addEventListener("loadeddata", ResourceManager.onResourceLoad);
    return resource;
  }
}

/**
 * ImageElement를 생성해 반환한다.
 *
 * @extends ResourceLoader
 */
class ImageResourceLoader extends ResourceLoader {
  /**
   * @constructor
   * @param {string} path - 리소스의 경로
   * @param {string} constructorName - 리소스를 생성할 생성자명
   */
  constructor(path, constructorName) {
    super(path, constructorName);
  }

  /**
   * ImageElement를 생성해 반환한다.
   * @returns {HTMLImageElement}
   */
  load() {
    const resource = new Image();
    resource.src = this.path;
    resource.addEventListener("load", ResourceManager.onResourceLoad);
    return resource;
  }
}

/**
 * 비동기로 리소스를 불러와야 할 때 리소스를 생성하는 역할과
 * 모든 리소스가 로드되었는지 확인하는 역할을 맡는다.
 */
export default class ResourceManager {
  /** @type {number} @static */
  static loadedResourceCount = 0;
  /** @type {number} @static */
  static totalResourceCount = 0;
  /** @type {boolean @static} */
  static isRunEngineEventOccurred = false;

  constructor() {}

  /**
   * path를 경로로 하는 리소스를 생성한다.
   * 이 때 리소스를 생성할 객체는 Element다.
   *
   * @param {string} path - 리소스의 경로
   * @param {Audio|Image} constructor - 리소스를 생성할 생성자
   * @returns {HTMLAudioElement|HTMLImageElement}
   */
  static loadResource(path, constructor) {
    const resourceLoader = ResourceLoaderFactory.create(path, constructor);

    ResourceManager.addResourceCount(1);

    return resourceLoader.load();
  }

  /**
   * 리소스 1개를 불러올 때 호출하여
   * loadedResourceCount를 1만큼 증가시킨다.
   * 그리고 모든 리소스가 불러와졌는지 검사한다.
   */
  static onResourceLoad() {
    ResourceManager.loadedResourceCount++;

    if (ResourceManager.isRunEngineEventOccurred === false) {
      ResourceManager.checkAllResourceLoaded();
    }
  }

  /**
   * 불러올 리소스의 총 개수를 증가시킨다.
   *
   * @param {number} count - 불러올 리소스의 개수
   */
  static addResourceCount(count) {
    ResourceManager.totalResourceCount += count;
  }

  /**
   * loadedResourceCount와 totalResourceCount를 비교해
   * 값이 일치하면 runEngine 이벤트를 발생시킨다.
   */
  static checkAllResourceLoaded() {
    if (
      ResourceManager.loadedResourceCount === ResourceManager.totalResourceCount
    ) {
      const runEngine = new Event("runEngine", { bubbles: true });
      window.dispatchEvent(runEngine);
      ResourceManager.isRunEngineEventOccurred = true;
    }
  }

  /**
   * 불러와야할 리소스의 총 개수를 반환한다.
   *
   * @returns {number}
   */
  static getTotalResourceCount() {
    return ResourceManager.totalResourceCount;
  }

  /**
   * 불러온 리소스의 개수를 반환한다.
   *
   * @returns {number}
   */
  static getLoadedResourceCount() {
    return ResourceManager.loadedResourceCount;
  }
}

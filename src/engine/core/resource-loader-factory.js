import ResourceManager from "/src/engine/core/resource-manager.js";

import Path from "/src/engine/utils/path.js";
import { writeErrorMessageOnDocument } from "/src/engine/utils.js";
import { ResourceNotFoundError } from "/src/engine/utils/error.js";

/**
 * 추상 팩토리 패턴을 사용하여 원하는 리소스를 로드하는
 * ResourceLoader 클래스를 생성해 반환한다.
 */
class ResourceLoaderFactory {
  constructor() {}

  /**
   *
   * @param {string} path - 리소스의 경로
   * @param {Audio|Image} Element - 리소스를 생성할 객체의 타입
   * @param {function} callback - 리소스가 생성된 이후에 실행할 콜백함수
   * @returns
   */
  static create(path, constructor, callback) {
    if (constructor.name === "Audio") {
      return new AudioResourceLoader(path, constructor.name, callback);
    } else if (constructor.name === "Image") {
      return new ImageResourceLoader(path, constructor.name, callback);
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
   * @param {function} callback - 리소스가 생성된 이후에 실행할 콜백함수
   */
  constructor(path, constructorName, callback) {
    this.callback = callback;
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

  addErrorEventListener() {
    this.resource.addEventListener("error", () => {
      writeErrorMessageOnDocument(new ResourceNotFoundError(this.path));
    });
  }
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
   * @param {function} callback - 리소스가 생성된 이후에 실행할 콜백함수
   */
  constructor(path, constructorName, callback) {
    super(path, constructorName, callback);
  }

  /**
   * AudioElement를 생성해 반환한다.
   *
   * @returns {HTMLAudioElement}
   */
  load() {
    this.resource = new Audio(this.path);
    ResourceManager.addResourceCount(1);

    this.resource.addEventListener("loadeddata", () => {
      ResourceManager.onResourceLoad(1);
      this.callback();
    });

    this.addErrorEventListener();

    return this.resource;
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
   * @param {function} callback - 리소스가 생성된 이후에 실행할 콜백함수
   */
  constructor(path, constructorName, callback) {
    super(path, constructorName, callback);
  }

  /**
   * ImageElement를 생성해 반환한다.
   * @returns {HTMLImageElement}
   */
  load() {
    this.resource = new Image();
    this.resource.src = this.path;
    ResourceManager.addResourceCount(1);

    this.resource.addEventListener("load", () => {
      ResourceManager.onResourceLoad(1);
      this.callback();
    });

    this.addErrorEventListener();

    return this.resource;
  }
}

export default ResourceLoaderFactory;

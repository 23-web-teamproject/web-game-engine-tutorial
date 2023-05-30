import { typeCheck } from "/src/engine/utils.js";

/**
 * 페이지의 title, favicon을 관리한다.
 */
class HTMLManager {
  /**
   * 페이지의 기본 아이콘의 경로
   *
   * @property {string}
   * @static
   */
  static defaultFaviconPath = "/favicon.ico";
  /**
   * 페이지의 기본 제목
   *
   * @property {string}
   * @static
   */
  static defaultTitle = "Web Game Engine";

  /**
   * 페이지의 제목을 변경한다.
   *
   * @param {string} title - 변경할 제목
   */
  static setTitle(title) {
    document.title = typeCheck(title, "string", HTMLManager.defaultTitle);
  }

  /**
   * 페이지의 아이콘을 변경한다.
   *
   * @param {string} path - 변경할 favicon.ico의 경로
   */
  static setFavicon(path) {
    const link = document.querySelector("link[rel~='icon']");
    const image = new Image();
    path = typeCheck(path, "string", HTMLManager.defaultFaviconPath);
    image.onload = () => {
      link.href = path;
    };
    image.onerror = () => {
      link.href = HTMLManager.defaultFaviconPath;
    };
    image.src = path;
  }
}

export default HTMLManager;

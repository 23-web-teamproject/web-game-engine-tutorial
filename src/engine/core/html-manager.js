import { typeCheck } from "/src/engine/utils.js";

/**
 * 페이지의 title, favicon을 관리한다.
 */
export default class HTMLManager {
  static defaultFaviconPath = "/favicon.ico";
  static defaultTitle = "Web Game Engine";

  static setTitle(title) {
    document.title = typeCheck(title, "string", HTMLManager.defaultTitle);
  }

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

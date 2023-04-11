/*
 * GameObject가 브라우저 상에 나타나려면 html element를 가져야 한다.
 * 여기서는 실제로 html element를 생성하고 현재 씬에 연결지어주는 책임을 담당한다.
 */
import SceneManager from "/src/engine/core/scene-manager.js";

export default class HTMLFactory{
  constructor(){}

  /*
   * div태그를 만든다.
   */
  static create(){
    return HTMLFactory.createElement("div");
  }

  /*
   * img태그를 만든다.
   */
  static createImg(src){
    const element = HTMLFactory.createElement("img");
    element.src = src;
    return element;
  }

  /*
   * div 혹은 img태그를 생성할 때 현재 씬에 연결지어야 한다.
   * 여기서는 요청받은 태그를 나타내는 html element를 생성한 후
   * 현재 씬의 하위에 추가한 다음 html element를 반환한다.
   */
  static createElement(tag){
    const element = document.createElement(tag);
    SceneManager.getCurrentRenderTarget().appendChild(element);
    return element;
  }
}
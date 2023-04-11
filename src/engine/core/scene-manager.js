/* 
 * 씬 객체를 다루는 책임을 맡는다.
 * 엔진 내에서 씬을 교체한다거나 현재 씬의 html element를 반환해주는 일을 한다.
 * 
 * 씬 객체란, 게임 캐릭터나 이펙트, 애니메이션 등 게임 내에서 등장하는 
 * 모든 오브젝트들의 최상위 오브젝트를 말한다. 
 * 씬 객체는 모든 게임 오브젝트를 통제하여 게임의 로직을 설계하고 관리하게 된다.
 */
export default class SceneManager {
  static engine = undefined;
  static renderTargetName = "render-target"

  constructor() {}

  static RegisterEngine(engine) {
    /*
     * 엔진을 static으로 기억하여, 씬 변경 요청이 들어올 떄마다
     * 엔진에 접근하여 씬을 변경하게 된다.
     */
    SceneManager.engine = engine;
  }

  /*
   * 엔진에 직접 접근하여 currentScene에 새로운 씬을 생성해 저장한다.
   * 엔진에서는 매 프레임마다 currentScene의 update와 render를 실행하므로,
   * 씬이 변경된 효과가 나타난다.
   */
  static LoadScene(targetScene) {
    SceneManager.engine.currentScene = new targetScene();
  }

  static getCurrentSceneElement() {
    try{
      const renderTarget = SceneManager.getCurrentRenderTarget();
      if(renderTarget.children.length == 0){
        // scene에 해당되는 html element가 없다면 ...
        // engine내에서 초기화에 실패했음을 의미한다.
        throw Error("Scene에 해당하는 HTMLElement가 존재하지 않습니다.");
      }
      return renderTarget.children[0];
    }
    catch(error){
      // TODO
      // 당장은 alert를 띄워 메세지를 표시하고 창을 새로고침함.
      alert(error);
      window.location.reload();
    }
  }

  /*
   * 현재 html상에서 <div id="render-target"></div>를 찾아 반환한다.
   */
  static getCurrentRenderTarget(){
    return document.getElementById(SceneManager.renderTargetName);
  }
}

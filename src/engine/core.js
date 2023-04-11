/*
  engine/core/에 있는 클래스들을 import하려면 
  사용할 모든 클래스가 명시된 js파일을 import해야한다.
  비슷한 코드가 매우 많아지므로 단순하게 
  core.js를 import해서 사용할 수 있도록 변경한다.

  나중에 사용자가 사용할 수 있는 새로운 클래스가 엔진에 추가되었다면 
  여기에도 작성해주어야 한다.
 */

import CSSManager from "/src/engine/core/css-manager.js";
import InputManager from "/src/engine/core/input-manager.js";
import SceneManager from "/src/engine/core/scene-manager.js";
import HTMLFactory from "/src/engine/core/html-factory.js";
import Vector from "/src/engine/core/vector.js";
import Matrix from "/src/engine/core/matrix.js";
import GameObject from "/src/engine/core/game-object.js";
import Sprite from "/src/engine/core/sprite.js";
import SoundFx from "/src/engine/core/soundfx.js";

export {
  CSSManager,
  InputManager,
  SceneManager,
  HTMLFactory,
  Vector,
  Matrix,
  GameObject,
  Sprite,
  SoundFx
}
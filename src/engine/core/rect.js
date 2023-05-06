/*
 * 화면에 사각형을 보이려면 Rect를 사용하면 된다.
 */
import Color from "/src/engine/data-structure/color.js";
import Vector from "/src/engine/data-structure/vector.js";

import GameObject from "/src/engine/core/game-object.js";

import { typeCheck, typeCheckAndClamp } from "/src/engine/utils.js";

export default class Rect extends GameObject {
  constructor(options = {}) {
    super(options);
    /*
     * 사각형의 가로, 세로를 의미한다.
     * 기본값은 50이다.
     */
    this.transform.setSize(
      new Vector(
        typeCheck(options.width, "number", 50),
        typeCheck(options.height, "number", 50)
      )
    );
    /*
     * 윤곽선을 그릴 것인지를 의미한다.
     * 윤곽선을 그리기 위해서는 옵션에서 strokeColor나 strokeWidth를
     * 설정하면 화면에 나타나게 된다.
     */
    this.isStroke =
      options.hasOwnProperty("strokeColor") ||
      options.hasOwnProperty("strokeWidth");

    if (this.isStroke) {
      /*
       * 윤곽선의 색상을 의미한다.
       * 만약 옵션에서 윤곽선에 대한 정보가 있다면 isStroke는 true로 설정되고
       * 윤곽선의 색상이 설정된다.
       */
      this.strokeColor = typeCheck(
        options.strokeColor,
        Color,
        new Color(
          Math.random() * 255,
          Math.random() * 255,
          Math.random() * 255,
          1
        )
      );
    }
    /*
     * 윤곽선의 두께를 의미한다.
     * 1~15 사이의 값을 설정할 수 있다.
     * 기본값으로는 1이다.
     */
    this.setStrokeWidth(options.strokeWidth);
  }

  draw() {
    this.context2d.fillStyle = `rgb(
      ${this.color.r},
      ${this.color.g},
      ${this.color.b}
      )`;
    this.context2d.fillRect(
      -this.getSize().x / 2,
      -this.getSize().y / 2,
      this.getSize().x,
      this.getSize().y
    );

    // 윤곽선을 그리도록 설정했다면 윤곽선을 렌더링한다.
    if (this.isStroke) {
      this.context2d.lineWidth = this.strokeWidth;
      this.context2d.strokeStyle = `rgb(
        ${this.strokeColor.r},
        ${this.strokeColor.g},
        ${this.strokeColor.b}
        )`;
      this.context2d.strokeRect(
        this.strokeWidth / 2 - this.getSize().x / 2,
        this.strokeWidth / 2 - this.getSize().y / 2,
        this.getSize().x - this.strokeWidth,
        this.getSize().y - this.strokeWidth
      );
    }
  }

  setStrokeWidth(width) {
    this.strokeWidth = typeCheckAndClamp(width, "number", 1, 1, 15);
  }
}

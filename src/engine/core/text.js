import GameObject from "/src/engine/core/game-object.js";

import { typeCheck } from "/src/engine/utils.js";

/**
 * 화면에 문자열을 그리는 객체다.
 *
 * @extends {GameObject}
 */
class Text extends GameObject {
  /**
   * @constructor
   * @param {object} options
   * @param {string} [options.name]
   * @param {string} [options.text]
   * @param {number} [options.fontSize]
   * @param {string} [options.font]
   * @param {number} [options.lineHeight]
   * @param {boolean} [options.isActive]
   * @param {boolean} [options.isVisible]
   * @param {Layer} [options.layer]
   * @param {Color} [options.color=Random Color]
   * @param {boolean} [options.isPhysicsEnable=false]
   * @param {object} [options.transform]
   * @param {Vector} [options.transform.position=new Vector(0, 0)]
   * @param {Vector} [options.transform.scale=new Vector(1, 1)]
   * @param {number} [options.transform.rotation=0]
   */
  constructor(options) {
    super(options);
    /**
     * 화면에 보여질 문자열을 말한다.
     * 줄바꿈을 하고 싶다면 문자열에 '\n'을 넣으면 된다.
     * 이렇게 하면 '\n'을 기준으로 문자열을 나눠서
     * 한 줄씩 여러번 출력하게 된다.
     * 기본값은 팬그램 문자열이다.
     *
     * @type {string}
     */
    this.text = typeCheck(
      options.text,
      "string",
      `다람쥐 헌쳇바퀴에 타고파\n
The Quick Brown Fox Jumps Over The Lazy Dog`
    );
    this.parseText();
    /**
     * 글자 크기를 말한다.
     * 기본값은 12다.
     *
     * @type {number}
     */
    this.fontSize = typeCheck(options.fontSize, "number", 12);
    /**
     * 폰트를 말한다.
     * 만약 외부 폰트를 사용하려고 한다면
     * style.css에서 @import(url)로 불러와야 사용가능하다.
     * 기본값은 맑은 고딕(malgeun gothic)이다.
     *
     * @type {string}
     */
    this.font = typeCheck(options.font, "string", "malgeun gothic");
    /**
     * 줄 간격을 말한다.
     * 기본값은 fontSize의 1.25배다.
     *
     * @type {number}
     */
    this.lineHeight = typeCheck(
      options.lineHeight,
      "number",
      this.fontSize * 1.25
    );
  }

  draw() {
    this.context2d.font = `${this.fontSize}px ${this.font}`;
    this.context2d.fillStyle = `rgb(
      ${this.color.r}, 
      ${this.color.g}, 
      ${this.color.b}
      )`;
    for (let i = 0; i < this.textList.length; i++) {
      this.context2d.fillText(this.textList[i], 0, i * this.lineHeight);
    }
  }

  /**
   * 문자열을 지정한다.
   * 인자로 전달된 문자열을 파싱해 '\n'이 포함되어 있다면
   * '\n'을 기준으로 문자열을 쪼갠다.
   *
   * @param {string} text - 화면에 그릴 문자열
   */
  setText(text) {
    if (typeof text === "string") {
      this.text = text;
      this.parseText();
    }
  }

  /**
   * '\n'을 기준으로 문자열을 나눈다.
   */
  parseText() {
    const parsedText = this.text.split("\n");
    this.textList = new Array();
    for (let i = 0; i < parsedText.length; i++) {
      this.textList.push(parsedText[i]);
    }
  }

  /**
   * 글자 크기를 정한다.
   *
   * @param {number} fontSize
   */
  setFontSize(fontSize) {
    if (typeof fontSize === "number") {
      this.fontSize = fontSize;
    }
  }

  /**
   * 폰트를 정한다.
   *
   * @param {string} font
   */
  setFont(font) {
    if (typeof font === "string") {
      this.font = font;
    }
  }

  /**
   * 줄 간격을 정한다.
   *
   * @param {number} fontSize
   */
  setLineHeight(lineHeight) {
    if (typeof lineHeight === "number") {
      this.lineHeight = lineHeight;
    }
  }
}

export default Text;

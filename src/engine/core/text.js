import GameObject from "/src/engine/core/game-object.js";
import { typeCheck } from "/src/engine/utils.js";

export default class Text extends GameObject {
  constructor(options) {
    super(options);

    /*
     * 화면에 보여질 문자열을 말한다.
     * 줄바꿈을 하고 싶다면 문자열에 '\n'을 넣으면 된다.
     * 이렇게 하면 '\n'을 기준으로 문자열을 나눠서
     * 한 줄씩 여러번 출력하게 된다.
     */
    this.text = typeCheck(
      options.text,
      "string",
      `다람쥐 헌쳇바퀴에 타고파\n
The Quick Brown Fox Jumps Over The Lazy Dog`
    );
    this.parseText();
    /*
     * 글자 크기를 말한다.
     * 기본값은 12다.
     */
    this.fontSize = typeCheck(options.fontSize, "number", 12);
    /*
     * 폰트를 말한다.
     * 만약 외부 폰트를 사용하려고 한다면
     * style.css에서 @import(url)로 불러와야 사용가능하다.
     * 기본값은 맑은 고딕(malgeun gothic)이다.
     */
    this.font = typeCheck(options.font, "string", "malgeun gothic");
    /*
     * 줄 간격을 말한다.
     * 기본값으로는 fontSize의 1.25배다.
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

  /*
   * 문자열을 지정한다.
   * 인자로 전달된 문자열을 파싱해 '\n'이 포함되어 있다면
   * '\n'을 기준으로 문자열을 쪼갠다.
   */
  setText(text) {
    if (typeof text === "string") {
      this.text = text;
      this.parseText();
    }
  }

  /*
   * '\n'을 기준으로 문자열을 나눈다.
   */
  parseText() {
    const parsedText = this.text.split("\n");
    this.textList = new Array();
    for (let i = 0; i < parsedText.length; i++) {
      this.textList.push(parsedText[i]);
    }
  }

  /*
   * 글자 크기를 정한다.
   */
  setFontSize(fontSize) {
    if (typeof fontSize === "number") {
      this.fontSize = fontSize;
    }
  }

  /*
   * 폰트를 정한다.
   */
  setFont(font) {
    if (typeof font === "string") {
      this.font = font;
    }
  }

  /*
   * 줄 간격을 정한다.
   */
  setLineHeight(lineHeight) {
    if (typeof lineHeight === "number") {
      this.lineHeight = lineHeight;
    }
  }
}

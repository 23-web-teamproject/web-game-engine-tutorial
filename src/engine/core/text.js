import GameObject from "/src/engine/core/game-object.js";

export default class Text extends GameObject {
  constructor(options) {
    super(options);

    if (typeof options.text === "string") {
      this.text = options.text;
    } else {
      this.text = `다람쥐 헌쳇바퀴에 타고파\n
      The Quick Brown Fox Jumps Over The Lazy Dog
      `;
    }

    if (typeof options.fontSize === "number") {
      this.fontSize = options.fontSize;
    } else {
      this.fontSize = 12;
    }

    if (typeof options.font === "string") {
      this.font = options.font;
    } else {
      this.font = "malgeun gothic";
    }
  }

  draw() {
    this.context2d.font = `${this.fontSize}px ${this.font}`;
    this.context2d.fillStyle = `rgb(
      ${this.color.r}, 
      ${this.color.g}, 
      ${this.color.b}
      )`;
    this.context2d.fillText(this.text, 0, 0);
  }

  setText(text) {
    if(typeof text === "string"){
      this.text = text;
    }
  }

  setFontSize(fontSize) {
    if(typeof fontSize === "number") {
      this.fontSize = fontSize;
    }
  }

  setFont(font) {
    if(typeof font === "string") {
      this.font = font;
    }
  }
}

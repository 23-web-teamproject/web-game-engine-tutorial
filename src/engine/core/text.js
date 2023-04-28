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
      this.parseText();
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

    if (typeof options.lineHeight === "number") {
      this.lineHeight = options.lineHeight;
    } else {
      this.setLineHeight(this.fontSize * 1.25);
    }
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

  setText(text) {
    if (typeof text === "string") {
      this.text = text;
      this.parseText();
    }
  }

  parseText() {
    const parsedText = this.text.split("\n");
    this.textList = new Array();
    for (let i = 0; i < parsedText.length; i++) {
      this.textList.push(parsedText[i]);
    }
  }

  setFontSize(fontSize) {
    if (typeof fontSize === "number") {
      this.fontSize = fontSize;
    }
  }

  setFont(font) {
    if (typeof font === "string") {
      this.font = font;
    }
  }

  setLineHeight(lineHeight) {
    if (typeof lineHeight === "number") {
      this.lineHeight = lineHeight;
    }
  }
}

/*
 * html element의 style 즉, css를 통제하는 객체다.
 * 이 객체가 생성될 때 하나의 element에 연결되어 그 element의 style를 통제한다.
 */
export default class CSSManager {
  constructor(element){
    this.element = element;

    this.element.style.display = "inline-block";
    this.element.style.position = "absolute";
  }

  changeTransformOrigin(origin){
    this.element.style.transformOrigin = origin;
  }

  /*
   * position, scale, rotation을 
   * matrix에 적용하기 위해 연산 과정을 거친 후
   * transform: matrix(...) 처럼 사용가능하도록
   * 문자열로 변환하여 적용한다.
   * 
   * 아래 url에 matrix함수가 어떻게 동작하는지 나와있다.
   * https://angrytools.com/css-generator/transform/
   */
  updateMatrix(matrix){
    const radian = matrix.rotation*(Math.PI / 180); // degree to radian
    const values = [
      matrix.scale.x * Math.cos(radian),
      matrix.scale.x * -Math.sin(radian),
      matrix.scale.y * Math.sin(radian),
      matrix.scale.y * Math.cos(radian),
      matrix.position.x,
      matrix.position.y,
    ];

    this.element.style.transform = `matrix(${values[0]}, ${values[1]}, ${values[2]}, ${values[3]}, ${values[4]}, ${values[5]})`;
  }

  setBackgroundImage(src, width, height) {
    this.element.style.backgroundImage = `url(${src})`;
    this.element.style.width = width;
    this.element.style.height = height;
  }
}

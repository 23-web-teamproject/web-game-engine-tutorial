/*
 * 사운드를 제어하는 역할을 담당한다.
 */
export default class SoundEffect{
  constructor (src){
    this.source = new Audio(src);
  }

  play(){
    this.source.play();
  }

  pause(){
    this.source.pause();
  }

  stop(){
    this.source.pause();
    this.source.currentTime = 0;
  }

  setVolumn(value){
    this.source.volume = value;
  }
}

/*
 * 상대 경로로 되어있는 문자열을 절대 경로로 변환한다.
 * 상대 경로
 * - folderA/folderB/index.js
 * - ./folderB/index.js
 * 절대 경로
 * - /folderC/index.js
 */
export default class Path {
  static assetFolderPath = "";
  constructor() {}

  /* 
   * 인자로 전달된 경로를 에셋 디렉토리로 설정한다.
   * 씬 생성자에서 미리 설정한다면 상대경로로 에셋을 불러올 수 있다.
   * js는 로컬 파일에 직접 접근할 수 있는 방법이 매우 제한적이기 때문에
   * 부득이하게 생성자에서 미리 에셋 폴더를 설정해주어야 한다.
   * 아래 코드를 씬 생성자에서 실행하도록 설정하면 적용된다.
   * 
   * Path.setAssetDirectory(import.meta.url);
   */
  static setAssetFolderPath(path) {
    const folders = path.split("/");
    folders.splice(folders.length - 1, 1);
    Path.assetFolderPath = folders.reduce((newPath, folderName) => {
      newPath += `${folderName}/`;
      return newPath;
    }, new String());
  }

  /* 
   * 인자로 전달받은 경로를 에셋 폴더
   */
  static convertAbsoluteAssetPath(path) {
    if (Path.isAbsolutePath(path)) {
      return path;
    }

    return Path.assetFolderPath + path;
  }

  /*
   * 만약 경로가 '/'으로 시작한다면 절대경로임을 말한다.
   */
  static isAbsolutePath(path) {
    return path[0] === "/";
  }
}

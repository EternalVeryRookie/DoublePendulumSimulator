export default class ThreeLib
{
  constructor(mainPanelName, initCamPos)
  {
    this.initThree(mainPanelName, initCamPos);
  }

  //return width,height
  initRenderer(mainPanelName)
  {
    const width = document.getElementById(mainPanelName).clientWidth;
    const height = document.getElementById(mainPanelName).clientHeight;
    // レンダラーを作成
    this.renderer = new THREE.WebGLRenderer({
      canvas: document.querySelector("#" + mainPanelName)
    });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(width, height);
    this.renderer.setClearColor(0xFFFFFF);
    let array = [width, height];
    return array
  }

  initThree(mainPanelName, initCamPos)
  {
    const renderer_WH = this.initRenderer(mainPanelName);
    const width = renderer_WH[0];
    const height = renderer_WH[1];

    this.camera = new THREE.PerspectiveCamera(45, width/height);
    this.camera.position.set(initCamPos[0], initCamPos[1], initCamPos[2]);
    this.renderer.clear();
  }

  camRot(mouseMoveDir, angle)
  {
    let newPos = this.camera.position.clone();
    let deltaQuat = new THREE.Quaternion();
    let deltaQuatX = new THREE.Quaternion();
    let deltaQuatZ = new THREE.Quaternion();
    let viewDir = this.camera.getWorldDirection(new THREE.Vector3(0,0,0)).clone().sub(this.camera.position);

    let vieDir = this.camera.up.clone().cross(this.camera.getWorldDirection(new THREE.Vector3(0,0,0))).normalize();

    deltaQuatX.setFromAxisAngle(this.camera.up , -mouseMoveDir.x * Math.PI / 180);
    deltaQuatZ.setFromAxisAngle(vieDir , mouseMoveDir.y * Math.PI / 180);
    deltaQuat.multiply(deltaQuatX).multiply(deltaQuatZ);
    newPos.applyQuaternion(deltaQuat);
    this.camera.position.set(newPos.x,newPos.y,newPos.z);

    let newUp = this.camera.up.clone();
    deltaQuat.setFromAxisAngle(vieDir , mouseMoveDir.y * Math.PI / 180);
    newUp.applyQuaternion(deltaQuat);
    this.camera.up.set(newUp.x, newUp.y, newUp.z);
    this.camera.lookAt(new THREE.Vector3(0,0,0));
  }

  camTransViewDir(s)
  {
    const lookAtVector = new THREE.Vector3(0, 0, -1);
    lookAtVector.applyQuaternion(this.camera.quaternion);
    const translateVector = lookAtVector.multiplyScalar(s);
    const pos = this.camera.position;
    this.camera.position.set(pos.x + translateVector.x, pos.y + translateVector.y, pos.z + translateVector.z);
  }
}

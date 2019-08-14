import ThreeLib from "./threeLib.js";


//a b c d e f
//g b c d e f
//g h c d e f

//0 1, 1 2, 2 3, 3 4, 4 5, 5 5 最大までデータがある
//0 0, 1 2, 2 3, 3 4, 4 5, 5 0
//0 1, 1 1, 2 3, 3 4, 4 5, 5 0

//点群をもらっってそれらをつないだ折れ線をレンダリングするクラス
//データを追加して上限を超えた場合、isRemoveOldDataがtrueなら古いデータを削除して新しいデータを挿入する
//falseなら追加しない
//必要があるならカメラの回転機能を追加する
export default class Curve3DGraph
{
  constructor(renderTargetName, maxDataNum=10000, datasXYZ=[], isRemoveOldData=true)
  {
    this.three = new ThreeLib(renderTargetName, [0,0,15]);
    this.scene = new THREE.Scene();

    this.maxDataNum = maxDataNum;
    this.isRemoveOldData = isRemoveOldData;
    this.dataNum = (datasXYZ.length < maxDataNum) ? datasXYZ.length : maxDataNum;

    let positions = new Float32Array(3 * maxDataNum);
    let indices = new Uint16Array(2 * maxDataNum);
    let lineGeometry = new THREE.BufferGeometry();
    lineGeometry.addAttribute("position", new THREE.BufferAttribute(positions, 3));
    lineGeometry.setIndex(new THREE.BufferAttribute(indices, 1));
    this.curve = new THREE.Line(lineGeometry,  new THREE.LineBasicMaterial({ color: 0x990000, linewidth : 5}));
    this.nextInsertIndex = 0;

    for (let i = 0; i < datasXYZ.length; ++i)
    {
      for (let dim = 0; dim < 3; ++dim)
        positions[3*i + dim] = datasXYZ[dim];

      indices[2*i] = i;
      indices[2*i + 1] = i + 1;
      this.nextInsertIndex = (i + 1)%this.maxDataNum;
    }
    indices[2*this.maxDataNum-1] = indices[2*this.maxDataNum-2] = this.maxDataNum-1;

    this.scene.add(this.curve);
    this.__setEvtListener(renderTargetName);
  }

  reset()
  {
    this.dataNum = 0;
    this.nextInsertIndex = 1;
    this.curve.geometry.setDrawRange(0, 0);
  }

  __setEvtListener(renderTargetName)
  {
    const self = this;
    const camTransViewDir = function(evt)
      {
        let scale = 2.0;
        if (evt.wheelDelta < 0) scale *= -1;
        self.three.camTransViewDir(scale);
        self.three.renderer.clear();
        self.three.renderer.render(self.scene, self.three.camera);
        if (evt.preventDefault) evt.preventDefault();
      }

    document.getElementById(renderTargetName).addEventListener('mousewheel', camTransViewDir);
  }

  addData(dataXYZ)
  {
    let line = this.curve.geometry.attributes.position;
    let indices = this.curve.geometry.index;

    if (Array.isArray(dataXYZ[0]))
    {
      this.addDatas(dataXYZ);
      return;
    }

    if (this.dataNum == this.maxDataNum)
    {
      if (this.isRemoveOldData)
      {
        line.array[3*this.nextInsertIndex + 0] = dataXYZ[0];
        line.array[3*this.nextInsertIndex + 1] = dataXYZ[1];
        line.array[3*this.nextInsertIndex + 2] = dataXYZ[2];

        const updateRefIndex = (this.nextInsertIndex==0) ? this.maxDataNum-1 : this.nextInsertIndex-1;
        indices.array[2*updateRefIndex + 1] = (indices.array[(2*updateRefIndex+1)%(2*this.maxDataNum)]);
        indices.array[2*this.nextInsertIndex + 1] = indices.array[2*this.nextInsertIndex];

      }else
      {
        console.log("データ数が上限に達した");
        return ;
      }
    }else
    {
      for (let i = 0; i < 3; ++i)
        line.array[3*this.dataNum + i] = dataXYZ[i];
      indices.array[this.dataNum] = this.dataNum;
      indices.array[this.dataNum + 1] = this.dataNum + 1;
      this.curve.geometry.setDrawRange(0, this.dataNum++);
    }
    this.nextInsertIndex = (this.nextInsertIndex + 1) % this.maxDataNum;
    line.needsUpdate = true;
    indices.needsUpdate = true;
  }

  addDatas(datasXYZ)
  {
    if (!Array.isArray(datasXYZ[0]))
    {
      this.addData(datasXYZ);
      return;
    }

    for (let i = 0; i < datasXYZ.length; ++i)
      this.addData(datasXYZ[i]);
  }

  render()
  {
    this.three.renderer.clear();
    this.three.renderer.render(this.scene, this.three.camera);
  }
}

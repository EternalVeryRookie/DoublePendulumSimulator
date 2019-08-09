import ThreeLib from "./threeLib.js";
import {Plumb, Yarn, DoublePendulum} from "./ObjectDef.js";
import {Eq1, Eq2, Eq3, Eq4} from "./DoublePendEq.js";
import {RungeKutta} from "./DiffEqSolver.js";
import Curve3DGraph from "./Curve3DGraph.js";

let doublePendSimulator;

class DoublePendSimu
{
  constructor
  ( mainPanelName
  , topPlumbMass
  , underPlumbMass
  , topYarnLength
  , underYarnLength
  , initTheta1
  , initTheta2
  , c1
  , c2
  , deltaT
  )
  {
    this.mainCanvasName = mainPanelName;
    this.__topPlumbMass = topPlumbMass;
    this.__underPlumbMass = underPlumbMass;
    this.__topYarnLength = topYarnLength;
    this.__underYarnLength = underYarnLength;
    this.__theta1 = initTheta1;
    this.__theta2 = initTheta2;
    this.__topJointResistCoeff = c1;
    this.__underJointResistCoeff = c2;
    this.scene = new THREE.Scene();
    this.setEvtListener();
    this.initScene();
    this.deltaT = deltaT;
    this.angleV1 = 0;
    this.angleV2 = 0;
    this.time = 0;
    this.__isTimeDev = false;

    this.initGraph();
  }

  initScene()
  {
    this.three = new ThreeLib(this.mainCanvasName, [0, 0, 20]);
    this.three.renderer.setClearColor(0x000010);
    this.doublePendulum1 = new DoublePendulum( this.__topYarnLength
                                             , this.__underYarnLength
                                             , this.__theta1, this.__theta2
                                             , new THREE.Vector3(0,0,0)
                                             );
    this.scene.add(this.doublePendulum1.topYarn.line);
    this.scene.add(this.doublePendulum1.underYarn.line);
    this.scene.add(this.doublePendulum1.topPlumb.mesh);
    this.scene.add(this.doublePendulum1.underPlumb.mesh);

    this.three.renderer.clear();
    this.three.renderer.render(this.scene, this.three.camera);
  }

  setTopPlumbMass(m)
  {
    if (m <= 0) return ;
    this.__topPlumbMass = m;
  }

  setTopYarnLength(l)
  {
    if (l <= 0) return ;
    this.__topYarnLength = l;
    this.doublePendulum1.posSet(l, this.__underYarnLength, this.__theta1, this.__theta2);
    this.three.renderer.clear();
    this.three.renderer.render(this.scene, this.three.camera);
  }

  setUnderPlumbMass(m)
  {
    if (m <= 0) return ;
    this.__underPlumbMass = m;
  }

  setUnderYarnLength(l)
  {
    if (l <= 0) return ;
    this.__underYarnLength = l;
    this.doublePendulum1.posSet(this.__topYarnLength, l, this.__theta1, this.__theta2);
    this.three.renderer.clear();
    this.three.renderer.render(this.scene, this.three.camera);
  }

  setTheta1(theta)
  {
    this.__theta1 = theta;
    this.doublePendulum1.posSet(this.__topYarnLength, this.__underYarnLength, this.__theta1, this.__theta2);
    this.three.renderer.clear();
    this.three.renderer.render(this.scene, this.three.camera);
  }

  setTheta2(theta)
  {
    this.__theta2 = theta;
    this.doublePendulum1.posSet(this.__topYarnLength, this.__underYarnLength, this.__theta1, this.__theta2);
    this.three.renderer.clear();
    this.three.renderer.render(this.scene, this.three.camera);
  }

  getTopPlumbMomentum()
  {
    const m1 = this.__topPlumbMass;
    const m2 = this.__underPlumbMass;
    const M = m1 + m2;
    const l1 = this.__topYarnLength;
    const l2 = this.__underYarnLength;
    const deltatheta = this.__theta2 - this.__theta1;

    return M*(l1**2)*this.angleV1 + m2*l1*l2*this.angleV2*Math.cos(deltatheta);
  }

  getUnderPlumbMomentum()
  {
    const m2 = this.__underPlumbMass;
    const l1 = this.__topYarnLength;
    const l2 = this.__underYarnLength;
    const deltatheta = this.__theta2 - this.__theta1;

    return m2*(l2**2)*this.angleV2 + m2*l1*l2*this.angleV1*Math.cos(deltatheta);
  }

  __createTopPlumbPhaseSpaceGraph()
  {
    const m1Label = document.createElement("h3");
    m1Label.innerHTML = "m1 相空間";
    document.getElementById('chart_area').appendChild(m1Label);
    const ctx = document.createElement('canvas');
    ctx.id = "m1_phase_space";
    ctx.className = "phase_area_graph";
    document.getElementById('chart_area').appendChild(ctx);

    this.m1PhaseSpaceGraph = new Curve3DGraph(ctx.id, 100);
    this.m1PhaseSpaceGraph.addData([this.__theta1, this.getTopPlumbMomentum(), 0]);
    this.m1PhaseSpaceGraph.render();
  }

  __createUnderPlumbPhaseSpaceGraph()
  {
    const m2Label = document.createElement("h3");
    m2Label.innerHTML = "m2 相空間";
    document.getElementById('chart_area').appendChild(m2Label);
    const ctx = document.createElement('canvas');
    ctx.id = "m2_phase_space";
    ctx.className = "phase_area_graph";
    document.getElementById('chart_area').appendChild(ctx);

    this.m2PhaseSpaceGraph = new Curve3DGraph(ctx.id);
    this.m2PhaseSpaceGraph.addData([this.__theta2, this.getUnderPlumbMomentum(), 0]);
    this.m2PhaseSpaceGraph.render();
  }


  initGraph()
  {
    this.__createTopPlumbPhaseSpaceGraph();
    this.__createUnderPlumbPhaseSpaceGraph();
  }

  setEvtListener()
  {
    const startBtn = document.getElementById("start_button");
    startBtn.onclick = this.simulationStart();
    const stopBtn = document.getElementById("stop_button");
    stopBtn.onclick = this.simulationStop();

    const canvas = document.getElementById(this.mainCanvasName);
    canvas.addEventListener("mousedown", this.mouseDownOnCanvas());
    canvas.addEventListener("mouseup", this.mouseUpOnCanvas());
    canvas.addEventListener("mousemove", this.mouseMoveOnCanvas());
    canvas.addEventListener('mousewheel', this.mouseWheelOnCanvas());
  }

  simulationStart()
  {
    const self = this;
    return function(){
      if (self.__isTimeDev) return ;
      self.__isTimeDev = true;
      console.log("simulation start");
      self.TimeDevelopment();
    }
  }

  simulationStop()
  {
    const self = this;
    return function(){
      if (self.__isTimeDev) window.cancelAnimationFrame(self.animId);
      self.__isTimeDev = false;
    }
  }

  simulationEnd()
  {
    if (this.__isTimeDev)
      window.cancelAnimationFrame(this.animId);
    this.__isTimeDev = false;
    this.time = this.angleV1 = this.angleV2 = 0;
    this.m1PhaseSpaceGraph.reset();
    this.m2PhaseSpaceGraph.reset();

    this.m1PhaseSpaceGraph.render();
    this.m2PhaseSpaceGraph.render();
  }

  TimeDevelopment()
  {
    let self = this;
    let f = function(){return self.TimeDevelopment()}
    self.animId = window.requestAnimationFrame(f);

    for (let i = 0; i < 25; ++i)
    {
      const x_0 = this.time;
      const y_0 = [this.__theta1, this.__theta2, this.angleV1, this.angleV2];
      const func = [Eq1, Eq2, Eq3, Eq4];
      const g = 9.80665;
      const constant = [this.__topPlumbMass, this.__underPlumbMass, this.__topYarnLength, this.__underYarnLength, this.__topJointResistCoeff, this.__underJointResistCoeff];

      const solve = RungeKutta(func, this.deltaT, x_0, y_0, constant);
      this.__theta1 = solve[0];// % (2*Math.PI);
      this.__theta2 = solve[1];// % (2*Math.PI);
      this.angleV1 = solve[2];
      this.angleV2 = solve[3];
      this.time += this.deltaT;
    }


    this.updatePhaseSpaceGraph();
    this.updateModelPos();
    this.calcPhysicalQuantity();
    this.three.renderer.clear();
    this.three.renderer.render(this.scene, this.three.camera);
  }

  updatePhaseSpaceGraph()
  {
    this.m1PhaseSpaceGraph.addData([this.__theta1, this.getTopPlumbMomentum(), 0]);
    this.m1PhaseSpaceGraph.render();
    this.m2PhaseSpaceGraph.addData([this.__theta2, this.getUnderPlumbMomentum(), 0]);
    this.m2PhaseSpaceGraph.render();
  }

  updateModelPos()
  {
    this.doublePendulum1.posSet(this.__topYarnLength, this.__underYarnLength, this.__theta1, this.__theta2);
  }

  //運動エネルギー、ポテンシャルエネルギーを計算
  calcPhysicalQuantity()
  {
    const l1 = this.__topYarnLength;
    const l2 = this.__underYarnLength;
    const m1 = this.__topPlumbMass;
    const m2 = this.__underPlumbMass;
    const g = 9.80665;

    let K = (m1+m2)*l1*l1*this.angleV1*this.angleV1/2 + m2*l2*l2*this.angleV2*this.angleV2/2;
    K += m2*l1*l2*this.angleV1*this.angleV2*Math.cos(this.__theta2-this.__theta1);

    let U = -(m1+m2)*g*l1*Math.cos(this.__theta1) - m2*g*l2*Math.cos(this.__theta2);

    document.getElementById("kinetic_energy_label").innerHTML = "K : " + (K.toFixed(5));
    document.getElementById("potential_energy_label").innerHTML = "U : " + (U.toFixed(5));
    document.getElementById("all_energy_label").innerHTML = "E : " + ((K+U).toFixed(5));
  }


  //マウスイベント
  mouseDownOnCanvas()
  {
    //イベントハンドラに設定できるようにthisをクロージャでバインド
    const self = this;

    return function(e)
      {
        //0 : 左　1 : 中央　2 : 右
        if (e.button == 0)
        {
          let rect = document.getElementById(self.mainCanvasName).getBoundingClientRect();
          self.preMousePlace = new THREE.Vector2(e.clientX - rect.left,  e.clientY - rect.top);
          console.log("down");
        }
      }
  }

  mouseUpOnCanvas()
  {
    //イベントハンドラに設定できるようにthisをクロージャでバインド
    const self = this;

    return function(e)
      {
        if (e.button == 0)
          self.preMousePlace = undefined;
        console.log("up");
      }
  }

  mouseMoveOnCanvas()
  {
    //イベントハンドラに設定できるようにthisをクロージャでバインド
    const self = this;

    return function(e) //カメラの回転
    {
      if (typeof self.preMousePlace === "undefined")
        return ;

      let rect = document.getElementById(self.mainCanvasName).getBoundingClientRect();
      let moveDir = new THREE.Vector2(e.clientX - rect.left, e.clientY - rect.top);
      moveDir.sub(self.preMousePlace);
      if (moveDir.x == 0 && moveDir.y == 0)
        return;

      let camYaw = new THREE.Vector3(0, 1, 0);
      let camPitch = new THREE.Vector3(1, 0, 0);
      camYaw.multiplyScalar(moveDir.x);
      camPitch.multiplyScalar(moveDir.y);
      let rotAxis = camYaw.add(camPitch);
      rotAxis.normalize();
      self.three.camRot(moveDir, 0.1);

      self.preMousePlace.x = e.clientX - rect.left;
      self.preMousePlace.y = e.clientY - rect.top;
      self.three.renderer.clear();
      self.three.renderer.render(self.scene, self.three.camera)
    }
  }

  mouseWheelOnCanvas()
  {
    //イベントハンドラに設定できるようにthisをクロージャでバインド
    const self = this;
    return function(evt) //カメラを遠ざけたり近づけたり
    {
      let scale = 0.3;
      if (evt.wheelDelta < 0) scale *= -1;
      self.three.camTransViewDir(scale);
      self.three.renderer.clear();
      self.three.renderer.render(self.scene, self.three.camera);

      if (evt.preventDefault) evt.preventDefault();
    }
  }


  set topJointResistCoeff(c)
  {
    if (c < 0) return ;
    else this.__topJointResistCoeff = c;
  }

  set underJointResistCoeff(c)
  {
    if (c < 0) return ;
    else this.__underJointResistCoeff = c;
  }

  //getter
  get theta1(){ return this.__theta1; }
  get theta2(){ return this.__theta2; }

  get topYarnLength(){ return this.__topYarnLength; }
  get underYarnLength(){ return this.__underYarnLength; }

  get topPlumbMass(){ return this.__topPlumbMass; }
  get underPlumbMass(){ return this.__underPlumbMass; }

  get topJointResistCoeff(){ return this.__topJointResistCoeff; }
  get underJointResistCoeff(){ return this.__underJointResistCoeff; }

  get isTimeDev(){ return this.__isTimeDev; }
}



const theta1_range_id = "theta1_range";
const theta2_range_id = "theta2_range";
const top_line_length_range_id = "top_line_length_range";
const top_plumb_mass_range_id = "top_plumb_mass_range";
const under_line_length_range_id = "under_line_length_range";
const under_plumb_mass_range_id = "under_plumb_mass_range";
const top_viscous_resist_coeff_range_id = "top_viscous_resist_coeff_range";
const under_viscous_resist_coeff_range_id = "under_viscous_resist_coeff_range";

const theta1_textbox_id = "theta1_value";
const theta2_textbox_id = "theta2_value";
const top_line_length_textbox_id = "top_line_length_value";
const top_plumb_mass_textbox_id = "top_plumb_mass_value";
const under_line_length_textbox_id = "under_line_length_value";
const under_plumb_mass_textbox_id = "under_plumb_mass_value";
const top_viscous_resist_coeff_textbox_id = "top_viscous_resist_coeff_value";
const under_viscous_resist_coeff_textbox_id = "under_viscous_resist_coeff_value";

function moveDoublePendParamRangeBar(evt)
{
  document.getElementById(evt.target.valueVisId).value = evt.target.value;

  if (doublePendSimulator.isTimeDev) return ; //シミュレーション中はパラメータを変更しない
  else evt.target.setParamMethod(evt);
}

function editedDoublePendParamTextbox(evt)
{
  const value = Number(evt.target.value);
  const relateRange = document.getElementById(evt.target.relationRagneId);
  //入力が数値でない、または入力された数値がrangeの範囲内に入っていなければ現在のシミュレーターのパラメータを反映する
  if (isNaN(value) || relateRange.max < value || relateRange.min > value)
  {
    evt.target.value = evt.target.getParamMethod();
    return ;
  }else
  {
    relateRange.value = value;
    evt.target.setParamMethod(evt);
  }
}

function simReset(evt)
{
  doublePendSimulator.simulationEnd();

  doublePendSimulator.setTheta1(Number(document.getElementById(theta1_range_id).value));
  doublePendSimulator.setTheta2(Number(document.getElementById(theta2_range_id).value));
  doublePendSimulator.setTopPlumbMass(Number(document.getElementById(top_plumb_mass_range_id).value));
  doublePendSimulator.setTopYarnLength(Number(document.getElementById(top_line_length_range_id).value));
  doublePendSimulator.setUnderPlumbMass(Number(document.getElementById(under_plumb_mass_range_id).value));
  doublePendSimulator.setUnderYarnLength(Number(document.getElementById(under_line_length_range_id).value));
}


function init(evt)
{
  const theta1Range = document.getElementById(theta1_range_id);
  const theta2Range = document.getElementById(theta2_range_id);
  const topLineLengthRange = document.getElementById(top_line_length_range_id);
  const topPlumbMassRange = document.getElementById(top_plumb_mass_range_id);
  const underLineLengthRange = document.getElementById(under_line_length_range_id);
  const underPlumbMassRange = document.getElementById(under_plumb_mass_range_id);
  const topViscousResistCoeffRange = document.getElementById(top_viscous_resist_coeff_range_id);
  const underViscousResistCoeffRange = document.getElementById(under_viscous_resist_coeff_range_id);

  const theta1 = Number(theta1Range.value);
  const theta2 = Number(theta2Range.value);
  const m1 = Number(topPlumbMassRange.value);
  const l1 = Number(topLineLengthRange.value);
  const m2 = Number(underPlumbMassRange.value);
  const l2 = Number(underLineLengthRange.value);
  const c1 = Number(topViscousResistCoeffRange.value);
  const c2 = Number(underViscousResistCoeffRange.value);
  //二重振り子シミュレーターを現在のフォームのパラメーターで初期化
  doublePendSimulator = new DoublePendSimu("main_canvas", m1, m2, l1, l2, theta1, theta2, c1, c2, 0.001);

  //rangeのmin_maxを設定
  theta1Range.max = theta2Range.max = 2*Math.PI;
  theta1Range.min = theta2Range.min = 0.0;
  topLineLengthRange.max = underLineLengthRange.max = 30.0;
  topLineLengthRange.min = underLineLengthRange.min = 0.0;
  topPlumbMassRange.max = underPlumbMassRange.max = 10.0;
  topPlumbMassRange.min = underPlumbMassRange.min = topPlumbMassRange.step;
  topViscousResistCoeffRange.max = underViscousResistCoeffRange.max = 1000;
  topViscousResistCoeffRange.min = underViscousResistCoeffRange.min = 0;
  topViscousResistCoeffRange.step = underViscousResistCoeffRange.step = 0.001;

  //rangeとtextboxの関連付け
  theta1Range.valueVisId = theta1_textbox_id;
  theta2Range.valueVisId = theta2_textbox_id;
  topLineLengthRange.valueVisId = top_line_length_textbox_id;
  topPlumbMassRange.valueVisId = top_plumb_mass_textbox_id;
  underLineLengthRange.valueVisId = under_line_length_textbox_id;
  underPlumbMassRange.valueVisId = under_plumb_mass_textbox_id;
  topViscousResistCoeffRange.valueVisId = top_viscous_resist_coeff_textbox_id;
  underViscousResistCoeffRange.valueVisId = under_viscous_resist_coeff_textbox_id;

  //rangeが動いた時のパラメータ設定関数の設定
  theta1Range.setParamMethod = function(evt){ doublePendSimulator.setTheta1(Number(evt.target.value)); };
  theta2Range.setParamMethod = function(evt){ doublePendSimulator.setTheta2(Number(evt.target.value)); };
  topLineLengthRange.setParamMethod = function(evt){ doublePendSimulator.setTopYarnLength(Number(evt.target.value)); };
  topPlumbMassRange.setParamMethod = function(evt){ doublePendSimulator.setTopPlumbMass(Number(evt.target.value)); };
  underLineLengthRange.setParamMethod = function(evt){ doublePendSimulator.setUnderYarnLength(Number(evt.target.value)); };
  underPlumbMassRange.setParamMethod = function(evt){ doublePendSimulator.setUnderPlumbMass(Number(evt.target.value)); };
  topViscousResistCoeffRange.setParamMethod = function(evt){ doublePendSimulator.topJointResistCoeff = Number(evt.target.value); };
  underViscousResistCoeffRange.setParamMethod = function(evt){ doublePendSimulator.underJointResistCoeff = Number(evt.target.value); };

  //ragneのイベントリスナ設定
  theta1Range.addEventListener("input", moveDoublePendParamRangeBar);
  theta2Range.addEventListener("input", moveDoublePendParamRangeBar);
  topLineLengthRange.addEventListener("input", moveDoublePendParamRangeBar);
  topPlumbMassRange.addEventListener("input", moveDoublePendParamRangeBar);
  underLineLengthRange.addEventListener("input", moveDoublePendParamRangeBar);
  underPlumbMassRange.addEventListener("input", moveDoublePendParamRangeBar);
  topViscousResistCoeffRange.addEventListener("input", moveDoublePendParamRangeBar);
  underViscousResistCoeffRange.addEventListener("input", moveDoublePendParamRangeBar);

  //resetボタンにリセットイベント設定
  document.getElementById("reset_button").addEventListener("click", simReset);


  const theta1Textbox = document.getElementById(theta1_textbox_id);
  const theta2Textbox = document.getElementById(theta2_textbox_id);
  const topLineLengthTextbox = document.getElementById(top_line_length_textbox_id);
  const topPlumbMassTextbox = document.getElementById(top_plumb_mass_textbox_id);
  const underLineLengthTextbox = document.getElementById(under_line_length_textbox_id);
  const underPlumbMassTextbox = document.getElementById(under_plumb_mass_textbox_id);
  const topViscousResistCoeffTextbox = document.getElementById(top_viscous_resist_coeff_textbox_id);
  const underViscousResistCoeffTextbox = document.getElementById(under_viscous_resist_coeff_textbox_id);

  //rangeに関連づいているtextboxの値をrangeに合わせる
  theta1Textbox.value = theta1Range.value;
  theta2Textbox.value = theta2Range.value;
  topLineLengthTextbox.value = topLineLengthRange.value;
  topPlumbMassTextbox.value = topPlumbMassRange.value;
  underLineLengthTextbox.value = underLineLengthRange.value;
  underPlumbMassTextbox.value = underPlumbMassRange.value;
  topViscousResistCoeffTextbox.value = topViscousResistCoeffRange.value;
  underViscousResistCoeffTextbox.value = underViscousResistCoeffRange.value;

  //textboxにもrangeを対応付ける
  theta1Textbox.relationRagneId = theta1_range_id;
  theta2Textbox.relationRagneId = theta2_range_id;
  topLineLengthTextbox.relationRagneId = top_line_length_range_id;
  topPlumbMassTextbox.relationRagneId = top_plumb_mass_range_id;
  underLineLengthTextbox.relationRagneId = under_line_length_range_id;
  underPlumbMassTextbox.relationRagneId = under_plumb_mass_range_id;
  topViscousResistCoeffTextbox.relationRagneId = top_viscous_resist_coeff_range_id;
  underViscousResistCoeffTextbox.relationRagneId = under_viscous_resist_coeff_range_id;

  //パラメータ設定用の関数を設定する
  theta1Textbox.setParamMethod = function(evt){ doublePendSimulator.setTheta1(Number(evt.target.value)); };
  theta2Textbox.setParamMethod = function(evt){ doublePendSimulator.setTheta2(Number(evt.target.value)); };
  topLineLengthTextbox.setParamMethod = function(evt){ doublePendSimulator.setTopYarnLength(Number(evt.target.value)); };
  topPlumbMassTextbox.setParamMethod = function(evt){ doublePendSimulator.setTopPlumbMass(Number(evt.target.value)); };
  underLineLengthTextbox.setParamMethod = function(evt){ doublePendSimulator.setUnderYarnLength(Number(evt.target.value)); };
  underPlumbMassTextbox.setParamMethod = function(evt){ doublePendSimulator.setUnderPlumbMass(Number(evt.target.value)); };
  topViscousResistCoeffTextbox.setParamMethod = function(evt){ doublePendSimulator.topJointResistCoeff = Number(evt.target.value); };
  underViscousResistCoeffTextbox.setParamMethod = function(evt){ doublePendSimulator.underJointResistCoeff = Number(evt.target.value); };

  //編集前の状態に戻せるようにパラメータ取得用関数を設定
  theta1Textbox.getParamMethod = function(){ return doublePendSimulator.theta1; };
  theta2Textbox.getParamMethod = function(){ return doublePendSimulator.theta2; };
  topLineLengthTextbox.getParamMethod = function(){ return doublePendSimulator.topYarnLength; };
  topPlumbMassTextbox.getParamMethod = function(){ return doublePendSimulator.topPlumbMass; };
  underLineLengthTextbox.getParamMethod = function(){ return doublePendSimulator.underYarnLength; };
  underPlumbMassTextbox.getParamMethod = function(){ return doublePendSimulator.underPlumbMass; };
  topViscousResistCoeffTextbox.getParamMethod = function(){ return doublePendSimulator.topJointResistCoeff; };
  underViscousResistCoeffTextbox.getParamMethod = function(){ return doublePendSimulator.underJointResistCoeff; };

  //textboxにパラメータ設定イベントを設定
  theta1Textbox.addEventListener("blur", editedDoublePendParamTextbox);
  theta2Textbox.addEventListener("blur", editedDoublePendParamTextbox);
  topLineLengthTextbox.addEventListener("blur", editedDoublePendParamTextbox);
  topPlumbMassTextbox.addEventListener("blur", editedDoublePendParamTextbox);
  underLineLengthTextbox.addEventListener("blur", editedDoublePendParamTextbox);
  underPlumbMassTextbox.addEventListener("blur", editedDoublePendParamTextbox);
  topViscousResistCoeffTextbox.addEventListener("blur", editedDoublePendParamTextbox);
  underViscousResistCoeffTextbox.addEventListener("blur", editedDoublePendParamTextbox);
}

window.addEventListener('DOMContentLoaded', init);

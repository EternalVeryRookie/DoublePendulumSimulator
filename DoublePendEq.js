//二重振り子の運動方程式を定義
//2回微分でパラメータはθ1、θ2の2つなので4連立一回微分方程式に変形する
//param = [theta1, theta2, fai1, fai2]
//param[2] = fai1 = d(theta1)/dt  param[3] = fai2 = d(theta2)/dt　とする
//constant = [m1, m2, l1, l2]

const g = 9.80665;

//theta1 = fai1
export function Eq1(t, param, constant)
{
  return param[2];
}

//theta2 = fai2
export function Eq2(t, param, constant)
{
  return param[3];
}

//fai1(d(theta1)/dt)
export function Eq3(t, param, constant)
{
  const theta1 = param[0];
  const theta2 = param[1];
  const fai1 = param[2];
  const fai2 = param[3];
  const m1 = constant[0];
  const m2 = constant[1];
  const l1 = constant[2];
  const l2 = constant[3];
  const c1 = constant[4];
  const c2 = constant[5];
  const M = m1 + m2;
  const deltaTheta = theta2 - theta1;
  const sqL1 = l1*l1;
  const sqL2 = l2*l2;

  const Inv = 1 / (m2*sqL1*sqL2*(M - m2*(Math.cos(deltaTheta)**2)));
  const u_theta1 = -c1*fai1 + c2*(fai2 - fai1);
  const u_theta2 = -c2*(fai2 - fai1);
  const F1 = u_theta1 + m2*l1*l2*fai2*fai2*Math.sin(deltaTheta) - M*g*l1*Math.sin(theta1);
  const F2 = u_theta2 - m2*l1*l2*fai1*fai1*Math.sin(deltaTheta) - m2*g*l2*Math.sin(theta2);

  return Inv * (m2*sqL2*F1 - m2*l1*l2*Math.cos(deltaTheta)*F2);
}

export function Eq4(t, param, constant)
{
  const theta1 = param[0];
  const theta2 = param[1];
  const fai1 = param[2];
  const fai2 = param[3];
  const m1 = constant[0];
  const m2 = constant[1];
  const l1 = constant[2];
  const l2 = constant[3];
  const c1 = constant[4];
  const c2 = constant[5];
  const M = m1 + m2;
  const deltaTheta = theta2 - theta1;
  const sqL1 = l1*l1;
  const sqL2 = l2*l2;

  const Inv = 1 / (m2*sqL1*sqL2*(M - m2*(Math.cos(deltaTheta)**2)));
  const u_theta1 = -c1*fai1 + c2*(fai2 - fai1);
  const u_theta2 = -c2*(fai2 - fai1);
  const F1 = u_theta1 + m2*l1*l2*fai2*fai2*Math.sin(deltaTheta) - M*g*l1*Math.sin(theta1);
  const F2 = u_theta2 - m2*l1*l2*fai1*fai1*Math.sin(deltaTheta) - m2*g*l2*Math.sin(theta2);

  return Inv * (-m2*l1*l2*Math.cos(deltaTheta)*F1 + sqL1*M*F2);
}

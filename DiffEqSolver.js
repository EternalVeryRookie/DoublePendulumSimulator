//funcの引数の個数は階数*次元 + 1
export function RungeKutta(func, delta, x_0, y_0, constant)
{
  const n = func.length;
  let k_a = [];
  let k_b = [];
  let k_c = [];
  let k_d = [];
  for (let i = 0; i < n; ++i)
    k_a[i] = delta*func[i](x_0, y_0, constant);

  for (let i = 0; i < n; ++i)
  {
    let arg = [];
    for (let j = 0; j < n; ++j)
      arg[j] = y_0[j] + k_a[j]/2;
    k_b[i] = delta*func[i](x_0+delta/2, arg, constant);
  }
  
  for (let i = 0; i < n; ++i)
  {
    let arg = [];
    for (let j = 0; j < n; ++j)
      arg[j] = y_0[j] + k_b[j]/2;
    k_c[i] = delta*func[i](x_0+delta/2, arg, constant);
  }

  for (let i = 0; i < n; ++i)
  {
    let arg = [];
    for (let j = 0; j < n; ++j)
      arg[j] = y_0[j] + k_c[j];
    k_d[i] = delta*func[i](x_0+delta, arg, constant);
  }

  let solve = [];
  for (let i = 0; i < n; ++i)
    solve[i] = y_0[i] + (k_a[i] + 2*k_b[i] + 2*k_c[i] + k_d[i]) / 6;

  return solve;
}
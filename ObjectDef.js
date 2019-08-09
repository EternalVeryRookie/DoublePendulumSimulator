export class Plumb
{
  constructor(initPos, radius, name, color)
  {
    const geometry = new THREE.SphereGeometry( radius, 64, 64 );
    let material = new THREE.MeshBasicMaterial( {color: color} );
    this.mesh = new THREE.Mesh( geometry, material );
    this.mesh.position.set(initPos.x, initPos.y, initPos.z);
    this.mesh.name = name;
  }

  setRadius(r)
  {
    if (r <= 0) return;


    this.mesh.geometry.verticesNeedUpdate = true;
    this.mesh.geometry.elementNeedUpdate = true;    this.mesh.geometry.radius = r;
  }
}

export class Yarn
{
  constructor(startPos, endPos, name, color)
  {
    let geometry = new THREE.Geometry();
    geometry.vertices.push(startPos);
    geometry.vertices.push(endPos);
    this.line = new THREE.Line( geometry, new THREE.LineBasicMaterial( { color: color} ) );
    this.line.name = name;
  }

  setStartPos(x, y, z)
  {
    this.line.geometry.verticesNeedUpdate = true;
    this.line.geometry.elementNeedUpdate = true;
    this.line.geometry.vertices[0].set(x, y, z);
  }

  setEndPos(x, y, z)
  {
    this.line.geometry.verticesNeedUpdate = true;
    this.line.geometry.elementNeedUpdate = true;
    this.line.geometry.vertices[1].set(x, y, z);
  }

  getLength()
  {
    return Math.sqrt((this.line.geometry.vertices[0]**2) + (this.line.geometry.vertices[1]**2));
  }
}


export class DoublePendulum
{
  constructor( topLineLength, underLineLength, initTheta1, initTheta2, fixPoint)
  {
    const radius = topLineLength / 6;
    const plumb1Pos = new THREE.Vector3(  topLineLength*Math.sin(initTheta1)
                                       , -topLineLength*Math.cos(initTheta1)
                                       , 0);
    this.topYarn = new Yarn(fixPoint, plumb1Pos, "TopYarn", 0x04e110)
    this.topPlumb = new Plumb(plumb1Pos, radius, "TopPlumb", 0xff935c);



    let plumb2Pos = new THREE.Vector3(  underLineLength*Math.sin(initTheta2)
                                      , -underLineLength*Math.cos(initTheta2)
                                      , 0);
    plumb2Pos.add(plumb1Pos);
    this.underYarn = new Yarn(plumb1Pos, plumb2Pos, "UnderYarn", 0xdc5353)
    this.underPlumb = new Plumb(plumb2Pos, radius, "UnderPlumb", 0xa72461);
  }

  posSet(topLineLength, underLineLength, theta1, theta2)
  {
    const plumb1Pos = new THREE.Vector3(  topLineLength*Math.sin(theta1)
                                       , -topLineLength*Math.cos(theta1)
                                       , 0);
    this.topYarn.setEndPos(plumb1Pos.x, plumb1Pos.y, plumb1Pos.z);
    this.topPlumb.mesh.position.set(plumb1Pos.x, plumb1Pos.y, plumb1Pos.z);
    this.topPlumb.setRadius(topLineLength/6);

    let plumb2Pos = new THREE.Vector3(  underLineLength*Math.sin(theta2)
                                      , -underLineLength*Math.cos(theta2)
                                      , 0);
    plumb2Pos.add(plumb1Pos);
    this.underYarn.setStartPos(plumb1Pos.x, plumb1Pos.y, plumb1Pos.z);
    this.underYarn.setEndPos(plumb2Pos.x, plumb2Pos.y, plumb2Pos.z);
    this.underPlumb.mesh.position.set(plumb2Pos.x, plumb2Pos.y, plumb2Pos.z);
    this.underPlumb.setRadius(topLineLength/6);
  }
}

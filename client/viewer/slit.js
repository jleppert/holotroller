function Slit(viewer) {
  var config = viewer.config.slit;

  var rectShape = new THREE.Shape();
  rectShape.moveTo(0, 0);
  rectShape.lineTo(0, config.height);
  rectShape.lineTo(config.width, config.height);
  rectShape.lineTo(config.width, 0);
  rectShape.lineTo(0, 0);

  var slitPath = new THREE.Path();
  var offset = config.apeture.offset;
  slitPath.moveTo(config.apeture.width + offset, offset);
  slitPath.lineTo(config.apeture.width + offset, config.height - offset);
  slitPath.lineTo(offset, config.height - offset);
  slitPath.lineTo(offset, offset);
  slitPath.lineTo(config.apeture.width + offset, offset);

  rectShape.holes.push(slitPath);

  var geometry = new THREE.ExtrudeGeometry(rectShape, { amount: config.thickness, bevelEnabled: false });
  var material = new THREE.MeshLambertMaterial({ color: 0xffffff, transparent: true, opacity: 0.5 });

  this.slit = new THREE.Mesh(geometry, material);
  this.slit.position.set(-(config.width/2), -(config.height/2), config.zDistance);

  viewer.scene.add(this.slit);
}

module.exports = Slit;

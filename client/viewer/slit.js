function Slit(viewer) {
  var config = viewer.config.slit;

  var rectShape = new THREE.Shape();
  rectShape.moveTo(0, 0);
  rectShape.lineTo(0, config.height);
  rectShape.lineTo(config.width, config.height);
  rectShape.lineTo(config.width, 0);
  rectShape.lineTo(0, 0);

  var slitPath = new THREE.Path();
  var offsetX = config.apeture.offset.x
  var offsetY = config.apeture.offset.y;

  slitPath.moveTo(config.apeture.width + offsetX, offsetY);
  slitPath.lineTo(config.apeture.width + offsetX, config.height - offsetY);
  slitPath.lineTo(offsetX, config.height - offsetY);
  slitPath.lineTo(offsetX, offsetY);
  slitPath.lineTo(config.apeture.width + offsetX, offsetY);

  rectShape.holes.push(slitPath);

  var geometry = new THREE.ExtrudeGeometry(rectShape, { amount: config.thickness, bevelEnabled: false });
  var material = new THREE.MeshLambertMaterial({ color: 0xffffff, transparent: true, opacity: 0.5 });

  this.slit = new THREE.Mesh(geometry, material);
  this.slit.position.set(-(config.width/4), -(config.height/2), config.zDistance);

  viewer.scene.add(this.slit);
}

Slit.prototype.translate = function(offset, velocity) {
  var currentPosition = this.slit.position.x;

}

module.exports = Slit;

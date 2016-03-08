function Display(viewer) {
  var config = this.config = viewer.config.display;

  var geometry = new THREE.BoxGeometry(config.width, config.height, config.thickness * 2);
  
  var virtualSceneMap = new THREE.MeshLambertMaterial( { map: viewer.virtualScene.buffer, color: 0x00ff00, transparent: true, opacity: 0.5 });
  var sideMaterial = new THREE.MeshLambertMaterial({ color: 0x00ff00, transparent: true, opacity: 0.5 });

  this.display = new THREE.Mesh(geometry, new THREE.MeshFaceMaterial([sideMaterial, sideMaterial, sideMaterial, sideMaterial, virtualSceneMap, virtualSceneMap]));
  this.display.position.set(0, 0, 100);

  viewer.scene.add(this.display);
}

module.exports = Display;

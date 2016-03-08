function RecordingMaterial(viewer) {
  var config = this.config = viewer.config.recording; 

  this.geometry = new THREE.BoxGeometry(config.width, config.height, config.thickness);
  this.material = new THREE.MeshLambertMaterial({ color: 0xff8080, transparent: true, opacity: 0.5 });
  this.recording = new THREE.Mesh(this.geometry, this.material);

  viewer.scene.add(this.recording);
}

module.exports = RecordingMaterial;

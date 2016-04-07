function VirtualScene(viewer) {
  var config = this.config = viewer.config;

  var displayConfig = viewer.config.display;

  this.scene = new THREE.Scene();
  this.camera = new THREE.PerspectiveCamera(60, displayConfig.resolution.width / displayConfig.resolution.height, 0.1, 1000);

  if(config.buffer) {
    this.buffer = new THREE.WebGLRenderTarget(displayConfig.resolution.width, displayConfig.resolution.height, { minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter});
  }

  this.material = new THREE.MeshNormalMaterial({color:0x00ff00, wireframe: true, wireframeLinewidth: 1});

  this.objects = [];

  this.camera.position.z = 40;

  this.addObject(function() {
    var geometry = new THREE.TorusKnotGeometry(10, 3, 100, 16);
    var torus = new THREE.Mesh(geometry, this.material);

    return torus;
  });
}

VirtualScene.prototype = {
   addObject: function(cb) {
    var obj = cb.call(this);
    this.objects.push(obj);
    this.scene.add(obj);
   },
   render: function(renderer) {
    /*for(var i = 0; i < this.objects.length; i++) {
      this.objects[i].rotation.x += 0.01;
      this.objects[i].rotation.y -= 0.01;
    }*/
    renderer.render(this.scene, this.camera, this.buffer);
   }
};

module.exports = VirtualScene;

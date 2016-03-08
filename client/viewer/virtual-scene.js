function VirtualScene(viewer) {
  var config = this.config = viewer.config.virtualScene;

  var displayConfig = viewer.config.display;

  this.scene = new THREE.Scene();
  this.camera = new THREE.PerspectiveCamera(75, displayConfig.resolution.width / displayConfig.resolution.height, 0.1, 1000); 
  this.buffer = new THREE.WebGLRenderTarget(displayConfig.resolution.width, displayConfig.resolution.height, { minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter});
  
  this.material = new THREE.MeshBasicMaterial({color:0x00ff00, wireframe: true, wireframeLinewidth: 2});
  
  this.objects = [];

  this.camera.position.z = 10;
  
  this.addObject(function() {
    var geometry = new THREE.BoxGeometry(5, 5, 5);
    var box = new THREE.Mesh(geometry, this.material);
    box.position.z = -10;

    return box;
  });

  this.addObject(function() {
    var geometry = new THREE.SphereGeometry(5, 32, 32);
    var sphere = new THREE.Mesh(geometry, this.material); 
    sphere.position.z = -10;
    sphere.position.x = 10;

    return sphere;
  });

  this.addObject(function() {
    var geometry = new THREE.TorusKnotGeometry(10, 3, 100, 16);
    var torus = new THREE.Mesh(geometry, this.material);
    torus.position.x = -35;
    torus.position.z = -50;

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
    for(var i = 0; i < this.objects.length; i++) {
      this.objects[i].rotation.x += 0.01;
      this.objects[i].rotation.y += 0.01;
    }
    renderer.render(this.scene, this.camera, this.buffer);
   }
};

module.exports = VirtualScene;

var THREE = require('three'),
    PNG = require('pngjs').PNG,
    gl = require('gl')(),
    fs = require('fs'),
    cv = require('opencv');

var config = {
  width: 640,  // nm
  height: 480,  // nv

  film: {
    width: 120,  // dx
    height: 100  // dy
  },

  camera: {
    length: 200,
    distance: 100, //h
    stepSize: 1
  }
};

var scene = new THREE.Scene();

// create camera rail
var rail = new CameraRail();
scene.add(rail);

// film
var film = new Film(config.film.width, config.film.height);
scene.add(film);

// subject
var subject = new Subject();
scene.add(subject);

// camera
var camera = new THREE.PerspectiveCamera(60, config.width / config.height, 0.1, 1000);

//var cameraHelper = new THREE.CameraHelper(camera);
//scene.add(cameraHelper);

camera.position.set(0, 0, 0);
camera.lookAt(film.position);

var canvas = new Object();
var renderer = new THREE.WebGLRenderer({
  antialias: true,
  alpha: true,
  width: config.width,
  height: config.height,
  canvas: canvas,
  context: gl
});
//renderer.setSize(config.width, config.height);

var renderTarget = new THREE.WebGLRenderTarget(
  config.width, config.height, {
    minFilter: THREE.LinearFilter,
    magFilter: THREE.NearestFilter,
    format: THREE.RGBAFormat
});

function renderStep(step) {
  camera.position.x = step;
  camera.lookAt(film.position);

  renderer.clear();
  renderer.render(scene, camera, renderTarget, true);

  var gl = renderer.getContext();
  var pixels = new Uint8Array(config.width * config.height * 4);

  gl.readPixels(0, 0, config.width, config.height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
  return pixels;
}

function getProjectedBBox(obj, camera) {
  var bbox = new THREE.Box3().setFromObject(obj);
  var corners = [
    (new THREE.Vector3(bbox.min.x, bbox.max.y, bbox.min.z)).project(camera),
    (new THREE.Vector3(bbox.max.x, bbox.max.y, bbox.max.z)).project(camera),
    (new THREE.Vector3(bbox.max.x, bbox.min.y, bbox.min.z)).project(camera), // wrong
    (new THREE.Vector3(bbox.min.x, bbox.min.y, bbox.min.z)).project(camera), // wrong
    (new THREE.Vector3(obj.position.x, obj.position.y, obj.position.z)).project(camera)
  ];

  // ul, ur, lr, ll, center
  return corners.map(function(corner) {
    corner.x = ((corner.x + 1) / 2) * config.width;
    corner.y = ((-corner.y + 1) / 2) * config.height;

    return corner;
  });
}
//config.camera.length / config.camera.stepSize
for(var steps = config.camera.length / config.camera.stepSize, step = 0; step < steps; step++) {
  var image = renderStep(step);
  var png = new PNG({ width: config.width, height: config.height });

  var flipped = new Uint8Array(config.width * config.height * 4);

  for(var y  = 0; y < config.height; y++) {
    for(var x = 0; x < config.width; x++) {
      var k = y * config.width + x;
      var r = image[4*k];
      var g = image[4*k + 1];
      var b = image[4*k + 2];
      var a = image[4*k + 3];

      var m = (config.height - y + 1) * config.width + x;
      flipped[4*m] = r;
      flipped[4*m + 1] = g;
      flipped[4*m + 2] = b;
      flipped[4*m + 3] = a;

      png.data[4*m] = r;
      png.data[4*m + 1] = g;
      png.data[4*m + 2] = b;
      png.data[4*m + 3] = a;
    }
  }

  var stream = fs.createWriteStream(step + '.png');

  console.log('Rendered position', step);
  /*var mat = new cv.Matrix(config.height, config.width, cv.Constants.CV_8UC4);
  mat.put(flipped);
  var window = new cv.NamedWindow('Mat-Put', 0);
  window.show(mat);
  window.blockingWaitKey(0, 50);*/

  png.pack().pipe(stream);
}

function CameraRail() {
  this.material = new THREE.LineBasicMaterial({
  	color: 0x0000ff
  });

  this.geometry = new THREE.Geometry();
  this.geometry.vertices.push(
  	new THREE.Vector3(0, 0, 0),
  	new THREE.Vector3(config.camera.length, 0, 0)
  );

  var line = this.line = new THREE.Line(this.geometry, this.material);

  return line;
}

function Film(width, height) {
  this.material = new THREE.MeshBasicMaterial({
    wireframe: true,
    color : 0xffffff
  });

  var mesh = this.mesh = new THREE.Mesh(new THREE.PlaneGeometry(width, height, 10, 10), this.material);
  mesh.doubleSided = true;
  mesh.position.set(config.camera.length / 2, 0, 0 - config.camera.distance);

  return mesh;
}

function Subject() {
  this.material = new THREE.MeshNormalMaterial({ wireframe: true, wireframeLinewidth: 1});
  this.geometry = new THREE.TorusKnotGeometry(25, 5, 200, 16);
  var mesh = this.mesh = new THREE.Mesh(this.geometry, this.material);

  mesh.position.set(config.camera.length / 2, 0, 0 - config.camera.distance);

  return mesh;
}

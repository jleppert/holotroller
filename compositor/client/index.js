window.LiveReloadOptions = { host: 'localhost' };
require('livereload-js');
window.THREE = require('../../node_modules/three/three.js');
require('../../client/lib/TrackballControls.js');
var config = {
  width: 640,
  height: 480,

  film: {
    width: 127,
    height: 102
  },

  object: {
    x: 50,
    y: 50,
    z: 50
  },

  camera: {
    length: 300,
    distance: 200,
    stepSize: 1
  }
};

//config.camera.distance = config.film.height / 2 / Math.tan(Math.PI * config.camera.fov / 360);

var scene = new THREE.Scene();

// dxy = hologram size
// w = track length
// h = distance
function calcFOV(dx, dy, w, h) {
  var ch = 2 * Math.atan((dx + w) / (2 * h));

  var cv = 2 * Math.atan((dy) / (2 * h));
  var cn = 2 * Math.atan((Math.max(dy, dx)) / (2 * h));

  var res = { x: ch * (180 / Math.PI), y: cv * (180 / Math.PI), normal: cn * (180 / Math.PI) };

  res.aspect = res.x / res.y;

  return res;
}

function calcFOV2(y, d) {
  return 2 * Math.atan(y / ( 2 * d ) ) * (180 / Math.PI);
}

//console.log('fov!!!', calcFOV2(config.film.height, config.camera.distance));

//console.log(calcFOV(config.film.width, config.film.height, config.camera.length, config.camera.distance));

var desiredFOV = calcFOV(config.film.width, config.film.height, config.camera.length, config.camera.distance);

//config.height = Math.floor(config.width / desiredFOV.aspect);
//config.width = Math.floor(config.height * desiredFOV.aspect);

console.log(desiredFOV);


var material = new THREE.LineBasicMaterial({
	color: 0x0000ff
});

var geometry = new THREE.Geometry();
geometry.vertices.push(
	new THREE.Vector3(0, 0, 0),
	new THREE.Vector3(config.camera.length, 0, 0)
);

var line = new THREE.Line(geometry, material);
scene.add(line);


var camera = new THREE.PerspectiveCamera(desiredFOV.y, config.width / config.height, 0.1, 1000);
var material = new THREE.MeshNormalMaterial({ wireframe: true, wireframeLinewidth: 1});
//var geometry = new THREE.TorusKnotGeometry(10, 3, 100, 16);
//var geometry = new THREE.BoxGeometry(50, 50, 50);
var geometry = new THREE.TorusKnotGeometry(25, 5, 200, 16);

var Plane = function(width, height) {
    var material = new THREE.MeshBasicMaterial({
        wireframe: true,
        color : 0xffffff
    });

    var mesh = new THREE.Mesh(new THREE.PlaneGeometry(width, height, 10, 10), material);
    mesh.doubleSided = true;
    this.mesh = mesh;
}


var film = new Plane(127, 102);
film.mesh.position.set(config.camera.length / 2, 0, config.camera.distance);
scene.add(film.mesh);

console.log('pos', film.mesh.position);

var mesh = new THREE.Mesh(geometry, material);
var material2 = new THREE.MeshBasicMaterial({
    wireframe: false,
    color : 0xffffff
});
//var cameraTarget = new THREE.Mesh( new THREE.CubeGeometry(5,5,5), material2);

//camera.lookAt(cameraTarget.position);
//scene.add(mesh);
//scene.add(cameraTarget);

var cameraHelper = new THREE.CameraHelper(camera);
//scene.add(cameraHelper);


var hFOV = 2 * Math.atan( Math.tan( camera.fov * Math.PI / 180 / 2 ) * camera.aspect ) * 180 / Math.PI;

console.log('hFOV!', hFOV);

function getDirection(position, origin) {
   var pos = new THREE.Vector3(
    config.camera.length / 2 - config.film.width / 2 - position + 0,
    0 - config.film.height / 2,
    -config.camera.distance);

    return pos.normalize();
}


var arrow;
//var hFOV = 2 * Math.atan( Math.tan( camera.fov / 2 ) * camera.aspect ) * 180 / Math.PI;
function renderStep(lookAt, position, seq, renderer, buffer, otherCamera) {
  //console.log(camera.position);
  //debugger;

  console.log('position', position.x);
  camera.position.set(position.x, position.y, position.z);
  //cameraTarget.position.set(position.x, position.y, position.z);
  camera.lookAt(film.mesh.position);
  var vector = new THREE.Vector3(0, 0, -1);
  vector.applyQuaternion( camera.quaternion );
  vector.add(camera.position);
  //console.log('distance', vector.distanceTo(new THREE.Vector3(0, 0, 0)));
  //console.log('v!!!', vector);
  camera.updateProjectionMatrix();


  if(arrow) scene.remove(arrow);
  arrow = new THREE.ArrowHelper(getDirection(position.x, camera.position), camera.position, config.camera.distance, 0xffff00);
  //scene.add(arrow);
  //console.log(getDirection(position.x, camera.position));
  //console.log('dir', camera.getWorldDirection(getDirection(position.x)));

  //var arrowHelper = new THREE.ArrowHelper(camera.position, camera.position, 20, 0xffff00);
  //scene.add( arrowHelper );

  //console.log(scene.position);

  if(buffer) {
    renderer.render(scene, camera, buffer);

    var gl = renderer.getContext();
    var pixelBuffer = new ArrayBuffer(config.width * config.height * 4);
    var pixels8 = new Uint8Array(pixelBuffer);

    gl.readPixels(0, 0, config.width, config.height, gl.RGBA, gl.UNSIGNED_BYTE, pixels8);

    var pixels8c = new Uint8ClampedArray(pixelBuffer);
    var imageData = new ImageData(pixels8c, config.width, config.height);
    var canvasEl = document.createElement('canvas');
    canvasEl.width = config.width;
    canvasEl.height = config.height;
    var ctx = canvasEl.getContext('2d');
    ctx.putImageData(imageData, 0, 0);

    canvasEl.id = seq;

    return canvasEl;
  } else {
    renderer.render(scene, otherCamera || camera);
  }
}


function generateFrames() {
  var buffer = new THREE.WebGLRenderTarget(config.width, config.height, { minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter});
  var renderer = new THREE.WebGLRenderer();

  render(renderer, buffer);
}

function render(renderer, buffer) {
  var steps = config.camera.length;
  var starting = 0;
  for(var i = starting, seq = 0; i < steps / config.camera.stepSize; i += config.camera.stepSize, seq++) {
    var canvas = renderStep(new THREE.Vector3(0, 0, 0), new THREE.Vector3(i, 0, config.camera.distance), seq, renderer, buffer);
    if(canvas) {
      document.body.appendChild(canvas);
    }
  }
}

function play() {
  for(var i = 0; i < (config.camera.length / config.camera.stepSize); i++) {
    (function(i) {
      setTimeout(function() {
        //console.log(i);
        var current = document.getElementById(i),
            last = document.getElementById(i - 1 >= 0 ? i - 1 : (config.camera.length / config.camera.stepSize) - 1);
        last.style.opacity = 0;
        current.style.opacity = 1;
        //debugger;
      }, i * 10);
    }(i));
  }
}

//generateFrames();
//play();


var compositor = new THREE.WebGLRenderer();
compositor.setSize( config.width, config.height );
document.body.appendChild( compositor.domElement );


var frontView = new THREE.WebGLRenderer();
frontView.setSize(config.width, config.height);
frontView.domElement.style.top = config.height;
frontView.domElement.style.marginTop = 10;
document.body.appendChild(frontView.domElement);

var topView = new THREE.WebGLRenderer();
topView.setSize(config.width, config.height);
topView.domElement.style.left = config.width;
topView.domElement.style.marginLeft = 10;
document.body.appendChild(topView.domElement);


var obliqueView = new THREE.WebGLRenderer();
obliqueView.setSize(config.width, config.height);
obliqueView.domElement.style.left = config.width;
obliqueView.domElement.style.marginLeft = 10;
obliqueView.domElement.style.top = config.height;
obliqueView.domElement.style.marginTop = 10;
document.body.appendChild(obliqueView.domElement);

var fps = 90;
var now;
var then = Date.now();
var interval = 1000/fps;
var delta;

var steps = config.camera.length / config.camera.stepSize;
var starting = 0;

var i = starting, seq = 0;

var frontCamera = new THREE.PerspectiveCamera(60, config.width / config.height, 0.1, 1000);
var topCamera = new THREE.PerspectiveCamera(60, config.width / config.height, 0.1, 1000);

var obliqueCamera = new THREE.OrthographicCamera( 300 / - 2, 300 / 2, 300 / 2, 300 / - 2, 0.1, 1000);

//frontCamera.rotation.y = (180 / Math.PI) * 90;


frontCamera.up.set(0, 1, 0);
frontCamera.position.z = config.camera.distance + 100;
frontCamera.lookAt(scene.position);

topCamera.up.set(0, 0, 1);
topCamera.position.y = config.camera.distance + 200;
topCamera.lookAt(scene.position);

obliqueCamera.position.x = 200;
				obliqueCamera.position.y = 200;
obliqueCamera.position.z = 300;
obliqueCamera.lookAt(scene.position);
var controls = new THREE.TrackballControls(obliqueCamera);




//frontCamera.position.x += 20;

//frontCamera

//frontCamera.rotation.y = -(Math.PI / 180) * 30;
//frontCamera.updateProjectionMatrix();

function draw() {

	requestAnimationFrame(draw);

  controls.update();

  //console.log('test!!!');

	now = Date.now();
	delta = now - then;

	if (delta > interval && i < steps / config.camera.stepSize) {
		then = now - (delta % interval);

		i += config.camera.stepSize;
    seq++;

    stepEl.value = i;

    renderStep(new THREE.Vector3(0, 0, 0), new THREE.Vector3(i, 0, config.camera.distance), seq, compositor);


    renderStep(new THREE.Vector3(0, 0, 0), new THREE.Vector3(i, 0, config.camera.distance), seq, frontView, null, frontCamera);

    renderStep(new THREE.Vector3(0, 0, 0), new THREE.Vector3(i, 0, config.camera.distance), seq, topView, null, topCamera);

    renderStep(new THREE.Vector3(0, 0, 0), new THREE.Vector3(i, 0, config.camera.distance), seq, obliqueView, null, obliqueCamera);
	}
}

var stepEl = document.createElement('input');
stepEl.type = 'range';
stepEl.min = starting;
stepEl.max = steps / config.camera.stepSize;
stepEl.step = config.camera.stepSize;
stepEl.value = starting;
stepEl.style.top = config.height * 2;
stepEl.style.width = config.width * 2;
document.body.appendChild(stepEl);

stepEl.addEventListener('input', function() {
  renderStep(new THREE.Vector3(0, 0, 0), new THREE.Vector3(stepEl.value, 0, config.camera.distance), 0, compositor);
  renderStep(new THREE.Vector3(0, 0, 0), new THREE.Vector3(stepEl.value, 0, config.camera.distance), 0, frontView, null, frontCamera);
  renderStep(new THREE.Vector3(0, 0, 0), new THREE.Vector3(stepEl.value, 0, config.camera.distance), 0, topView, null, topCamera);

  renderStep(new THREE.Vector3(0, 0, 0), new THREE.Vector3(stepEl.value, 0, config.camera.distance), seq, obliqueView, null, obliqueCamera);
});

draw();

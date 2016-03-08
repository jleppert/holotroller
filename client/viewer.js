window.LiveReloadOptions = { host: 'localhost' };
require('livereload-js');

var global = {};

require('./lib/TrackballControls.js');

var context = {
  recording: {
    width: 127,
    height: 102,
    thickness: 2.4
  },

  display: {
    width: 196.608,
    height: 147.456,
    thickness: 1,
    
    resolution: {
      width: 2048,
      height: 1536
    }
  }
};

var scene = new THREE.Scene();
var axes = new THREE.AxisHelper(200);
scene.add(axes);

var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

var recordingGeometry = new THREE.BoxGeometry(context.recording.width, context.recording.height, context.recording.thickness);
var material = new THREE.MeshLambertMaterial( { color: 0xff8080, transparent: true, opacity: 0.5 } );
var recordingMesh = new THREE.Mesh(recordingGeometry, material);
scene.add(recordingMesh);

var virtualScene = new THREE.Scene();
var virtualCamera = new THREE.PerspectiveCamera(75, context.display.resolution.width / context.display.resolution.height, 0.1, 1000); 
var bufferTexture = new THREE.WebGLRenderTarget(context.display.resolution.width, context.display.resolution.height, { minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter});
var redMaterial = new THREE.MeshBasicMaterial({color:0x00ff00, wireframe: true, wireframeLinewidth: 2});
var boxGeometry = new THREE.BoxGeometry(5, 5, 5);
var boxObject = new THREE.Mesh( boxGeometry, redMaterial );
boxObject.position.z = -10;
virtualScene.add(boxObject);


var sphereGeometry = new THREE.SphereGeometry(5, 32, 32);
var sphereObject = new THREE.Mesh(sphereGeometry, redMaterial); 
sphereObject.position.z = -10;
sphereObject.position.x = 10;
virtualScene.add(sphereObject);

var knotGeometry = new THREE.TorusKnotGeometry( 10, 3, 100, 16 );
var torusObject = new THREE.Mesh(knotGeometry, redMaterial );
torusObject.position.x = -35;
torusObject.position.z = -50;
virtualScene.add(torusObject);

virtualCamera.position.z = 10;

var displayGeometry = new THREE.BoxGeometry(context.display.width, context.display.height, context.display.thickness * 2);
//var material = new THREE.MeshBasicMaterial({map:bufferTexture});
var mappedSceneMaterial = new THREE.MeshLambertMaterial( { map: bufferTexture, color: 0x00ff00, transparent: true, opacity: 0.5 });
var sideMaterial = new THREE.MeshLambertMaterial({ color: 0x00ff00, transparent: true, opacity: 0.5 });

var displayMesh = new THREE.Mesh(displayGeometry, new THREE.MeshFaceMaterial([sideMaterial, sideMaterial, sideMaterial, sideMaterial, mappedSceneMaterial, mappedSceneMaterial]));
displayMesh.position.set(0, 0, 100);
scene.add(displayMesh);

var ambient = new THREE.AmbientLight( 0xffffff );
scene.add(ambient);


var light = new THREE.DirectionalLight( 0xffffff );
light.position = camera.position;
scene.add(light);

camera.position.z = 200;

var controls = new THREE.TrackballControls(camera);

function render() {
  controls.update();
  requestAnimationFrame(render);
  boxObject.rotation.x += 0.01;
  boxObject.rotation.y += 0.01;
  sphereObject.rotation.x += 0.01;
  sphereObject.rotation.y += 0.01;

  torusObject.rotation.x += 0.01;
  torusObject.rotation.y += 0.01;
  renderer.render(virtualScene, virtualCamera, bufferTexture);
  renderer.render(scene, camera);
}
render();

window.viewer = global;

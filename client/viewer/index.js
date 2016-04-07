window.LiveReloadOptions = { host: 'localhost' };
require('livereload-js');
window.THREE = require('../../node_modules/three/three.js');
require('../lib/TrackballControls.js');

var RecordingMaterial = require('./recording.js');
var VirtualScene = require('./virtual-scene.js');
var Display = require('./display.js');
var Slit = require('./slit.js');
var GUI = require('./gui.js');

function Viewer(config) {
  this.config = config;

  this.scene = new THREE.Scene();
  this.axes = new THREE.AxisHelper(200);
  this.scene.add(this.axes);

  this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  this.renderer = new THREE.WebGLRenderer();

  this.recording = new RecordingMaterial(this);
  this.virtualScene = new VirtualScene(this);
  this.display   = new Display(this);

  this.slit = new Slit(this);

  var ambient = new THREE.AmbientLight(0xffffff);
  this.scene.add(ambient);

  var light = new THREE.DirectionalLight(0xffffff);
  light.position = this.camera.position;
  this.scene.add(light);

  this.camera.position.z = 200;
  this.controls = new THREE.TrackballControls(this.camera);

  this.gui = new GUI(this);
}

Viewer.prototype = {
  start: function() {
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(this.renderer.domElement);

    this.render();
  },
  render: function() {
    this.controls.update();
    requestAnimationFrame(this.render.bind(this));

    this.virtualScene.render(this.renderer);
    this.renderer.render(this.scene, this.camera);
  }
};


var viewer = new Viewer(require('../../config.js'));

window.viewer = viewer;
viewer.start();

window.LiveReloadOptions = { host: 'localhost' };
require('livereload-js');
window.THREE = require('../../node_modules/three/three.js');
require('../../client/lib/TrackballControls.js');

var config = {
  hogel: 1000, // slit size, in microns


  width: 120 * 8,  // nm
  height: 100 * 8,  // nv

  window: {
    width: 100, // win
    height: 200  // hin
  },

  film: {
    width: 120,  // dx
    height: 100  // dy
  },

  camera: {
    length: 100,
    distance: 90, //h
    stepSize: 0.10
  }
};

function calculateFrames() {
  var res = {
    nk: 2 * Math.floor(config.window.width * 1000/2/config.hogel),
    ng: 2 * Math.floor(config.window.height * 1000/2/config.hogel)
  };

  res.w = (res.nk - 1) * config.hogel/1000;
  res.h = (res.ng - 1) * config.hogel/1000;

  return res;
}
//console.log('frames', calculateFrames());

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
var fullWidth = config.width * 2;
var fullHeight = config.height * 1;
//camera.setViewOffset( config.width, config.height, config.width * 0, config.height * 0, config.width, config.height );
//var camera = new THREE.OrthographicCamera( config.width / - 15, config.width / 15, config.height / 15, config.height / - 15, 1, 1000 );

var cameraHelper = new THREE.CameraHelper(camera);
scene.add(cameraHelper);

camera.position.set(0, 0, 0);
camera.lookAt(film.position);

var renderer = new THREE.WebGLRenderer({ alpha: true });
renderer.setSize(config.width, config.height);
renderer.main = true;
var container = document.getElementById('container');
container.appendChild(renderer.domElement);


function pastelColors(){
  var r = (Math.round(Math.random()* 127) + 127).toString(16);
  var g = (Math.round(Math.random()* 127) + 127).toString(16);
  var b = (Math.round(Math.random()* 127) + 127).toString(16);
  return '#' + r + g + b;
}

var dBbox = {};
['ll', 'lr', 'ul', 'ur', 'center'].forEach(function(c) {
  dBbox[c] = document.createElement('div');
  dBbox[c].className = 'floater';

  dBbox[c].style.background = pastelColors();

  container.appendChild(dBbox[c]);
});

function getCorners(points) {
  var pts = [];
  points.forEach(function(point) {
    pts.push(point.x, point.y);
  });

  return pts.slice(0, 8);
}

function _getProjectedBBox(obj, camera, flipY) {
  var bbox = new THREE.Box3().setFromObject(obj);
  var corners = [
    (new THREE.Vector3(bbox.min.x, bbox.max.y, bbox.min.z)).project(camera),
    (new THREE.Vector3(bbox.max.x, bbox.max.y, bbox.max.z)).project(camera),
    (new THREE.Vector3(bbox.max.x, bbox.min.y, bbox.min.z)).project(camera),
    (new THREE.Vector3(bbox.min.x, bbox.min.y, bbox.min.z)).project(camera),
    (new THREE.Vector3(obj.position.x, obj.position.y, obj.position.z)).project(camera),
    (new THREE.Vector3(bbox.min.x, bbox.min.y, bbox.min.z)).project(camera),
    (new THREE.Vector3(bbox.max.x, bbox.max.y, bbox.max.z)).project(camera)
  ];

  // ul, ur, lr, ll, center
  return corners.map(function(corner) {
    corner.x = ((corner.x + 1) / 2) * config.width;
    if(flipY) {
      corner.y = ((-corner.y + 1) / 2) * config.height;
    } else {
      corner.y = ((corner.y + 1) / 2) * config.height;
    }

    return corner;
  });
}

function toDeg(rad) {
  return rad * 180 / Math.PI;
}

function toRad(deg) {
  return deg * Math.PI / 180;
}
var mouseX = 0, mouseY = 0;
renderer.domElement.addEventListener('mousemove', function(ev) {
  var x = ev.offsetX,
      y = Math.abs(ev.offsetY - config.height);

  mouseX = x;
  mouseY = y;
  //updateCursor(x, y);
});

function optimalCH(position) {
  var dx = config.film.width,
      h  = config.camera.distance,
      w  = config.camera.length;

  return 2 * Math.atan(
    8*h*dx / 16*h^2 - dx^2
  );

  /*return 2 * Math.atan(
    dx / 2*h + (2/h)*(w/2 - position)*(w/2 - position - dx/2)
  );*/
}

//console.log(toDeg(optimalCH()));

function updateCursor(x, y) {
  var halfW = config.camera.length / 2;
  var halfDx = config.film.width / 2;

  var hFOV = 2 * Math.atan(Math.tan(toRad(camera.fov) / 2) * camera.aspect);
  var vFOV = toRad(camera.fov);

  //console.log('fov!!', toDeg(hFOV), toDeg(vFOV));

  //debugger;
  //var realX = 2 * Math.sqrt(Math.pow(config.camera.distance, 2) + Math.pow(halfW - currentStep, 2)) * Math.tan(hFOV / 2) * ((x - 1) / (config.width - 1));
  //var realY = 2 * Math.sqrt(Math.pow(config.camera.distance, 2) + Math.pow(halfW - currentStep, 2)) * Math.tan(vFOV / 2) * ((y - 1) / (config.height - 1));

  var realX = x;
  var realY = y;

  //var realX = x;
  var cX = (halfDx + currentStep - halfW) +
    ((config.camera.distance * ((realX / Math.sqrt(Math.pow(config.camera.distance, 2) + Math.pow((halfW - currentStep), 2))) - Math.tan(hFOV/2))) + (halfW - currentStep)) /
    1 - ((halfW - currentStep) / config.camera.distance) * (
      (realX / Math.sqrt(Math.pow(config.camera.distance, 2) + Math.pow(halfW - currentStep, 2))) - Math.tan(hFOV/2)
    ) + 10;



  //var vFOV = toRad(camera.fov);
  var halfY = config.film.height / 2;



  var cY = halfY + (realY - Math.sqrt(Math.pow(config.camera.distance, 2) + Math.pow(halfW - currentStep, 2) * Math.tan(vFOV/2))) /
    1 - ((halfW - currentStep) / config.camera.distance) * ((realX / Math.sqrt(Math.pow(config.camera.distance, 2) + Math.pow(halfW - currentStep, 2))) - Math.tan(vFOV/2));

  //console.log(x, y, cX, cY);

    real.style.top = Math.abs(config.height - y) + 'px';
    real.style.left = x + 'px';
    div.style.top = Math.abs(config.height - cY) + 'px';
    div.style.left = cX + 'px';

  //console.log('cx', cX, 'cy', cY);
  //


  /*var mouse = {};
  mouse.x = (event.clientX / config.width) * 2 - 1;
  mouse.y = - (event.clientY / config.height) * 2 + 1;

  div.style.top = ev.offsetY + 'px';
  div.style.left = ev.offsetX + 'px';

  console.log(ev.offsetX, Math.abs(ev.offsetY - config.height));*/


}

var topCamera = new THREE.PerspectiveCamera(60, config.width / config.height, 0.1, 1000);

topCamera.up.set(0, 0, 1);
topCamera.position.y = config.camera.distance + 200;
topCamera.position.z = -1;
topCamera.position.x = -200;
topCamera.lookAt(scene.position);

var controls = new THREE.TrackballControls(topCamera);

var topView = new THREE.WebGLRenderer();
topView.setSize(config.width, config.height);
topView.domElement.style.left = config.width;
topView.domElement.style.marginLeft = 10;
container.appendChild(topView.domElement);


function getDirection(step, x, y) {
  x = x || 0;
  y = y || 0;
   var pos = new THREE.Vector3(
    config.camera.length / 2 - config.film.width / 2 - step + x,
    y - config.film.height / 2,
    -config.camera.distance);

    return pos;
}

// origin is x, y, z
function getDirectionRaw(step, x, y) {
  x = x || 0;
  y = y || 0;
   var pos = new THREE.Vector3(
    config.camera.length / 2 - config.film.width / 2 - step + x,
    y - config.film.height / 2,
    -config.camera.distance);

    return new THREE.Vector3(step, 0, 0).add(pos).normalize();
}

var arrow;
var currentStep;

var percT = require('perspective-transform');
function renderStep(camera, renderer, step) {
  controls.update();
  camera.position.x = step;
  camera.lookAt(film.position);

  currentStep = step;

  //console.log('optimalCH', toDeg(optimalCH(step)));

  if(arrow) scene.remove(arrow);
  var origin = camera.getWorldDirection();
  arrow = new THREE.ArrowHelper(getDirection(step, 0, 0).normalize(), camera.position, config.camera.distance, 0xffff00);
  scene.add(arrow);


  if(renderer.main) {
    //var pos = film.position.clone().project(camera);
    //var pos = calc2DPoint(getDirection(step, config.film.width / 2, config.film.height / 2));

    var bbox = getProjectedBBox(film, camera);

    var bbox2 = _getProjectedBBox(film, camera, true);
    var n = [0, 0, config.width, 0, config.width, config.height, 0, config.height];
    var tx = percT(getCorners(bbox2), n);

var t = tx.coeffs;
  t = [t[0], t[3], 0, t[6],
       t[1], t[4], 0, t[7],
       0   , 0   , 1, 0   ,
       t[2], t[5], 0, t[8]];
  t = "matrix3d(" + t.join(", ") + ")";
  renderer.domElement.style.transformOrigin = '0 0 0';
  renderer.domElement.style.transform = t;

    //console.log('tx!!', tx);
    //console.log(bbox);


    function calc2DPoint(worldVector) {
        var vector = worldVector.clone().project(camera);
        var halfWidth = renderer.domElement.width / 2;
        var halfHeight = renderer.domElement.height / 2;
        return {
            x: Math.round(vector.x * halfWidth + halfWidth),
            y: Math.round(-vector.y * halfHeight + halfHeight)
        };
    }

    dBbox.ul.style.top = bbox[0].y;
    dBbox.ul.style.left = bbox[0].x;

    dBbox.ur.style.top = bbox[1].y;
    dBbox.ur.style.left = bbox[1].x;

    dBbox.lr.style.top = bbox[2].y;
    dBbox.lr.style.left = bbox[2].x;

    dBbox.ll.style.top = bbox[3].y;
    dBbox.ll.style.left = bbox[3].x;

    dBbox.center.style.top = bbox[4].y;
    dBbox.center.style.left = bbox[4].x;

    //div.style.top = Math.abs(config.height - pos.y) + 'px';
    //div.style.left = pos.x + 'px';

    //console.log(xcoord, ycoord);

    //console.log(getDirection(step, 0, 0));
  }



  topView.render(scene, topCamera);
  renderer.render(scene, camera);
  //updateCursor(mouseX, mouseY);
}


var fps = 60;
var now;
var then = Date.now();
var interval = 1000/fps;
var delta;

var steps = config.camera.length / config.camera.stepSize,
    currentStep = 0;

function draw() {
    requestAnimationFrame(draw);

    now = Date.now();
    delta = now - then;

    if (delta > interval) {
        then = now - (delta % interval);

        if(currentStep > config.camera.length) currentStep = 0;
        currentStep += config.camera.stepSize;
        renderStep(camera, renderer, currentStep);
    }
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



  //console.log('corners', corners);

  // ul, ur, lr, ll
  return corners.map(function(corner) {
    corner.x = ((corner.x + 1) / 2) * config.width;
    corner.y = ((-corner.y + 1) / 2) * config.height;

    return corner;
  });
  //vMin.x = ((vMin.x + 1) / 2) * config.width;
  //vMin.y = ((-vMin.y + 1) / 2) * config.height;

  //vMax.x = ((vMax.x + 1) / 2) * config.width;
  //vMax.y = ((-vMax.y + 1) / 2) * config.height;

  //return [ul, ur, lr, ll];
}


function calcCameraDistance() {
  //var hFOV = 2 * Math.atan( Math.tan( camera.fov / 2 ) * camera.aspect ) * 180 / Math.PI;
hFOV = 2 * Math.atan( Math.tan( (camera.fov * Math.PI/180) / 2 ) * camera.aspect );
  console.log('hfov', hFOV);
  var res = config.hogel / 2.0 / 1000 * (config.width - 1)/ Math.tan(hFOV/2);
  return res;
}

//console.log('camera distance', calcCameraDistance());


function calcFOV(dx, dy, w, h) {
  dx = config.film.width,
  dy = config.film.height,
  w = config.camera.length,
  h = config.camera.distance;


  var ch = 2 * Math.atan((dx + w)/2/h);

  var cv = 2 * Math.atan((dy) / (2 * h));
  var cn = 2 * Math.atan((Math.max(dy, dx)) / (2 * h));


  //var ch = 70 * (Math.PI / 180);

  var cv2 = 2 * Math.atan(
    ((config.height ) / (config.width )) * Math.tan(ch / 2)
  );

  var res = { x: ch, y: cv * (180 / Math.PI), normal: cn * (180 / Math.PI), cv2: cv2 * (180 / Math.PI) };

  res.aspect = res.x / res.y;

  return res;
}


function hFOV(dx, dy, w, h) {
  //var res = 2 * Math.atan((w + dx) / 2*h);


  var ch = 2 * Math.atan((dx + w) / (2 * h));
  var cv = 2 * Math.atan((dy) / (2 * h));

  return {
    cv: cv * (180 / Math.PI),
    ch: ch * (180 / Math.PI)
  };
}

//console.log(calcFOV(config.film.width, config.film.height, config.camera.length, config.camera.distance));
//console.log(hFOV(config.camera.length, config.film.width, config.camera.distance));
//console.log('fov!', verticalFOV(config.camera.distance, config.film.width, config.film.height));



draw();

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
  /*this.material = new THREE.MeshNormalMaterial({ wireframe: true, wireframeLinewidth: 1});
  //this.geometry = new THREE.CubeGeometry( 20, 20, 20 );
  this.geometry = new THREE.TorusKnotGeometry(25, 5, 200, 16);
  var mesh = this.mesh = new THREE.Mesh(this.geometry, this.material);

  mesh.position.set(config.camera.length / 2, 0, 0 - config.camera.distance);*/
  var snowden = require('snowden');
  var createComplex = require('three-simplicial-complex')(THREE);
  var geo = createComplex(snowden);
  geo.computeFaceNormals();

  var mat = new THREE.MeshNormalMaterial({ wireframe: false, wireframeLinewidth: 1});
  var meesh = new THREE.Mesh(geo, mat);
  meesh.position.set(config.camera.length / 2, 0, 0 - config.camera.distance);

  meesh.scale.set( 10, 10, 10 );

  return meesh;
}

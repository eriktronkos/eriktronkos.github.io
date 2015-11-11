/*global THREE, scene, window, document, requestAnimationFrame, console, EDIT*/
//setting up variables
var EDIT_MODE = false;
var IS_HANDLE = false;
var WHICH_HANDLE = "";
var viewSize = 500;
var points = {x01: 100,y01: 10,x1: 10,y1: 0,x02: 100,y02: -50,x2: -30,y2: 100} // -> x01 = x start line 1, y2 = y end line 2   
var aspectRatio = window.innerWidth / window.innerHeight;
var raycaster = new THREE.Raycaster();
var scene = new THREE.Scene();
var mouse = new THREE.Vector2();
var camera = new THREE.OrthographicCamera(-aspectRatio * viewSize / 2, aspectRatio * viewSize / 2, viewSize/2, -viewSize/2, 0, viewSize);
camera.position.x = 0;
camera.position.y = 0;
camera.position.z = 0;

var renderer = new THREE.WebGLRenderer({ alpha: true });
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setClearColor(0x333333, 1);
document.body.appendChild( renderer.domElement );

var geometryLine1, geometryLine2;

var clearScene = function() {
// clears the scene
	var objsToRemove = _.rest(scene.children)
	_.each(objsToRemove, function( object ) {
		scene.remove(object);
        });
	scene.remove(scene.children[0]);
}

var drawLines = function() {
	//drawing the lines
	var material = new THREE.LineBasicMaterial({
		color: 0x00ff00
	});

	geometryLine1 = new THREE.Geometry();
	geometryLine1.vertices.push(
		new THREE.Vector3( points.x01, points.y01, viewSize ),
		new THREE.Vector3( points.x1, points.y1, viewSize)
	);

	geometryLine2 = new THREE.Geometry();
	geometryLine2.vertices.push(
		new THREE.Vector3( points.x02, points.y02, viewSize ),
		new THREE.Vector3( points.x2, points.y2, viewSize)
	);

	var line1 = new THREE.Line( geometryLine1, material );
	var line2 = new THREE.Line( geometryLine2, material);


	scene.add( line1 );
	scene.add( line2 );
}

var drawHandles = function() {
	//creating and drawing the handles
	var geometryHandle = new THREE.SphereGeometry(5 /*radius*/, 32 /*widthSegments*/, 32 /*heightSegments*/);
	var materialHandle = new THREE.MeshBasicMaterial({ 
		color: 0x0000ff
	});
	var handle11 = new THREE.Mesh( geometryHandle, materialHandle);
	var handle12 = new THREE.Mesh( geometryHandle, materialHandle);
	var handle21 = new THREE.Mesh( geometryHandle, materialHandle);
	var handle22 = new THREE.Mesh( geometryHandle, materialHandle);

	handle11.position.x = geometryLine1.vertices[0].x
	handle11.position.y = geometryLine1.vertices[0].y
	handle11.position.z = viewSize;
	handle11.name = 'handle11';

	handle12.position.x = geometryLine1.vertices[1].x
	handle12.position.y = geometryLine1.vertices[1].y
	handle12.position.z = viewSize;
	handle12.name = 'handle12';				
	
	handle21.position.x = geometryLine2.vertices[0].x
	handle21.position.y = geometryLine2.vertices[0].y
	handle21.position.z = viewSize;
	handle21.name = 'handle21';

	handle22.position.x = geometryLine2.vertices[1].x
	handle22.position.y = geometryLine2.vertices[1].y
	handle22.position.z = viewSize;		
	handle22.name = 'handle22';

	scene.add(handle11);
	scene.add(handle12);
	scene.add(handle21);
	scene.add(handle22);		
	
}

var drawIntersection = function() {
	//draws intersection at intersection point, if any
	var geometrySphere = new THREE.SphereGeometry(4 /*radius*/, 32 /*widthSegments*/, 32 /*heightSegments*/);
	var materialSphere = new THREE.MeshBasicMaterial({ 
		color: 0xff0000,
		transparent: true,
		opacity: 0.5
		});
	var intersection = new THREE.Mesh( geometrySphere, materialSphere);
	
	var result = checkLineIntersection(geometryLine1.vertices[0].x, geometryLine1.vertices[0].y, geometryLine1.vertices[1].x, geometryLine1.vertices[1].y, geometryLine2.vertices[0].x, geometryLine2.vertices[0].y, geometryLine2.vertices[1].x, geometryLine2.vertices[1].y);

	if (result.intersects == true){
	intersection.position.x = result.x;
	intersection.position.y = result.y;
	intersection.position.z = viewSize;
	scene.add(intersection);
	}
}

var checkLineIntersection = function (line1StartX, line1StartY, line1EndX, line1EndY, line2StartX, line2StartY, line2EndX, line2EndY) {
    // if the lines intersect, the result contains the x and y of the intersection 
    // http://stackoverflow.com/questions/563198/how-do-you-detect-where-two-line-segments-intersect

    var denominator, a, b, numerator1, numerator2;
    var result = {
	intersects: false,
	x: null,
	y: null,
    };

    denominator = ((line2EndY - line2StartY) * (line1EndX - line1StartX)) - ((line2EndX - line2StartX) * (line1EndY - line1StartY));
    if (denominator == 0) {
	return result;
    }
    dy = line1StartY - line2StartY;
    dx = line1StartX - line2StartX;
    numerator1 = ((line2EndX - line2StartX) * dy) - ((line2EndY - line2StartY) * dx);
    numerator2 = ((line1EndX - line1StartX) * dy) - ((line1EndY - line1StartY) * dx);
    a = numerator1 / denominator;
    b = numerator2 / denominator;

    //intersection coordinates
    result.x = line1StartX + (a * (line1EndX - line1StartX));
    result.y = line1StartY + (a * (line1EndY - line1StartY));

    //Specifically, (a or b) is how much you have to multiply the length of the line in order to exactly touch the other line.
    //Therefore, If (a or b)<0, it means the line is "behind" the given line, and if (a or b)>1 the line is "in front" of the given line.
    if (a > 0 && a < 1 && b > 0 && b < 1) {
	result.intersects = true;
    }

    return result;
};

var render = function () {

	// update the picking ray with the camera and mouse position	
	raycaster.setFromCamera( mouse, camera );	

	// calculate objects intersecting the picking ray
	var intersects = raycaster.intersectObjects( scene.children );

	for ( var i = 0; i < intersects.length; i++ ) {

		if (intersects[ i ].object.name.substring(0,6) == 'handle'){
			IS_HANDLE = true;
			WHICH_HANDLE = intersects[i].object.name.substring(6);
			break;
		}
		else { IS_HANDLE = false; WHICH_HANDLE = ""; }

	}

	requestAnimationFrame( render );
  //clearing the scene before drawing the lines
	clearScene();
	drawLines();
	drawHandles();			
	drawIntersection();
	

  camera.lookAt(new THREE.Vector3(0, 0, 1));
	renderer.render(scene, camera);
};


render();

document.addEventListener('mousedown', function () {
	//Setting edit mode
	EDIT_MODE = true;
    });
document.addEventListener('mouseup', function () {
	//Setting edit mode
	EDIT_MODE = false;
	WHICH_HANDLE = "";
    });
document.addEventListener('mousemove', function (event) {
	// calculate mouse position in normalized device coordinates
	mouse.x =   ( event.clientX / window.innerWidth ) * 2 - 1;
	mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

	mouse3 = new THREE.Vector3(mouse.x, mouse.y, 1);
	//unprojects normalized coordinates to retrieve points in space
	mouse3.unproject(camera);
	
	if (EDIT_MODE && IS_HANDLE){
		// if handle is pressed
		switch(WHICH_HANDLE) {
		// know which handle is being dragged and change its coordinates
			case '11':
				points.x01 = mouse3.x;
				points.y01 = mouse3.y;
				break;
			case '12':
				points.x1 = mouse3.x;
				points.y1 = mouse3.y;
				break;
			case '21':
				points.x02 = mouse3.x;
				points.y02 = mouse3.y;
				break;
			case '22':
				points.x2 = mouse3.x;
				points.y2 = mouse3.y;
				break;
		}

	}
    });


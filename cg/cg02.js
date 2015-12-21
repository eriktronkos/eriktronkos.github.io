var container;
var camera, controls, scene, renderer;
var objects = [], plane;

var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2(),
offset = new THREE.Vector3(),
INTERSECTED, SELECTED, ROTATING;
var ROTATION = false;
var rotationmsg;
var previousMouseOffset = {x: 0,y: 0};
var previousMousePosition = {x: 0,y: 0};

init();
animate();

function init() {

	container = document.createElement( 'div' );
	document.body.appendChild( container );

	camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 10000 );
	camera.position.z = 1000;


	controls = new THREE.TrackballControls( camera );
	controls.rotateSpeed = 10;
	controls.zoomSpeed = 1.2;
	controls.panSpeed = 0.8;
	controls.noZoom = true;
	controls.noPan = false;
	controls.staticMoving = true	;
	controls.dynamicDampingFactor = 0.2;

	scene = new THREE.Scene();

	scene.add( new THREE.AmbientLight( 0x505050 ) );

	var light = new THREE.SpotLight( 0xffffff, 1.5 );
	light.position.set( 0, 500, 2000 );
	light.castShadow = true;

	light.shadowCameraNear = 200;
	light.shadowCameraFar = camera.far;
	light.shadowCameraFov = 50;

	light.shadowBias = -0.00022;

	light.shadowMapWidth = 2048;
	light.shadowMapHeight = 2048;

	scene.add( light );

	var geometry = new THREE.BoxGeometry( 40, 40, 40 );

		var object = new THREE.Mesh( geometry, new THREE.MeshLambertMaterial( { color: Math.random() * 0xffffff } ) );

		object.position.x = 0;
		object.position.y = 0;
		object.position.z = 0;

		object.rotation.x = Math.random() * 2 * Math.PI;
		object.rotation.y = Math.random() * 2 * Math.PI;
		object.rotation.z = Math.random() * 2 * Math.PI;

		object.scale.x = 1;
		object.scale.y = 1;
		object.scale.z = 1;

		object.castShadow = true;
		object.receiveShadow = true;

		scene.add( object );

		objects.push( object );

	plane = new THREE.Mesh(
		new THREE.PlaneBufferGeometry( 10000, 10000, 8, 8 ),
		new THREE.MeshBasicMaterial( { visible: false } )
		);
	scene.add( plane );

	renderer = new THREE.WebGLRenderer( { antialias: true } );
	renderer.setClearColor( 0xf0f0f0 );
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.sortObjects = false;

	renderer.shadowMap.enabled = true;
	renderer.shadowMap.type = THREE.PCFShadowMap;

	container.appendChild( renderer.domElement );

	var info = document.createElement( 'div' );
	info.style.position = 'absolute';
	info.style.top = '10px';
	info.style.width = '100%';
	info.style.textAlign = 'center';
	info.innerHTML = 'Erik Tronkos - CG02';
	container.appendChild( info );

	rotationmsg = document.createElement( 'div' );
	
	rotationmsg.id = 'rotationMode'
	rotationmsg.style.position = 'absolute';
	rotationmsg.style.top = '30px';
	rotationmsg.style.width = '100%';
	rotationmsg.style.textAlign = 'center';
	rotationmsg.innerHTML = 'MOVE MODE';
	rotationmsg.visible = 'false';
	container.appendChild( rotationmsg );

	renderer.domElement.addEventListener( 'mousemove', onDocumentMouseMove, false );
	renderer.domElement.addEventListener( 'mousedown', onDocumentMouseDown, false );
	renderer.domElement.addEventListener( 'mouseup', onDocumentMouseUp, false );
	window.addEventListener( 'keydown', onDocumentKeyPressed, false );

	//
	window.addEventListener( 'resize', onWindowResize, false );

}

function onWindowResize() {

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize( window.innerWidth, window.innerHeight );

}

function onDocumentMouseMove( event ) {

	event.preventDefault();

	mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
	//
	raycaster.setFromCamera( mouse, camera );

	if ( SELECTED && !ROTATION) {

		var intersects = raycaster.intersectObject( plane );

		if ( intersects.length > 0 ) {

			SELECTED.position.copy( intersects[ 0 ].point);
				// .sub( offset ) );

}

return;

}

var intersects = raycaster.intersectObjects( objects );

if ( intersects.length > 0 ) {

	if ( INTERSECTED != intersects[ 0 ].object ) {

		if ( INTERSECTED ) INTERSECTED.material.color.setHex( INTERSECTED.currentHex );

		INTERSECTED = intersects[ 0 ].object;
		INTERSECTED.currentHex = INTERSECTED.material.color.getHex();

			// plane.position.copy( INTERSECTED.position );
			// plane.lookAt( camera.position );

		}

		container.style.cursor = 'pointer';

	} else {

		if ( INTERSECTED ) INTERSECTED.material.color.setHex( INTERSECTED.currentHex );

		INTERSECTED = null;

		container.style.cursor = 'auto';

	}

	if ( ROTATION && ROTATING && SELECTED) {
	
		var deltaMove = {
			x: event.offsetX-previousMousePosition.x,
			y: event.offsetY-previousMousePosition.y
		};

		var deltaRotationQuaternion = new THREE.Quaternion().setFromEuler(new THREE.Euler(
                ((deltaMove.y * Math.PI) / 180 ) /*converting to radians*/,
                ((deltaMove.x * Math.PI) / 180 ),
                0,
                'XYZ'
            ));

		SELECTED.quaternion.multiplyQuaternions(deltaRotationQuaternion, SELECTED.quaternion);

		previousMouseOffset = {
			 	x: event.offsetX,
			 	y: event.offsetY
			 	};
		
	
		
	}
	previousMousePosition = {
		 	x: event.clientX,
		 	y: event.clientY
		 	};

}

function onDocumentMouseDown( event ) {

	event.preventDefault();

	raycaster.setFromCamera( mouse, camera );

	var intersects = raycaster.intersectObjects( objects );

	if ( intersects.length > 0 ) {

		controls.enabled = false;

		SELECTED = intersects[ 0 ].object;

		plane.position.copy( SELECTED.position );

		var intersects = raycaster.intersectObject( plane );

		// if ( intersects.length > 0 ) {

		// 	offset.copy( intersects[ 0 ].point ).sub( plane.position );

		// }

		container.style.cursor = 'move';

	}

	if ( ROTATION ){
		ROTATING = true;
	}

}

function onDocumentMouseUp( event ) {

	event.preventDefault();

	controls.enabled = true;

	if ( INTERSECTED ) {


	}
	else {

		plane.lookAt( camera.position );
	}
	container.style.cursor = 'auto';
		SELECTED = null;


	if ( ROTATION ){
		ROTATING = false;
	}

}

function onDocumentKeyPressed( event ) {

	if(event.which == 82 /*r*/ && ROTATION == false) {
		ROTATION = true;
		container.children[2].innerHTML = 'ROTATE MODE'
		
		return;
	}
	else if ( event.which == 82 /*r*/ && ROTATION == true) {
		ROTATION = false;
		container.children[2].innerHTML = 'MOVE MODE';
		return;
	}
	else if ( event.which == 67 /*c*/) {

		raycaster.setFromCamera( mouse, camera );

		var intersection = raycaster.intersectObject( plane );

		var geometry = new THREE.BoxGeometry( 40, 40, 40 );

		var object = new THREE.Mesh( geometry, new THREE.MeshLambertMaterial( { color: Math.random() * 0xffffff } ) );

		object.position.x = intersection[0].point.x;
		object.position.y = intersection[0].point.y;
		object.position.z = intersection[0].point.z;

		object.castShadow = true;
		object.receiveShadow = true;

		scene.add( object );

		objects.push( object );
	}
	else if ( event.which == 68 /*d*/) {
		raycaster.setFromCamera( mouse, camera );

		var intersection = raycaster.intersectObjects( objects );

		if (intersection.length > 0){
			scene.remove(scene.getObjectById(intersection[0].object.id));
		}
	}
}

//

function animate() {

	requestAnimationFrame( animate );

	render();

}

function render() {

	controls.update();

	renderer.render( scene, camera );

}


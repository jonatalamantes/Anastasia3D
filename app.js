var container, stats;

var camera, scene, renderer, effect;
var helper, ikHelper, physicsHelper;

var vpds = [];

var ready = false;

var mouseX = 0, mouseY = 0;

var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;

var clock               = new THREE.Clock();
var clockParpadeo       = new THREE.Clock();
var clockParpadeoActual = new THREE.Clock();

var parpadear         = false;
var ascenderParpado   = false;
var animacionParpadeo = true;
var anastasiaMesh     = undefined;

var anguloCamara = 0;

init();
animate();

function init() 
{
    container = document.createElement( 'div' );
	document.body.appendChild( container );

	camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 2000 );
	camera.position.z = 28;
	camera.position.x = 1;
	camera.position.y = 1;

	// scene

	scene = new THREE.Scene();

	var ambient = new THREE.AmbientLight( 0x666666 );
	scene.add( ambient );

	var directionalLight = new THREE.DirectionalLight( 0x887766 );
	directionalLight.position.set( -1, 1, 1 ).normalize();
	scene.add( directionalLight );

	//

	renderer = new THREE.WebGLRenderer( { antialias: true } );
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.setClearColor( new THREE.Color( 0xffffff ) );
	container.appendChild( renderer.domElement );

	effect = new THREE.OutlineEffect( renderer );

	stats = new Stats();
	container.appendChild( stats.dom );

	// model

	var onProgress = function ( xhr ) {
		if ( xhr.lengthComputable ) {
			var percentComplete = xhr.loaded / xhr.total * 100;
			console.log( Math.round(percentComplete, 2) + '% downloaded' );
		}
	};

	var onError = function ( xhr ) {
	};

	var modelAnastasia = 'models/Anastasia/Anastasia.pmx';
    var modelCuarto    = 'models/Cuarto/Cuarto.pmx';
    
	var vpdFiles = [
		'models/vpds/01.vpd',
		'models/vpds/02.vpd',
		'models/vpds/03.vpd',
		'models/vpds/04.vpd',
		'models/vpds/05.vpd',
		'models/vpds/06.vpd',
		'models/vpds/07.vpd',
		'models/vpds/08.vpd',
		'models/vpds/09.vpd',
		'models/vpds/10.vpd',
		'models/vpds/11.vpd'
	];

	helper = new THREE.MMDHelper();

	var loader = new THREE.MMDLoader();

	loader.loadModel( modelAnastasia, function ( object ) {

		anastasiaMesh = object;
		anastasiaMesh.position.y = -10;
		scene.add( anastasiaMesh );

		helper.add( anastasiaMesh );
		helper.setAnimation( anastasiaMesh );

		/*
		 * Note: create CCDIKHelper after calling helper.setAnimation()
		 */
		ikHelper = new THREE.CCDIKHelper( anastasiaMesh );
		ikHelper.visible = false;
		scene.add( ikHelper );

		helper.setPhysics( anastasiaMesh );
		physicsHelper = new THREE.MMDPhysicsHelper( anastasiaMesh );
		physicsHelper.visible = false;
		scene.add( physicsHelper );

		helper.unifyAnimationDuration( { afterglow: 2.0 } );

		var vpdIndex = 0;
		function loadVpd () {

			var vpdFile = vpdFiles[ vpdIndex ];

			loader.loadVpd( vpdFile, function ( vpd ) {

				vpds.push( vpd );

				vpdIndex++;

				if ( vpdIndex < vpdFiles.length ) {

					loadVpd();

				} else {

					initGui( anastasiaMesh, vpds );
					ready = true;

				}

			}, onProgress, onError );

		}
		loadVpd();

	}, onProgress, onError );

    loader.loadModel( modelCuarto, function ( object ) {

		cuartoMesh = object;
		cuartoMesh.position.y = -10;
		cuartoMesh.rotation.y = (270*0.0174533);
		scene.add( cuartoMesh );

		helper.add( cuartoMesh );
		helper.setAnimation( cuartoMesh );

		/*
		 * Note: create CCDIKHelper after calling helper.setAnimation()
		 */
		ikHelper = new THREE.CCDIKHelper( cuartoMesh );
		ikHelper.visible = false;
		scene.add( ikHelper );

		helper.setPhysics( cuartoMesh );
		physicsHelper = new THREE.MMDPhysicsHelper( cuartoMesh );
		physicsHelper.visible = false;
		scene.add( physicsHelper );

		helper.unifyAnimationDuration( { afterglow: 2.0 } );

	}, onProgress, onError );

	document.addEventListener( 'mousemove', onDocumentMouseMove, false );
	window.addEventListener( 'resize', onWindowResize, false );
	document.addEventListener( 'keydown', onKeyDown, this );

	function initGui () {

		var gui = new dat.GUI();

		var dictionary = anastasiaMesh.morphTargetDictionary;

		var controls = {};
		var keys = [];

		var poses = gui.addFolder( 'Poses' );
		var morphs = gui.addFolder( 'Morphs' );

		function getBaseName ( s ) {

			return s.slice( s.lastIndexOf( '/' ) + 1 );

		}

		function initControls () {

			for ( var key in dictionary ) {

				controls[ key ] = 0.0;

			}

			controls.pose = -1;

			for ( var i = 0; i < vpdFiles.length; i++ ) {

				controls[ getBaseName( vpdFiles[ i ] ) ] = false;

			}

		}

		function initKeys () {

			for ( var key in dictionary ) {

				keys.push( key );

			}

		}

		function initPoses () {

			var files = { default: -1 };

			for ( var i = 0; i < vpdFiles.length; i++ ) {

				files[ getBaseName( vpdFiles[ i ] ) ] = i;

			}

			poses.add( controls, 'pose', files ).onChange( onChangePose );

		}

		function initMorphs () {

			for ( var key in dictionary ) {

				morphs.add( controls, key, 0.0, 1.0, 0.01 ).onChange( onChangeMorph );

			}

		}

		function onChangeMorph () {

			for ( var i = 0; i < keys.length; i++ ) {

				var key = keys[ i ];
				var value = controls[ key ];
				anastasiaMesh.morphTargetInfluences[ i ] = value;

			}

		}

		function onChangePose () {

			var index = parseInt( controls.pose );

			if ( index === -1 ) {

				anastasiaMesh.pose();

			} else {

				helper.poseAsVpd( anastasiaMesh, vpds[ index ] );
			}
		}

		initControls();
		initKeys();
		initPoses();
		initMorphs();

		onChangeMorph();
		onChangePose();

		poses.open();
		morphs.open();

		makePhongMaterials( anastasiaMesh.material.materials );
		anastasiaMesh.material = phongMaterials;
		helper.doIk = true;
		effect.enabled = false;
		helper.enablePhysics(true);
		physicsHelper.visible = false;
	}
}

function makePhongMaterials ( materials ) {

	var array = [];

	for ( var i = 0, il = materials.length; i < il; i ++ ) {

		if (materials[i]["name"].indexOf("Lentes") >= 0 || 
			materials[i]["name"].indexOf("Ojos")   >= 0 ||
			materials[i]["name"].indexOf("Rostro") >= 0 ||
			materials[i]["name"].indexOf("Cuerpo") >= 0 ||
			materials[i]["name"].indexOf("Cuello") >= 0 )
		{
			var m = new THREE.MeshToonMaterial();
		}
		else
		{
			var m = new THREE.MeshPhongMaterial();
		}

		m.copy( materials[ i ] );
		m.needsUpdate = true;

		array.push( m );
	}

	phongMaterials = new THREE.MultiMaterial( array );
}

function onKeyDown(evento)
{
    console.log(evento);
    
    if (evento.keyCode == 109) // -
	{
		camera.position.z = 28;
		camera.position.x = 1;
		camera.position.y = 1;

		h = anastasiaMesh.position.x;
		k = anastasiaMesh.position.z;

		x = camera.position.x;
		z = camera.position.z;

		radio = Math.sqrt(Math.pow(x-h,2)+Math.pow(z-k,2));

		camera.position.x = Math.sin(anguloCamara*0.0174533) * (radio - h);
		camera.position.z = Math.cos(anguloCamara*0.0174533) * (radio - k);
		camera.rotation.y = anguloCamara * 0.0174533;		
	}
	else if (evento.keyCode == 107) // +
	{
		camera.position.x = 0;
		camera.position.z = 8;
		camera.position.y = 9;

		h = anastasiaMesh.position.x;
		k = anastasiaMesh.position.z;

		x = camera.position.x;
		z = camera.position.z;

		radio = Math.sqrt(Math.pow(x-h,2)+Math.pow(z-k,2));

		camera.position.x = Math.sin(anguloCamara*0.0174533) * (radio - h);
		camera.position.z = Math.cos(anguloCamara*0.0174533) * (radio - k);
		camera.rotation.y = anguloCamara * 0.0174533;		
	}
	else if (evento.keyCode == 39)  // "ArrowRight"
	{	
		h = anastasiaMesh.position.x;
		k = anastasiaMesh.position.z;

		x = camera.position.x;
		z = camera.position.z;

		anguloCamara += 3;

		radio = Math.sqrt(Math.pow(x-h,2)+Math.pow(z-k,2));

		camera.position.x = Math.sin(anguloCamara*0.0174533) * (radio - h);
		camera.position.z = Math.cos(anguloCamara*0.0174533) * (radio - k);
		camera.rotation.y = anguloCamara * 0.0174533;
	}
    else if (evento.keyCode == 37)  // "ArrowLeft"
	{
		h = anastasiaMesh.position.x;
		k = anastasiaMesh.position.z;

		x = camera.position.x;
		z = camera.position.z;

		anguloCamara -= 3;

		radio = Math.sqrt(Math.pow(x-h,2)+Math.pow(z-k,2));

		camera.position.x = Math.sin(anguloCamara*0.0174533) * (radio - h);
		camera.position.z = Math.cos(anguloCamara*0.0174533) * (radio - k);
		camera.rotation.y = anguloCamara * 0.0174533;
	}
	else if (evento.keyCode == 98 || evento.keyCode == 50) //"2"
	{
		h = anastasiaMesh.position.x;
		k = anastasiaMesh.position.z;

		x = camera.position.x;
		z = camera.position.z;

		anguloCamara = 0;

		radio = Math.sqrt(Math.pow(x-h,2)+Math.pow(z-k,2));

		camera.position.x = Math.sin(anguloCamara*0.0174533) * (radio - h);
		camera.position.z = Math.cos(anguloCamara*0.0174533) * (radio - k);
		camera.rotation.y = anguloCamara * 0.0174533;
	}
    else if (evento.keyCode == 100 || evento.keyCode == 52) //"4"
	{
		h = anastasiaMesh.position.x;
		k = anastasiaMesh.position.z;

		x = camera.position.x;
		z = camera.position.z;

		anguloCamara = 90;

		radio = Math.sqrt(Math.pow(x-h,2)+Math.pow(z-k,2));

		camera.position.x = Math.sin(anguloCamara*0.0174533) * (radio - h);
		camera.position.z = Math.cos(anguloCamara*0.0174533) * (radio - k);
		camera.rotation.y = anguloCamara * 0.0174533;
	}
    else if (evento.keyCode == 104 || evento.keyCode == 56) //"8"
	{
		h = anastasiaMesh.position.x;
		k = anastasiaMesh.position.z;

		x = camera.position.x;
		z = camera.position.z;

		anguloCamara = 180;

		radio = Math.sqrt(Math.pow(x-h,2)+Math.pow(z-k,2));

		camera.position.x = Math.sin(anguloCamara*0.0174533) * (radio - h);
		camera.position.z = Math.cos(anguloCamara*0.0174533) * (radio - k);
		camera.rotation.y = anguloCamara * 0.0174533;
	}
    else if (evento.keyCode == 102 || evento.keyCode == 54) //"6"
	{
		h = anastasiaMesh.position.x;
		k = anastasiaMesh.position.z;

		x = camera.position.x;
		z = camera.position.z;

		anguloCamara = 270;

		radio = Math.sqrt(Math.pow(x-h,2)+Math.pow(z-k,2));

		camera.position.x = Math.sin(anguloCamara*0.0174533) * (radio - h);
		camera.position.z = Math.cos(anguloCamara*0.0174533) * (radio - k);
		camera.rotation.y = anguloCamara * 0.0174533;
	}	
	else
	{
		console.log(evento);
	}
}

function onWindowResize() 
{
	windowHalfX = window.innerWidth / 2;
	windowHalfY = window.innerHeight / 2;

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	effect.setSize( window.innerWidth, window.innerHeight );
}

function onDocumentMouseMove( event ) 
{
	mouseX = ( event.clientX - windowHalfX ) / 2;
	mouseY = ( event.clientY - windowHalfY ) / 2;
}

function animate() 
{
	requestAnimationFrame( animate );

	stats.begin();
	render();
	stats.end();
}

function render() 
{
	helper.animate( clock.getDelta() );

	if ( physicsHelper !== undefined && physicsHelper.visible ) physicsHelper.update();
	if ( ikHelper !== undefined && ikHelper.visible ) ikHelper.update();
	effect.render( scene, camera );

	if (anastasiaMesh !== undefined && animacionParpadeo)
	{
		clockParpadeo.getDelta();
		tiempoTranscurrido = parseInt(clockParpadeo.elapsedTime * 100);

		if (tiempoTranscurrido >= 150)
		{
			if (!parpadear)
			{
				parpadear = true;
				clockParpadeoActual = new THREE.Clock();
			}
			else
			{
				clockParpadeoActual.getDelta();
				tiempoParpadeoActual = parseInt(clockParpadeoActual.elapsedTime);

				posParpadear = anastasiaMesh.morphTargetDictionary["ParpadeoFeliz"];

				if (ascenderParpado)
				{

					if (anastasiaMesh.morphTargetInfluences[posParpadear] >= 0)
					{
						anastasiaMesh.morphTargetInfluences[posParpadear] -= tiempoParpadeoActual / 5;
					}
					else
					{
						anastasiaMesh.morphTargetInfluences[posParpadear] = 0;
						ascenderParpado = false;
						parpadear = false;
						clockParpadeo = new THREE.Clock();
					}
				}
				else
				{
					if (anastasiaMesh.morphTargetInfluences[posParpadear] <= 1)
					{
						anastasiaMesh.morphTargetInfluences[posParpadear] += tiempoParpadeoActual / 5;
					}
					else
					{
						anastasiaMesh.morphTargetInfluences[posParpadear] = 1;
						ascenderParpado = true;
					}
				}
			}
		}		
	}
}

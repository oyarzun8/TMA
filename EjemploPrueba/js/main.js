import * as THREE from 'three';

import { VRButton } from 'three/addons/webxr/VRButton.js';

import { XRControllerModelFactory } from 'three/addons/webxr/XRControllerModelFactory.js';

let container;
let camera, scene, renderer;
let controller1, controller2;
let controllerGrip1, controllerGrip2;

const intersected = [];
const tempMatrix = new THREE.Matrix4();

let group;

let groupDraggables;

let skinnedMesh, skeleton, bones, skeletonHelper;

let intersectObject;
let pointDown = false;
let raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
let  initialpos = new THREE.Vector2();

init();
animate();

function init() {

    container = document.createElement( 'div' );
    document.body.appendChild( container );

    scene = new THREE.Scene();
    scene.background = new THREE.Color( 0x808080 );

    camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 0.1, 10 );
    camera.position.set( 0, 1.6, 3 );

    const floorGeometry = new THREE.PlaneGeometry( 4, 4 );
    const floorMaterial = new THREE.MeshStandardMaterial( {
            color: 0xeeeeee,
            roughness: 1.0,
            metalness: 0.0
    } );
    const floor = new THREE.Mesh( floorGeometry, floorMaterial );
    floor.rotation.x = - Math.PI / 2;
    floor.receiveShadow = true;
    scene.add( floor );

    scene.add( new THREE.HemisphereLight( 0x808080, 0x606060 ) );

    const light = new THREE.DirectionalLight( 0xffffff );
    light.position.set( 0, 6, 0 );
    light.castShadow = true;
    light.shadow.camera.top = 2;
    light.shadow.camera.bottom = - 2;
    light.shadow.camera.right = 2;
    light.shadow.camera.left = - 2;
    light.shadow.mapSize.set( 4096, 4096 );
    scene.add( light );
    /*
    group = new THREE.Group();
    scene.add( group );

    const geometries = [
            new THREE.BoxGeometry( 0.2, 0.2, 0.2 ),
            new THREE.ConeGeometry( 0.2, 0.2, 64 ),
            new THREE.CylinderGeometry( 0.2, 0.2, 0.2, 64 ),
            new THREE.IcosahedronGeometry( 0.2, 8 ),
            new THREE.TorusGeometry( 0.2, 0.04, 64, 32 )
    ];

    for ( let i = 0; i < 50; i ++ ) {

            const geometry = geometries[ Math.floor( Math.random() * geometries.length ) ];
            const material = new THREE.MeshStandardMaterial( {
                    color: Math.random() * 0xffffff,
                    roughness: 0.7,
                    metalness: 0.0
            } );

            const object = new THREE.Mesh( geometry, material );

            object.position.x = Math.random() * 4 - 2;
            object.position.y = Math.random() * 2;
            object.position.z = Math.random() * 4 - 2;

            object.rotation.x = Math.random() * 2 * Math.PI;
            object.rotation.y = Math.random() * 2 * Math.PI;
            object.rotation.z = Math.random() * 2 * Math.PI;

            object.scale.setScalar( Math.random() + 0.5 );

            object.castShadow = true;
            object.receiveShadow = true;

            group.add( object );

    }*/
    
    
    const aBoxGeometry = new THREE.BoxGeometry( 10, 2, 10 );
      
    initSkinnedMesh();
    
    groupDraggables = new THREE.Group();
    
    for (let i=0;i<bones.length;i++){
        
        let material = new THREE.MeshStandardMaterial( { color: 0x00ff00 } );
        const object = new THREE.Mesh( aBoxGeometry, material );
        object.name = i.toString();
        object.HexNotSelected = material.emissive.getHex();
        object.HexSelected =  0xff0000;
        object.position.set(0, bones[0].position.y+i*5, 0);
        groupDraggables.add(object);
    }
    
    scene.add(groupDraggables);

    //

    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.shadowMap.enabled = true;
    renderer.xr.enabled = true;
    container.appendChild( renderer.domElement );

    document.body.appendChild( VRButton.createButton( renderer ) );

    // controllers

    controller1 = renderer.xr.getController( 0 );
    controller1.addEventListener( 'selectstart', onSelectStart );
    controller1.addEventListener( 'selectend', onSelectEnd );
    scene.add( controller1 );

    controller2 = renderer.xr.getController( 1 );
    controller2.addEventListener( 'selectstart', onSelectStart );
    controller2.addEventListener( 'selectend', onSelectEnd );
    scene.add( controller2 );

    const controllerModelFactory = new XRControllerModelFactory();

    controllerGrip1 = renderer.xr.getControllerGrip( 0 );
    controllerGrip1.add( controllerModelFactory.createControllerModel( controllerGrip1 ) );
    scene.add( controllerGrip1 );

    controllerGrip2 = renderer.xr.getControllerGrip( 1 );
    controllerGrip2.add( controllerModelFactory.createControllerModel( controllerGrip2 ) );
    scene.add( controllerGrip2 );

    //

    const geometry = new THREE.BufferGeometry().setFromPoints( [ new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, 0, - 1 ) ] );

    const line = new THREE.Line( geometry );
    line.name = 'line';
    line.scale.z = 5;

    controller1.add( line.clone() );
    controller2.add( line.clone() );

    raycaster = new THREE.Raycaster();

    //

    window.addEventListener( 'resize', onWindowResize );

}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

}

function onSelectStart( event ) {

//    const controller = event.target;
//
//    const intersections = getIntersections( controller );
//
//    if ( intersections.length > 0 ) {
//
//            const intersection = intersections[ 0 ];
//
//            const object = intersection.object;
//            object.material.emissive.b = 1;
//            controller.attach( object );
//
//            controller.userData.selected = object;
//
//    }
    
    pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    pointer.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    initialpos.x = pointer.x;
    initialpos.y = pointer.y;
    const found = raycaster.intersectObjects(groupDraggables.children, true);
    if (found.length) {
        intersectObject = found[0].object;
        intersectObject.currentIntersected = true;
        intersectObject.material.emissive.setHex(intersectObject.HexSelected);
    }
    pointDown = true;

}

function onSelectEnd( event ) {

    //    const controller = event.target;
//
//    if ( controller.userData.selected !== undefined ) {
//
//            const object = controller.userData.selected;
//            object.material.emissive.b = 0;
//            group.attach( object );
//
//            controller.userData.selected = undefined;
//
//    }

    intersectObject.currentIntersected = false;
    pointDown = false;
    intersectObject.material.emissive.setHex(intersectObject.HexNotSelected);

}

function getIntersections( controller ) {

    tempMatrix.identity().extractRotation( controller.matrixWorld );

    raycaster.ray.origin.setFromMatrixPosition( controller.matrixWorld );
    raycaster.ray.direction.set( 0, 0, - 1 ).applyMatrix4( tempMatrix );

    return raycaster.intersectObjects( group.children, false );

}

function intersectObjects( controller ) {

    // Do not highlight when already selected

    if ( controller.userData.selected !== undefined ) return;

    const line = controller.getObjectByName( 'line' );
    const intersections = getIntersections( controller );

    if ( intersections.length > 0 ) {

            const intersection = intersections[ 0 ];

            const object = intersection.object;
            object.material.emissive.r = 1;
            intersected.push( object );

            line.scale.z = intersection.distance;

    } else {

            line.scale.z = 5;

    }

}

function cleanIntersected() {

    while ( intersected.length ) {

            const object = intersected.pop();
            object.material.emissive.r = 0;

    }

}

//

function initSkinnedMesh() {

    const segmentHeight = 5;
    const segmentCount = 5;
    const height = segmentHeight * segmentCount;
    const halfHeight = height * 0.5;

    const sizing = {
            segmentHeight,
            segmentCount,
            height,
            halfHeight
    };

    const geometry = createGeometry( sizing );
    
    const material = new THREE.MeshStandardMaterial( {
            color: 0x156289,
           emissive: 0x072534,
            side: THREE.DoubleSide,
            flatShading: true,
            wireframe: true
    } );


    const bones = createBones( sizing );
    
    skeleton = new THREE.Skeleton( bones );
    
    skinnedMesh = new THREE.SkinnedMesh( geometry, material );

    const rootBone = skeleton.bones[ 0 ];
    
    skinnedMesh.add( rootBone );

    skinnedMesh.bind( skeleton );

    scene.add( skinnedMesh );
}

function createGeometry( sizing ) {

    const geometry = new THREE.CylinderGeometry(
            5, // radiusTop
            5, // radiusBottom
            sizing.height, // height
            4, // radiusSegments
            sizing.segmentCount * 1, // heightSegments
            true // openEnded
    );


    const position = geometry.attributes.position;

    const vertex = new THREE.Vector3();

    const skinIndices = [];
    const skinWeights = [];

    for ( let i = 0; i < position.count; i ++ ) {
            vertex.fromBufferAttribute( position, i );

            const y = ( vertex.y + sizing.halfHeight );

            const skinIndex = Math.floor( y / sizing.segmentHeight );
            const skinWeight = ( y % sizing.segmentHeight ) / sizing.segmentHeight;

            skinIndices.push( skinIndex, skinIndex + 1, 0, 0 );
            skinWeights.push( 1 - skinWeight, skinWeight, 0, 0 );

    }

    geometry.setAttribute( 'skinIndex', new THREE.Uint16BufferAttribute( skinIndices, 4 ) );
    geometry.setAttribute( 'skinWeight', new THREE.Float32BufferAttribute( skinWeights, 4 ) );

    return geometry;

    }

function createBones( sizing ) {

    bones = [];

    let prevBone = new THREE.Bone();
    bones.push( prevBone );
    prevBone.position.y = - sizing.halfHeight;

    for ( let i = 0; i < sizing.segmentCount; i ++ ) {
        const bone = new THREE.Bone();
        bone.position.y = sizing.segmentHeight;
        bones.push( bone );
        prevBone.add( bone );
        prevBone = bone;
    }
    return bones;
}

function animate() {

    renderer.setAnimationLoop( render );

}

function render() {

    cleanIntersected();

    intersectObjects( controller1 );
    intersectObjects( controller2 );

    renderer.render( scene, camera );

}


import * as THREE from "https://cdn.skypack.dev/three@0.132.2";

import {VRButton} from 'three/addons/webxr/VRButton.js';
import {XRControllerModelFactory} from 'three/addons/webxr/XRControllerModelFactory.js';


let camera, scene, renderer;

let groupDraggables;

let skinnedMesh, skeleton, bones, skeletonHelper;

let intersectObject;
let pointDown = false;
let raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
let  initialpos = new THREE.Vector2();

let controller1, controller2;
let controllerGrip1, controllerGrip2;
                        
const tempMatrix = new THREE.Matrix4();                        
                  
init();
animate();

function init() {

    scene = new THREE.Scene();

    let dirLight = new THREE.DirectionalLight ( 0xffffff, 0.5 );
    scene.add( dirLight );
        
    let hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 0.3 );
    scene.add( hemiLight );
    

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
        
    camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 1000 );
    camera.position.z = 60;
   
    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );   
    document.body.appendChild( renderer.domElement );
    
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
    
    const geometry = new THREE.BufferGeometry().setFromPoints( [ new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, 0, - 1 ) ] );

    const line = new THREE.Line( geometry );
    line.name = 'line';
    line.scale.z = 5;

    controller1.add( line.clone() );
    controller2.add( line.clone() );    

    window.addEventListener( 'pointerdown', onPointerDown );
    window.addEventListener( 'pointerup', onPointerUp );
    window.addEventListener('mousemove', onPointerMove);

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

function onPointerDown( event ) {
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

function onPointerUp( event ) {
    intersectObject.currentIntersected = false;
    pointDown = false;
    intersectObject.material.emissive.setHex(intersectObject.HexNotSelected);
}


function onPointerMove( event ) {
        pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1;
        pointer.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
        if(pointDown){
            if(intersectObject!==  undefined && intersectObject.currentIntersected){
              intersectObject.position.x += pointer.x - initialpos.x; 
              intersectObject.position.y += pointer.y - initialpos.y;
              skeleton.bones[parseInt(intersectObject.name)].position.x += pointer.x - initialpos.x;
              skeleton.bones[parseInt(intersectObject.name)].position.y += pointer.y - initialpos.y;
              for(let i = parseInt(intersectObject.name)+1;i<groupDraggables.children.length;i++){
                  groupDraggables.children[i].position.x += pointer.x - initialpos.x;
                  groupDraggables.children[i].position.y += pointer.y - initialpos.y;
              }              
            }  
        }
}

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

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );

}

function animate() {

//    requestAnimationFrame( animate );
//    
//
//    renderer.render( scene, camera );

    renderer.setAnimationLoop( render );
}

function render() {

    cleanIntersected();

    intersectObjects( controller1 );
    intersectObjects( controller2 );

    renderer.render( scene, camera );

}
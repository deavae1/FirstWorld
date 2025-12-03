import {
  Mesh,
  MeshStandardMaterial,
  SphereGeometry,
  PlaneGeometry,
  SessionMode,
  World,
  LocomotionEnvironment,
  EnvironmentType,
  AssetManager,
  AssetType,
} from '@iwsdk/core';

import {
  Interactable,
  PanelUI,
  ScreenSpace,
  OneHandGrabbable,
  MovementMode
} from '@iwsdk/core';

import { PanelSystem } from './panel.js'; // system for displaying "Enter VR" panel on Quest 1
import * as THREE from 'three';

const assets = {
  cartoonTrees: {
    url: '/gltf/cartoon_tree/scene.gltf',
    type: AssetType.GLTF,
    priority: 'critical',
  },
  lowPolyTrees: {
    url: '/gltf/low_poly_trees/scene.gltf',
    type: AssetType.GLTF,
    priority: 'critical',
  },
  cartoonGrass: {
    url: '/gltf/cartoon_grass/scene.gltf',
    type: AssetType.GLTF,
    priority: 'critical',
  },
  PinkTree: {
    url: '/gltf/pink_tree/scene.gltf',
    type: AssetType.GLTF,
    priority: 'critical',
  },
  cartoonClouds: {
    url: '/gltf/clouds_cartoon/scene.gltf',
    type: AssetType.GLTF,
    priority: 'critical',
  },
  bush: {
    url: '/gltf/stylized_bush/scene.gltf',
    type: AssetType.GLTF,
    priority: 'critical',
  },
  sun: {
    url: '/gltf/sunny_2001/scene.gltf',
    type: AssetType.GLTF,
    priority: 'critical',
  },
  colorfulTrees: {
    url: '/gltf/trees_collection/scene.gltf',
    type: AssetType.GLTF,
    priority: 'critical',
  },
  treehouse: {
    url: '/gltf/tree_house/scene.gltf',
    type: AssetType.GLTF,
    priority: 'critical',
  },
  treasure: {
    url: '/gltf/stylized_treasure/scene.gltf',
    type: AssetType.GLTF,
    priority: 'critical',
  },
};


World.create(document.getElementById('scene-container'), {
  assets,
  xr: {
    sessionMode: SessionMode.ImmersiveVR,
    offer: 'always',
    features: { }
  },

  features: {
    locomotion: true,
    grabbing: true,
   },

}).then((world) => {

  const { camera } = world;
  camera.far = 2000;
  camera.updateProjectionMatrix();

  
// TREASURE SECTION (fixed)
const treasureModel = AssetManager.getGLTF('treasure').scene;
treasureModel.scale.set(20, 20, 20);

const treasureCount = 3;
let treasuresCollected = 0;

function checkWin() {
  if (treasuresCollected >= treasureCount) {
    alert('🎉 Congratulations! You collected all the treasures!');
  }
}

// create treasures
for (let i = 0; i < treasureCount; i++) {
  const clone = treasureModel.clone(true);
  const x = (Math.random() - 0.5) * 140;
  const z = (Math.random() - 0.5) * 140;
  clone.position.set(x, 1, z);

  // Create transform entity for each treasure
  const treasureEntity = world.createTransformEntity(clone);
  treasureEntity.addComponent(Interactable);

  // Listen for "click" on each treasure
  clone.addEventListener("pointerdown", () => {
    clone.visible = false; // hide when found
    treasuresCollected += 1;
    checkWin();
  });
}

  //floor
  const textureLoader = new THREE.TextureLoader();
  const forestTexture = textureLoader.load('/texture/grass_seamless_texture_1402.jpg');
  forestTexture.wrapS = THREE.RepeatWrapping;
  forestTexture.wrapT = THREE.RepeatWrapping;
  forestTexture.repeat.set(10, 10);

  const floorGeometry = new PlaneGeometry(150, 150);
  const floorMaterial = new MeshStandardMaterial( { map: forestTexture, color:0x3b5323,roughness: 1, metalness:0.0 } );
  const floor = new Mesh(floorGeometry, floorMaterial);
  floor.rotation.x = -Math.PI / 2;
  const floorEntity = world.createTransformEntity(floor);   
  floorEntity.receiveShadow = true
  floorEntity.addComponent(LocomotionEnvironment, { type: EnvironmentType.STATIC });

  //tree1
  const treesModel = AssetManager.getGLTF('cartoonTrees').scene;
  treesModel.scale.set(20, 20, 20); 
  treesModel.position.set(0, 4, -10); 
  const treeGroup = new THREE.Group();
  // Duplicate the tree multiple times
  const treeCount = 7; // adjust for more/less trees
  for (let i = 0; i < treeCount; i++) {
  const treeClone = treesModel.clone(true); // clone with children/materials
  const x = (Math.random() - 0.5) * 130; // random x spread
  const z = (Math.random() - 0.5) * 130; // random z spread
  const scale = 4 + Math.random() * 3; // small scale variation
  treeClone.scale.set(20, 20, 20);
  treeClone.position.set(x, 14, z);
  treeGroup.add(treeClone);
}
world.createTransformEntity(treeGroup);


//tree2
const lowPolyModel = AssetManager.getGLTF('lowPolyTrees').scene;
lowPolyModel.scale.set(0.03, 0.03, 0.03);
const lowPolyGroup = new THREE.Group();
const lowPolyTreeCount = 5; 
for (let i = 0; i < lowPolyTreeCount; i++) {
  const clone = lowPolyModel.clone(true);
  // random spread across the map
  const x = (Math.random() - 0.5) * 140; // width spread
  const z = (Math.random() - 0.5) * 140; // depth spread
  clone.position.set(x, 0, z);
  clone.rotation.y = Math.random() * Math.PI * 2; // random rotation
  lowPolyGroup.add(clone);
}
world.createTransformEntity(lowPolyGroup);

//tree3collection
const colorfulTreesModel = AssetManager.getGLTF('colorfulTrees').scene;
colorfulTreesModel.scale.set(8, 8, 8);
const colorfulTreeGroup = new THREE.Group();
const colorfulTreeCount = 3; // increase for denser border
const halfSize = 75; // half of floor width (since PlaneGeometry is 150x150)
//placing it on the edge of the map
for (let i = 0; i < colorfulTreeCount; i++) {
  const clone = colorfulTreesModel.clone(true);
  // Decide which edge to place on (top, bottom, left, right)
  const edge = Math.floor(Math.random() * 4);
  let x, z;
  const edgeOffset = 3; // move slightly inward from absolute edge
  const range = halfSize - edgeOffset;
  switch (edge) {
    case 0: // top edge
      x = (Math.random() - 0.5) * (halfSize * 2 - 10);
      z = -range;
      break;
    case 1: // bottom edge
      x = (Math.random() - 0.5) * (halfSize * 2 - 10);
      z = range;
      break;
    case 2: // left edge
      x = -range;
      z = (Math.random() - 0.5) * (halfSize * 2 - 10);
      break;
    case 3: // right edge
      x = range;
      z = (Math.random() - 0.5) * (halfSize * 2 - 10);
      break;
  }
  clone.position.set(x, 0, z);
  clone.rotation.y = Math.random() * Math.PI * 2;
  // random small scale variance
  const scale = 1 + Math.random() * 0.5;
  clone.scale.set(4, 4, 4);
  colorfulTreeGroup.add(clone);
}
world.createTransformEntity(colorfulTreeGroup);


//grass
const grassModel = AssetManager.getGLTF('cartoonGrass').scene;
//visibility issues
grassModel.traverse((child) => {
  if (child.isMesh) {
    child.castShadow = true;
    child.receiveShadow = true;
    child.material.side = THREE.DoubleSide; 
  }
});
grassModel.scale.set(1, 1, 1); 
//cloning grass multiple times
const grassGroup = new THREE.Group();
const grassCount = 350;
for (let i = 0; i < grassCount; i++) {
  const clone = grassModel.clone(true);
  const x = (Math.random() - 0.5) * 140; // stay within floor bounds
  const z = (Math.random() - 0.5) * 140;
  clone.position.set(x, 0.1, z); 
  clone.rotation.y = Math.random() * Math.PI * 2;
//random small variety
  const scale = 0.3 + Math.random() * 0.5; 
  clone.scale.set(scale, scale, scale);
  grassGroup.add(clone);
}
world.createTransformEntity(grassGroup);

//pink tree
const pinkTreeModel = AssetManager.getGLTF('PinkTree').scene;
pinkTreeModel.scale.set(20, 20, 20);
pinkTreeModel.position.set(30, 10, -40);
world.createTransformEntity(pinkTreeModel);
//group of pink trees
const pinkTreeGroup = new THREE.Group();
const pinkTreeCount = 7; // number of extra pink trees
for (let i = 0; i < pinkTreeCount; i++) {
  const clone = pinkTreeModel.clone(true);
  let x = (Math.random() - 0.5) * 100;
  let z = (Math.random() - 0.5) * 100;
  // Avoid clustering too close to existing cartoon trees (inner zone)
  if (Math.abs(x) < 60) x += 20 * Math.sign(x || 1);
  if (Math.abs(z) < 60) z += 20 * Math.sign(z || 1);
  const scale = 8 + Math.random() * 4;
  clone.scale.set(20, 20, 20);
  clone.position.set(x, 10, z);
  clone.rotation.y = Math.random() * Math.PI * 2;
  pinkTreeGroup.add(clone);
}
world.createTransformEntity(pinkTreeGroup);


//clouds
const cloudsModel = AssetManager.getGLTF('cartoonClouds').scene; 
cloudsModel.scale.set(10, 10, 10);
// Group for all clouds
const cloudsGroup = new THREE.Group();
const cloudCount = 3; 
for (let i = 0; i < cloudCount; i++) {
  const clone = cloudsModel.clone(true);
  const x = (Math.random() - 0.5) * 50; // wider horizontal spread
  const z = (Math.random() - 0.5) * 50;
  const y = 60 + Math.random() * 80; // vary height slightly
  const scale = 8 + Math.random() * 5; // some variation in cloud size
  clone.scale.set(scale, scale, scale);
  clone.position.set(x, y, z);
  clone.rotation.y = Math.random() * Math.PI * 2;
  cloudsGroup.add(clone);
}
world.createTransformEntity(cloudsGroup);


//bush
const bushModel = AssetManager.getGLTF('bush').scene;
bushModel.scale.set(3.5, 3.5, 3.5);
//cloning bush multiple times
const bushGroup = new THREE.Group();
const bushCount = 50;
for (let i = 0; i < bushCount; i++) {
  const clone = bushModel.clone(true);
  const x = (Math.random() - 0.5) * 140;
  const z = (Math.random() - 0.5) * 140;
  clone.position.set(x, 0, z);
  clone.rotation.y = Math.random() * Math.PI * 2;
  const scale = 0.3 + Math.random() * 0.7;
  clone.scale.set(3.5, 3.5, 3.5);
  bushGroup.add(clone);
}
world.createTransformEntity(bushGroup);

//sun
const sunModel = AssetManager.getGLTF('sun').scene;
sunModel.rotation.set(0, 0, 0);
sunModel.rotation.x = Math.PI / 2; 
sunModel.scale.set(1, 1, 1);
sunModel.position.set(200, 500, -500);
sunModel.rotation.y = -Math.PI / 8;
sunModel.lookAt(0, 100, 0);
world.createTransformEntity(sunModel);

//treehouse
const treehouseModel = AssetManager.getGLTF('treehouse').scene;
treehouseModel.scale.set(2, 2, 2);
treehouseModel.position.set(-20, 1, -30);
world.createTransformEntity(treehouseModel);









  // vvvvvvvv EVERYTHING BELOW WAS ADDED TO DISPLAY A BUTTON TO ENTER VR FOR QUEST 1 DEVICES vvvvvv
  //          (for some reason IWSDK doesn't show Enter VR button on Quest 1)
  world.registerSystem(PanelSystem);
  
  if (isMetaQuest1()) {
    const panelEntity = world
      .createTransformEntity()
      .addComponent(PanelUI, {
        config: '/ui/welcome.json',
        maxHeight: 0.8,
        maxWidth: 1.6
      })
      .addComponent(Interactable)
      .addComponent(ScreenSpace, {
        top: '20px',
        left: '20px',
        height: '40%'
      });
    panelEntity.object3D.position.set(0, 1.29, -1.9);
  } else {
    // Skip panel on non-Meta-Quest-1 devices
    // Useful for debugging on desktop or newer headsets.
    console.log('Panel UI skipped: not running on Meta Quest 1 (heuristic).');
  }
  function isMetaQuest1() {
    try {
      const ua = (navigator && (navigator.userAgent || '')) || '';
      const hasOculus = /Oculus|Quest|Meta Quest/i.test(ua);
      const isQuest2or3 = /Quest\s?2|Quest\s?3|Quest2|Quest3|MetaQuest2|Meta Quest 2/i.test(ua);
      return hasOculus && !isQuest2or3;
    } catch (e) {
      return false;
    }
  }
});

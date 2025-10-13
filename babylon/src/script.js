const canvas = document.getElementById("renderCanvas");
const engine = new BABYLON.Engine(canvas, true);

const createScene = function () {
    const scene = new BABYLON.Scene(engine);
    scene.clearColor = new BABYLON.Color3(0.53, 0.81, 0.92);

    // Cámara con mejor posición
    const camera = new BABYLON.ArcRotateCamera("camera", -Math.PI / 2, Math.PI / 2.8, 20, new BABYLON.Vector3(0, 3, 0), scene);
    camera.attachControl(canvas, true);
    camera.lowerRadiusLimit = 8;
    camera.upperRadiusLimit = 40;

    // Habilitar sombras y antialiasing
    const shadowGenerator = new BABYLON.ShadowGenerator(1024, new BABYLON.DirectionalLight("dirLight", new BABYLON.Vector3(-1, -2, -1), scene));
    shadowGenerator.useBlurExponentialShadowMap = true;
    shadowGenerator.blurKernel = 32;

    // Iluminación natural del sol
    const sunLight = new BABYLON.DirectionalLight("sunLight", new BABYLON.Vector3(-0.5, -1, -0.8), scene);
    sunLight.position = new BABYLON.Vector3(20, 40, 20);
    sunLight.intensity = 1.2;
    sunLight.diffuse = new BABYLON.Color3(1, 0.95, 0.8);
    
    // Luz ambiental suave
    const hemiLight = new BABYLON.HemisphericLight("hemiLight", new BABYLON.Vector3(0, 1, 0), scene);
    hemiLight.intensity = 0.4;
    hemiLight.groundColor = new BABYLON.Color3(0.3, 0.3, 0.4);

    // Suelo con textura de césped realista
    const ground = BABYLON.MeshBuilder.CreateGroundFromHeightMap("ground",
        "https://www.babylonjs-playground.com/textures/heightMap.png",
        {width: 100, height: 100, subdivisions: 50, minHeight: 0, maxHeight: 5}, scene);
    
    const groundMat = new BABYLON.StandardMaterial("groundMat", scene);
    groundMat.diffuseTexture = new BABYLON.Texture("https://www.babylonjs-playground.com/textures/grass.jpg", scene);
    groundMat.diffuseTexture.uScale = 20;
    groundMat.diffuseTexture.vScale = 20;
    groundMat.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);
    ground.material = groundMat;
    ground.receiveShadows = true;

    // Cielo con textura realista
    const skybox = BABYLON.MeshBuilder.CreateBox("skyBox", {size: 500}, scene);
    const skyboxMaterial = new BABYLON.StandardMaterial("skyBox", scene);
    skyboxMaterial.backFaceCulling = false;
    skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture("https://playground.babylonjs.com/textures/skybox", scene);
    skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
    skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
    skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
    skybox.material = skyboxMaterial;

    // Casa simple pero realista
    const createHouse = (x, z) => {
        // Paredes
        const walls = BABYLON.MeshBuilder.CreateBox("walls", {width: 8, height: 4, depth: 6}, scene);
        walls.position = new BABYLON.Vector3(x, 2, z);
        
        const wallMat = new BABYLON.StandardMaterial("wallMat", scene);
        wallMat.diffuseTexture = new BABYLON.Texture("https://www.babylonjs-playground.com/textures/floor.png", scene);
        wallMat.diffuseColor = new BABYLON.Color3(0.9, 0.85, 0.75);
        walls.material = wallMat;
        shadowGenerator.addShadowCaster(walls);

        // Techo
        const roof = BABYLON.MeshBuilder.CreateCylinder("roof", {
            height: 6,
            diameterTop: 0,
            diameterBottom: 10,
            tessellation: 4
        }, scene);
        roof.rotation.y = Math.PI / 4;
        roof.position = new BABYLON.Vector3(x, 5.5, z);
        
        const roofMat = new BABYLON.StandardMaterial("roofMat", scene);
        roofMat.diffuseColor = new BABYLON.Color3(0.6, 0.2, 0.1);
        roofMat.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);
        roof.material = roofMat;
        shadowGenerator.addShadowCaster(roof);

        // Puerta
        const door = BABYLON.MeshBuilder.CreateBox("door", {width: 1.5, height: 2.5, depth: 0.2}, scene);
        door.position = new BABYLON.Vector3(x, 1.25, z + 3);
        const doorMat = new BABYLON.StandardMaterial("doorMat", scene);
        doorMat.diffuseColor = new BABYLON.Color3(0.4, 0.25, 0.15);
        door.material = doorMat;

        // Ventanas
        for(let i = 0; i < 2; i++) {
            const window = BABYLON.MeshBuilder.CreateBox("window", {width: 1, height: 1, depth: 0.1}, scene);
            window.position = new BABYLON.Vector3(x + (i * 3 - 1.5), 2.5, z + 2.95);
            const windowMat = new BABYLON.StandardMaterial("windowMat", scene);
            windowMat.diffuseColor = new BABYLON.Color3(0.6, 0.8, 0.9);
            windowMat.emissiveColor = new BABYLON.Color3(0.2, 0.3, 0.4);
            windowMat.alpha = 0.6;
            window.material = windowMat;
        }
    };

    createHouse(0, -15);

    // Árboles más realistas
    const createTree = (x, z, scale = 1) => {
        // Tronco
        const trunk = BABYLON.MeshBuilder.CreateCylinder("trunk", {
            height: 5 * scale,
            diameterTop: 0.4 * scale,
            diameterBottom: 0.7 * scale
        }, scene);
        trunk.position = new BABYLON.Vector3(x, 2.5 * scale, z);
        
        const trunkMat = new BABYLON.StandardMaterial("trunkMat", scene);
        trunkMat.diffuseTexture = new BABYLON.Texture("https://www.babylonjs-playground.com/textures/wood.jpg", scene);
        trunkMat.diffuseColor = new BABYLON.Color3(0.4, 0.25, 0.15);
        trunkMat.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);
        trunk.material = trunkMat;
        shadowGenerator.addShadowCaster(trunk);

        // Copa - múltiples esferas para realismo
        for(let i = 0; i < 4; i++) {
            const foliage = BABYLON.MeshBuilder.CreateSphere("foliage", {diameter: 3 * scale}, scene);
            const angle = (i / 4) * Math.PI * 2;
            foliage.position = new BABYLON.Vector3(
                x + Math.cos(angle) * 0.8 * scale,
                5 * scale + Math.sin(i) * 0.5,
                z + Math.sin(angle) * 0.8 * scale
            );
            
            const foliageMat = new BABYLON.StandardMaterial("foliageMat" + i, scene);
            foliageMat.diffuseColor = new BABYLON.Color3(0.15 + Math.random() * 0.1, 0.4 + Math.random() * 0.1, 0.1);
            foliageMat.specularColor = new BABYLON.Color3(0.2, 0.2, 0.2);
            foliage.material = foliageMat;
            shadowGenerator.addShadowCaster(foliage);
        }
    };

    // Bosque
    createTree(-15, -8, 1.2);
    createTree(-10, -5, 1.0);
    createTree(-18, -12, 0.9);
    createTree(12, -10, 1.1);
    createTree(15, -6, 0.95);
    createTree(18, -15, 1.15);
    createTree(-8, 5, 0.85);
    createTree(10, 8, 1.05);

    // Camino de piedra
    for(let i = 0; i < 15; i++) {
        const stone = BABYLON.MeshBuilder.CreateCylinder("stone", {
            height: 0.2,
            diameter: 0.8 + Math.random() * 0.4
        }, scene);
        stone.position = new BABYLON.Vector3(i - 7, 0.1, -8 + i * 0.5);
        stone.rotation.y = Math.random() * Math.PI;
        
        const stoneMat = new BABYLON.StandardMaterial("stoneMat", scene);
        stoneMat.diffuseColor = new BABYLON.Color3(0.5 + Math.random() * 0.2, 0.5 + Math.random() * 0.2, 0.5 + Math.random() * 0.2);
        stoneMat.specularColor = new BABYLON.Color3(0.3, 0.3, 0.3);
        stone.material = stoneMat;
    }

    // Rocas decorativas
    for(let i = 0; i < 8; i++) {
        const rock = BABYLON.MeshBuilder.CreateSphere("rock", {diameter: 1 + Math.random() * 1.5}, scene);
        rock.position = new BABYLON.Vector3(
            (Math.random() - 0.5) * 40,
            0.5,
            (Math.random() - 0.5) * 40
        );
        rock.scaling = new BABYLON.Vector3(
            1 + Math.random() * 0.5,
            0.5 + Math.random() * 0.3,
            1 + Math.random() * 0.5
        );
        
        const rockMat = new BABYLON.StandardMaterial("rockMat" + i, scene);
        rockMat.diffuseColor = new BABYLON.Color3(0.4, 0.35, 0.3);
        rockMat.specularColor = new BABYLON.Color3(0.2, 0.2, 0.2);
        rock.material = rockMat;
        shadowGenerator.addShadowCaster(rock);
    }

    // Flores
    for(let i = 0; i < 20; i++) {
        const flower = BABYLON.MeshBuilder.CreateSphere("flower", {diameter: 0.3}, scene);
        flower.position = new BABYLON.Vector3(
            (Math.random() - 0.5) * 30,
            0.15,
            (Math.random() - 0.5) * 30
        );
        const flowerMat = new BABYLON.StandardMaterial("flowerMat" + i, scene);
        const colors = [
            new BABYLON.Color3(1, 0.2, 0.3),
            new BABYLON.Color3(1, 0.8, 0.2),
            new BABYLON.Color3(0.8, 0.2, 1),
            new BABYLON.Color3(1, 0.5, 0.8)
        ];
        flowerMat.diffuseColor = colors[Math.floor(Math.random() * colors.length)];
        flowerMat.emissiveColor = flowerMat.diffuseColor.scale(0.3);
        flower.material = flowerMat;
    }

    // Nubes volumétricas
    for(let i = 0; i < 8; i++) {
        const cloud = BABYLON.MeshBuilder.CreateSphere("cloud", {diameter: 6}, scene);
        cloud.position = new BABYLON.Vector3(
            (Math.random() - 0.5) * 80,
            25 + Math.random() * 10,
            -30 + Math.random() * 20
        );
        cloud.scaling = new BABYLON.Vector3(2 + Math.random(), 0.6, 1.5 + Math.random() * 0.5);
        
        const cloudMat = new BABYLON.StandardMaterial("cloudMat" + i, scene);
        cloudMat.diffuseColor = new BABYLON.Color3(1, 1, 1);
        cloudMat.alpha = 0.7 + Math.random() * 0.2;
        cloudMat.disableLighting = true;
        cloud.material = cloudMat;
    }

    return scene;
};

const scene = createScene();
engine.runRenderLoop(() => {
    scene.render();
});
window.addEventListener("resize", () => {
    engine.resize();
});
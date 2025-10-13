const canvas = document.getElementById("renderCanvas");
const engine = new BABYLON.Engine(canvas, true);

const createScene = function () {
    const scene = new BABYLON.Scene(engine);
    scene.clearColor = new BABYLON.Color3(0.9, 0.9, 0.95);

    // Cámara
    const camera = new BABYLON.ArcRotateCamera("camera", -Math.PI / 2, Math.PI / 2.5, 15, new BABYLON.Vector3(0, 2, 0), scene);
    camera.attachControl(canvas, true);
    camera.lowerRadiusLimit = 5;
    camera.upperRadiusLimit = 25;

    // Iluminación realista
    const mainLight = new BABYLON.HemisphericLight("mainLight", new BABYLON.Vector3(0, 1, 0), scene);
    mainLight.intensity = 0.7;
    mainLight.diffuse = new BABYLON.Color3(1, 0.98, 0.95);

    const spotLight = new BABYLON.PointLight("spotLight", new BABYLON.Vector3(0, 4, 0), scene);
    spotLight.intensity = 0.6;
    spotLight.diffuse = new BABYLON.Color3(1, 0.9, 0.8);

    // Suelo de madera
    const floor = BABYLON.MeshBuilder.CreateGround("floor", {width: 20, height: 20}, scene);
    const floorMat = new BABYLON.StandardMaterial("floorMat", scene);
    floorMat.diffuseColor = new BABYLON.Color3(0.4, 0.25, 0.15);
    floorMat.specularColor = new BABYLON.Color3(0.2, 0.2, 0.2);
    floor.material = floorMat;

    // Paredes
    const wallHeight = 5;
    
    // Pared trasera
    const backWall = BABYLON.MeshBuilder.CreateBox("backWall", {width: 20, height: wallHeight, depth: 0.2}, scene);
    backWall.position = new BABYLON.Vector3(0, wallHeight/2, -10);
    const wallMat = new BABYLON.StandardMaterial("wallMat", scene);
    wallMat.diffuseColor = new BABYLON.Color3(0.95, 0.95, 0.92);
    wallMat.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);
    backWall.material = wallMat;

    // Pared izquierda
    const leftWall = BABYLON.MeshBuilder.CreateBox("leftWall", {width: 0.2, height: wallHeight, depth: 20}, scene);
    leftWall.position = new BABYLON.Vector3(-10, wallHeight/2, 0);
    leftWall.material = wallMat;

    // Sofá
    const createSofa = () => {
        // Base del sofá
        const sofaBase = BABYLON.MeshBuilder.CreateBox("sofaBase", {width: 4, height: 0.8, depth: 1.5}, scene);
        sofaBase.position = new BABYLON.Vector3(-3, 0.4, -7);
        
        const sofaMat = new BABYLON.StandardMaterial("sofaMat", scene);
        sofaMat.diffuseColor = new BABYLON.Color3(0.3, 0.35, 0.45);
        sofaMat.specularColor = new BABYLON.Color3(0.2, 0.2, 0.2);
        sofaBase.material = sofaMat;

        // Respaldo
        const sofaBack = BABYLON.MeshBuilder.CreateBox("sofaBack", {width: 4, height: 1.2, depth: 0.3}, scene);
        sofaBack.position = new BABYLON.Vector3(-3, 1.4, -7.6);
        sofaBack.material = sofaMat;

        // Brazos
        const armLeft = BABYLON.MeshBuilder.CreateBox("armLeft", {width: 0.3, height: 1, depth: 1.5}, scene);
        armLeft.position = new BABYLON.Vector3(-5.15, 0.9, -7);
        armLeft.material = sofaMat;

        const armRight = BABYLON.MeshBuilder.CreateBox("armRight", {width: 0.3, height: 1, depth: 1.5}, scene);
        armRight.position = new BABYLON.Vector3(-0.85, 0.9, -7);
        armRight.material = sofaMat;

        // Cojines
        for(let i = 0; i < 3; i++) {
            const cushion = BABYLON.MeshBuilder.CreateBox("cushion", {width: 0.8, height: 0.3, depth: 0.6}, scene);
            cushion.position = new BABYLON.Vector3(-4.5 + i * 1.5, 1.0, -7);
            const cushionMat = new BABYLON.StandardMaterial("cushionMat", scene);
            cushionMat.diffuseColor = new BABYLON.Color3(0.7, 0.6, 0.5);
            cushion.material = cushionMat;
        }
    };
    createSofa();

    // Mesa de centro
    const coffeeTable = BABYLON.MeshBuilder.CreateBox("coffeeTable", {width: 2.5, height: 0.1, depth: 1.2}, scene);
    coffeeTable.position = new BABYLON.Vector3(-2, 0.5, -4);
    const tableMat = new BABYLON.StandardMaterial("tableMat", scene);
    tableMat.diffuseColor = new BABYLON.Color3(0.3, 0.2, 0.15);
    tableMat.specularColor = new BABYLON.Color3(0.4, 0.4, 0.4);
    coffeeTable.material = tableMat;

    // Patas de la mesa
    const legPositions = [
        [-3.1, 0.25, -4.5],
        [-0.9, 0.25, -4.5],
        [-3.1, 0.25, -3.5],
        [-0.9, 0.25, -3.5]
    ];
    
    legPositions.forEach((pos, i) => {
        const leg = BABYLON.MeshBuilder.CreateCylinder(`leg${i}`, {height: 0.5, diameter: 0.1}, scene);
        leg.position = new BABYLON.Vector3(pos[0], pos[1], pos[2]);
        leg.material = tableMat;
    });

    // Estantería
    const shelf = BABYLON.MeshBuilder.CreateBox("shelf", {width: 3, height: 4, depth: 0.4}, scene);
    shelf.position = new BABYLON.Vector3(5, 2, -9.7);
    const shelfMat = new BABYLON.StandardMaterial("shelfMat", scene);
    shelfMat.diffuseColor = new BABYLON.Color3(0.35, 0.25, 0.2);
    shelfMat.specularColor = new BABYLON.Color3(0.2, 0.2, 0.2);
    shelf.material = shelfMat;

    // Libros en la estantería
    const bookColors = [
        new BABYLON.Color3(0.8, 0.2, 0.2),
        new BABYLON.Color3(0.2, 0.4, 0.7),
        new BABYLON.Color3(0.3, 0.6, 0.3),
        new BABYLON.Color3(0.6, 0.4, 0.2),
        new BABYLON.Color3(0.5, 0.2, 0.5)
    ];

    for(let shelf_level = 0; shelf_level < 3; shelf_level++) {
        for(let i = 0; i < 5; i++) {
            const book = BABYLON.MeshBuilder.CreateBox(`book${shelf_level}${i}`, {
                width: 0.15, 
                height: 0.8, 
                depth: 0.3
            }, scene);
            book.position = new BABYLON.Vector3(
                4 + i * 0.4 - 0.8,
                1.2 + shelf_level * 1.2,
                -9.5
            );
            const bookMat = new BABYLON.StandardMaterial(`bookMat${shelf_level}${i}`, scene);
            bookMat.diffuseColor = bookColors[i % bookColors.length];
            book.material = bookMat;
        }
    }

    // Lámpara de pie
    const lampPole = BABYLON.MeshBuilder.CreateCylinder("lampPole", {height: 3, diameter: 0.1}, scene);
    lampPole.position = new BABYLON.Vector3(3, 1.5, -2);
    const metalMat = new BABYLON.StandardMaterial("metalMat", scene);
    metalMat.diffuseColor = new BABYLON.Color3(0.3, 0.3, 0.3);
    metalMat.specularColor = new BABYLON.Color3(0.8, 0.8, 0.8);
    lampPole.material = metalMat;

    const lampShade = BABYLON.MeshBuilder.CreateCylinder("lampShade", {
        height: 0.8, 
        diameterTop: 0.8, 
        diameterBottom: 1.2
    }, scene);
    lampShade.position = new BABYLON.Vector3(3, 3.4, -2);
    const lampMat = new BABYLON.StandardMaterial("lampMat", scene);
    lampMat.diffuseColor = new BABYLON.Color3(0.95, 0.9, 0.8);
    lampMat.emissiveColor = new BABYLON.Color3(0.2, 0.18, 0.15);
    lampShade.material = lampMat;

    // Base de la lámpara
    const lampBase = BABYLON.MeshBuilder.CreateCylinder("lampBase", {height: 0.1, diameter: 0.8}, scene);
    lampBase.position = new BABYLON.Vector3(3, 0.05, -2);
    lampBase.material = metalMat;

    // Alfombra
    const rug = BABYLON.MeshBuilder.CreateGround("rug", {width: 4, height: 3}, scene);
    rug.position = new BABYLON.Vector3(-2.5, 0.02, -5);
    const rugMat = new BABYLON.StandardMaterial("rugMat", scene);
    rugMat.diffuseColor = new BABYLON.Color3(0.6, 0.3, 0.3);
    rugMat.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);
    rug.material = rugMat;

    // Cuadro en la pared
    const frame = BABYLON.MeshBuilder.CreateBox("frame", {width: 2, height: 1.5, depth: 0.05}, scene);
    frame.position = new BABYLON.Vector3(-5, 3, -9.9);
    const frameMat = new BABYLON.StandardMaterial("frameMat", scene);
    frameMat.diffuseColor = new BABYLON.Color3(0.8, 0.7, 0.3);
    frame.material = frameMat;

    const painting = BABYLON.MeshBuilder.CreateBox("painting", {width: 1.8, height: 1.3, depth: 0.02}, scene);
    painting.position = new BABYLON.Vector3(-5, 3, -9.88);
    const paintingMat = new BABYLON.StandardMaterial("paintingMat", scene);
    paintingMat.diffuseColor = new BABYLON.Color3(0.4, 0.5, 0.7);
    paintingMat.emissiveColor = new BABYLON.Color3(0.1, 0.15, 0.2);
    painting.material = paintingMat;

    // Planta decorativa
    const pot = BABYLON.MeshBuilder.CreateCylinder("pot", {
        height: 0.6, 
        diameterTop: 0.5, 
        diameterBottom: 0.4
    }, scene);
    pot.position = new BABYLON.Vector3(-8, 0.3, -3);
    const potMat = new BABYLON.StandardMaterial("potMat", scene);
    potMat.diffuseColor = new BABYLON.Color3(0.6, 0.3, 0.2);
    pot.material = potMat;

    const plant = BABYLON.MeshBuilder.CreateSphere("plant", {diameter: 1}, scene);
    plant.position = new BABYLON.Vector3(-8, 1.1, -3);
    plant.scaling.y = 1.2;
    const plantMat = new BABYLON.StandardMaterial("plantMat", scene);
    plantMat.diffuseColor = new BABYLON.Color3(0.2, 0.5, 0.2);
    plant.material = plantMat;

    // Ventana con luz
    const window = BABYLON.MeshBuilder.CreateBox("window", {width: 3, height: 2.5, depth: 0.1}, scene);
    window.position = new BABYLON.Vector3(0, 3, -9.95);
    const windowMat = new BABYLON.StandardMaterial("windowMat", scene);
    windowMat.diffuseColor = new BABYLON.Color3(0.7, 0.85, 1);
    windowMat.emissiveColor = new BABYLON.Color3(0.3, 0.4, 0.5);
    windowMat.alpha = 0.7;
    window.material = windowMat;

    return scene;
};

const scene = createScene();
engine.runRenderLoop(() => {
    scene.render();
});
window.addEventListener("resize", () => {
    engine.resize();
});
    const skyMaterial = new BABYLON.StandardMaterial("skyMat", scene);
    skyMaterial.diffuseColor = new BABYLON.Color3(0.6, 0.8, 1);
    skyMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
    skyMaterial.disableLighting = true;
    skybox.material = skyMaterial;

    // Montañas con formas más naturales usando cilindros escalados
    const createMountain = (x, z, width, height) => {
        const mountain = BABYLON.MeshBuilder.CreateCylinder("mountain", {
            height: height, 
            diameterTop: width * 0.3, 
            diameterBottom: width
        }, scene);
        mountain.position = new BABYLON.Vector3(x, height/2, z);
        
        const mountainMat = new BABYLON.StandardMaterial("mountainMat", scene);
        mountainMat.diffuseColor = new BABYLON.Color3(0.4, 0.35, 0.3);
        mountainMat.specularColor = new BABYLON.Color3(0.2, 0.2, 0.2);
        mountain.material = mountainMat;
        return mountain;
    };

    createMountain(-25, -20, 12, 15);
    createMountain(-18, -25, 8, 12);
    createMountain(20, -18, 10, 13);

    // Lago con orillas más naturales
    const lake = BABYLON.MeshBuilder.CreateDisc("lake", {radius: 6, tessellation: 16}, scene);
    lake.position = new BABYLON.Vector3(8, 0.1, 12);
    lake.rotation.x = Math.PI / 2;
    
    const waterMat = new BABYLON.StandardMaterial("waterMat", scene);
    waterMat.diffuseColor = new BABYLON.Color3(0.1, 0.3, 0.6);
    waterMat.specularColor = new BABYLON.Color3(0.9, 0.9, 0.9);
    waterMat.specularPower = 128;
    waterMat.alpha = 0.9;
    lake.material = waterMat;

    // Función para crear árboles más realistas
    const createRealisticTree = (x, z, scale = 1) => {
        // Tronco con forma cónica
        const trunk = BABYLON.MeshBuilder.CreateCylinder("trunk", {
            height: 4 * scale, 
            diameterTop: 0.3 * scale, 
            diameterBottom: 0.6 * scale
        }, scene);
        trunk.position = new BABYLON.Vector3(x, 2 * scale, z);
        
        const trunkMat = new BABYLON.StandardMaterial("trunkMat", scene);
        trunkMat.diffuseColor = new BABYLON.Color3(0.35, 0.2, 0.1);
        trunkMat.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);
        trunk.material = trunkMat;

        // Copa del árbol con múltiples esferas para más realismo
        const foliage1 = BABYLON.MeshBuilder.CreateSphere("foliage1", {diameter: 3 * scale}, scene);
        foliage1.position = new BABYLON.Vector3(x, 4.5 * scale, z);
        
        const foliage2 = BABYLON.MeshBuilder.CreateSphere("foliage2", {diameter: 2.2 * scale}, scene);
        foliage2.position = new BABYLON.Vector3(x + 0.5 * scale, 3.8 * scale, z + 0.3 * scale);
        
        const foliage3 = BABYLON.MeshBuilder.CreateSphere("foliage3", {diameter: 1.8 * scale}, scene);
        foliage3.position = new BABYLON.Vector3(x - 0.4 * scale, 4.2 * scale, z - 0.2 * scale);

        const foliageMat = new BABYLON.StandardMaterial("foliageMat", scene);
        foliageMat.diffuseColor = new BABYLON.Color3(0.2, 0.4, 0.15);
        foliageMat.specularColor = new BABYLON.Color3(0.1, 0.2, 0.1);
        
        foliage1.material = foliageMat;
        foliage2.material = foliageMat;
        foliage3.material = foliageMat;
    };

    // Bosque pequeño
    createRealisticTree(-12, -8, 1.2);
    createRealisticTree(-8, -6, 1.0);
    createRealisticTree(-15, -5, 0.9);
    createRealisticTree(-10, -12, 1.1);
    createRealisticTree(15, -8, 1.0);
    createRealisticTree(18, -5, 0.8);

    // Rocas más naturales con formas irregulares
    const createRock = (x, z, size) => {
        const rock = BABYLON.MeshBuilder.CreateSphere("rock", {diameter: size}, scene);
        rock.position = new BABYLON.Vector3(x, size/2 * 0.6, z);
        rock.scaling = new BABYLON.Vector3(
            1 + (Math.random() - 0.5) * 0.3,
            0.6 + (Math.random() - 0.5) * 0.2,
            1 + (Math.random() - 0.5) * 0.3
        );
        
        const rockMat = new BABYLON.StandardMaterial("rockMat", scene);
        rockMat.diffuseColor = new BABYLON.Color3(0.45, 0.4, 0.35);
        rockMat.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);
        rock.material = rockMat;
    };

    createRock(-5, 3, 1.5);
    createRock(12, -2, 1.2);
    createRock(-2, 8, 0.8);
    createRock(6, 5, 1.0);

    // Arbustos pequeños distribuidos naturalmente
    for(let i = 0; i < 12; i++) {
        const bush = BABYLON.MeshBuilder.CreateSphere("bush", {diameter: 0.8}, scene);
        bush.position = new BABYLON.Vector3(
            (Math.random() - 0.5) * 35,
            0.3,
            (Math.random() - 0.5) * 35
        );
        bush.scaling.y = 0.6;
        
        const bushMat = new BABYLON.StandardMaterial("bushMat", scene);
        bushMat.diffuseColor = new BABYLON.Color3(0.25, 0.4, 0.2);
        bush.material = bushMat;
    }

    // Nubes simples
    const createCloud = (x, y, z) => {
        const cloud = BABYLON.MeshBuilder.CreateSphere("cloud", {diameter: 4}, scene);
        cloud.position = new BABYLON.Vector3(x, y, z);
        cloud.scaling = new BABYLON.Vector3(2, 0.8, 1.5);
        
        const cloudMat = new BABYLON.StandardMaterial("cloudMat", scene);
        cloudMat.diffuseColor = new BABYLON.Color3(0.9, 0.9, 0.9);
        cloudMat.alpha = 0.8;
        cloudMat.disableLighting = true;
        cloud.material = cloudMat;
    };

    createCloud(-20, 25, -10);
    createCloud(15, 22, -15);
    createCloud(0, 28, -20);

    return scene;
};

const scene = createScene();
engine.runRenderLoop(() => {
    scene.render();
});
window.addEventListener("resize", () => {
    engine.resize();
});
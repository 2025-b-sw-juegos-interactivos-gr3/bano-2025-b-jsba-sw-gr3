const canvas = document.getElementById("renderCanvas");
const engine = new BABYLON.Engine(canvas, true);

const createScene = function () {
    const scene = new BABYLON.Scene(engine);
    scene.clearColor = new BABYLON.Color3(0.53, 0.81, 0.92);

    // Cámara que sigue al personaje
    const camera = new BABYLON.FollowCamera("FollowCam", new BABYLON.Vector3(0, 5, -15), scene);
    camera.radius = 10; // Distancia al personaje
    camera.heightOffset = 4; // Altura sobre el personaje
    camera.rotationOffset = 0; // Rotación (0 para estar detrás)
    camera.cameraAcceleration = 0.01;
    camera.maxCameraSpeed = 10;
    camera.attachControl(canvas, true);

    // Iluminación básica
    const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = 0.7;

    const directionalLight = new BABYLON.DirectionalLight("dirLight", new BABYLON.Vector3(0, -1, -1), scene);
    directionalLight.position = new BABYLON.Vector3(0, 50, 50);

    // Suelo con textura de césped
    const ground = BABYLON.MeshBuilder.CreateGround("ground", {width: 100, height: 100}, scene);
    const groundMat = new BABYLON.StandardMaterial("groundMat", scene);
    groundMat.diffuseTexture = new BABYLON.Texture("https://www.babylonjs-playground.com/textures/grass.jpg", scene);
    groundMat.diffuseTexture.uScale = 20;
    groundMat.diffuseTexture.vScale = 20;
    groundMat.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);
    ground.material = groundMat;
    ground.receiveShadows = true;

    // Generador de sombras
    const shadowGenerator = new BABYLON.ShadowGenerator(1024, directionalLight);
    shadowGenerator.useBlurExponentialShadowMap = true;
    shadowGenerator.blurKernel = 32;

    // Función para crear árboles
    const createTree = (x, z, scale = 1) => {
        // Tronco
        const trunk = BABYLON.MeshBuilder.CreateCylinder("trunk", {
            height: 5 * scale,
            diameterTop: 0.4 * scale,
            diameterBottom: 0.7 * scale
        }, scene);
        trunk.position = new BABYLON.Vector3(x, 2.5 * scale, z);
        
        const trunkMat = new BABYLON.StandardMaterial("trunkMat", scene);
        trunkMat.diffuseColor = new BABYLON.Color3(0.4, 0.25, 0.15);
        trunk.material = trunkMat;
        shadowGenerator.addShadowCaster(trunk);

        // Copa del árbol
        const foliage = BABYLON.MeshBuilder.CreateSphere("foliage", {diameter: 4 * scale}, scene);
        foliage.position = new BABYLON.Vector3(x, 5.5 * scale, z);
        
        const foliageMat = new BABYLON.StandardMaterial("foliageMat", scene);
        foliageMat.diffuseColor = new BABYLON.Color3(0.2, 0.5, 0.2);
        foliage.material = foliageMat;
        shadowGenerator.addShadowCaster(foliage);
    };

    // Crear bosque de árboles
    createTree(-15, -10, 1.2);
    createTree(-12, -5, 1.0);
    createTree(-18, -15, 0.9);
    createTree(15, -8, 1.1);
    createTree(18, -12, 0.95);
    createTree(20, -18, 1.15);
    createTree(-10, 8, 0.85);
    createTree(12, 10, 1.05);
    createTree(-20, 5, 1.0);
    createTree(8, -20, 0.9);

    // Rocas decorativas
    for(let i = 0; i < 12; i++) {
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
        rock.material = rockMat;
        shadowGenerator.addShadowCaster(rock);
    }

    // Camino de piedras
    for(let i = 0; i < 20; i++) {
        const stone = BABYLON.MeshBuilder.CreateCylinder("stone", {
            height: 0.15,
            diameter: 1 + Math.random() * 0.3
        }, scene);
        stone.position = new BABYLON.Vector3(i - 10, 0.08, i * 0.8 - 8);
        stone.rotation.y = Math.random() * Math.PI;
        
        const stoneMat = new BABYLON.StandardMaterial("stoneMat" + i, scene);
        stoneMat.diffuseColor = new BABYLON.Color3(0.6, 0.6, 0.6);
        stone.material = stoneMat;
    }

    // Flores decorativas
    for(let i = 0; i < 25; i++) {
        const flower = BABYLON.MeshBuilder.CreateSphere("flower", {diameter: 0.3}, scene);
        flower.position = new BABYLON.Vector3(
            (Math.random() - 0.5) * 35,
            0.15,
            (Math.random() - 0.5) * 35
        );
        const flowerMat = new BABYLON.StandardMaterial("flowerMat" + i, scene);
        const colors = [
            new BABYLON.Color3(1, 0.2, 0.3),
            new BABYLON.Color3(1, 0.8, 0.2),
            new BABYLON.Color3(0.8, 0.2, 1),
            new BABYLON.Color3(1, 0.5, 0.8)
        ];
        flowerMat.diffuseColor = colors[Math.floor(Math.random() * colors.length)];
        flowerMat.emissiveColor = flowerMat.diffuseColor.scale(0.2);
        flower.material = flowerMat;
    }

    // Cargar modelo .glb
    BABYLON.SceneLoader.Append("https://assets.babylonjs.com/meshes/", "HVGirl.glb", scene, function (scene) {
        const hero = scene.getMeshByName("__root__");
        hero.position = new BABYLON.Vector3(0, 0, 0);
        hero.scaling = new BABYLON.Vector3(0.1, 0.1, 0.1);
        shadowGenerator.addShadowCaster(hero, true);
        
        // Configurar la cámara para seguir al personaje
        camera.lockedTarget = hero;

        // Reproducir animación de Idle
        const idleAnim = scene.getAnimationGroupByName("Idle");
        const walkAnim = scene.getAnimationGroupByName("Walking");
        
        if (idleAnim) {
            idleAnim.start(true, 1.0, idleAnim.from, idleAnim.to, false);
        }

        // Control de movimiento
        const inputMap = {};
        scene.actionManager = new BABYLON.ActionManager(scene);
        scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyDownTrigger, function (evt) {
            inputMap[evt.sourceEvent.key] = evt.sourceEvent.type == "keydown";
        }));
        scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyUpTrigger, function (evt) {
            inputMap[evt.sourceEvent.key] = false;
        }));

        const speed = 0.1;
        let isMoving = false;
        
        scene.onBeforeRenderObservable.add(() => {
            let moving = false;
            
            // Movimiento hacia adelante
            if (inputMap["w"] || inputMap["W"]) {
                const forward = new BABYLON.Vector3(
                    Math.sin(hero.rotation.y),
                    0,
                    Math.cos(hero.rotation.y)
                );
                hero.position.addInPlace(forward.scale(speed));
                moving = true;
            }
            
            // Movimiento hacia atrás
            if (inputMap["s"] || inputMap["S"]) {
                const backward = new BABYLON.Vector3(
                    -Math.sin(hero.rotation.y),
                    0,
                    -Math.cos(hero.rotation.y)
                );
                hero.position.addInPlace(backward.scale(speed));
                moving = true;
            }
            
            // Rotación a la izquierda
            if (inputMap["a"] || inputMap["A"]) {
                hero.rotation.y -= 0.05;
            }
            
            // Rotación a la derecha
            if (inputMap["d"] || inputMap["D"]) {
                hero.rotation.y += 0.05;
            }
            
            // Cambiar animación según movimiento
            if (moving && !isMoving) {
                if (idleAnim) idleAnim.stop();
                if (walkAnim) walkAnim.start(true, 1.0, walkAnim.from, walkAnim.to, false);
                isMoving = true;
            } else if (!moving && isMoving) {
                if (walkAnim) walkAnim.stop();
                if (idleAnim) idleAnim.start(true, 1.0, idleAnim.from, idleAnim.to, false);
                isMoving = false;
            }
        });
    });

    return scene;
};

const scene = createScene();

engine.runRenderLoop(() => {
    scene.render();
});

window.addEventListener("resize", () => {
    engine.resize();
});
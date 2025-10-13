const canvas = document.getElementById("renderCanvas");
const engine = new BABYLON.Engine(canvas, true);

const createScene = function () {
    const scene = new BABYLON.Scene(engine);
    scene.clearColor = new BABYLON.Color3(0.53, 0.81, 0.92);

    // Cámara orbital
    const camera = new BABYLON.ArcRotateCamera("camera", -Math.PI / 2, Math.PI / 2.5, 15, new BABYLON.Vector3(0, 0, 0), scene);
    camera.attachControl(canvas, true);
    camera.lowerRadiusLimit = 5;
    camera.upperRadiusLimit = 50;

    // Iluminación básica
    const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = 0.7;

    const directionalLight = new BABYLON.DirectionalLight("dirLight", new BABYLON.Vector3(0, -1, -1), scene);
    directionalLight.position = new BABYLON.Vector3(0, 50, 50);

    // Suelo
    const ground = BABYLON.MeshBuilder.CreateGround("ground", {width: 50, height: 50}, scene);
    const groundMat = new BABYLON.StandardMaterial("groundMat", scene);
    groundMat.diffuseColor = new BABYLON.Color3(0.5, 0.5, 0.5);
    ground.material = groundMat;
    ground.receiveShadows = true;

    // Generador de sombras
    const shadowGenerator = new BABYLON.ShadowGenerator(1024, directionalLight);
    shadowGenerator.useBlurExponentialShadowMap = true;
    shadowGenerator.blurKernel = 32;

    // Cargar modelo .glb
    BABYLON.SceneLoader.Append("https://assets.babylonjs.com/meshes/", "HVGirl.glb", scene, function (scene) {
        const hero = scene.getMeshByName("__root__");
        hero.position = new BABYLON.Vector3(0, 0, 0);
        hero.scaling = new BABYLON.Vector3(0.1, 0.1, 0.1);
        shadowGenerator.addShadowCaster(hero, true);
        camera.target = hero;

        // Reproducir animación de Idle
        const idleAnim = scene.getAnimationGroupByName("Idle");
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
            inputMap[evt.sourceEvent.key] = evt.sourceEvent.type == "keydown";
        }));

        const speed = 0.1;
        scene.onBeforeRenderObservable.add(() => {
            if (inputMap["w"] || inputMap["W"]) {
                hero.moveWithCollisions(hero.forward.scaleInPlace(speed));
            }
            if (inputMap["s"] || inputMap["S"]) {
                hero.moveWithCollisions(hero.forward.scaleInPlace(-speed));
            }
            if (inputMap["a"] || inputMap["A"]) {
                hero.rotation.y -= 0.05;
            }
            if (inputMap["d"] || inputMap["D"]) {
                hero.rotation.y += 0.05;
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
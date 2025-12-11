// ========================================
// JUEGO: AYUDANTE DE SANTA
// Creado por: Johan Baño 
// Framework: Babylon.js
// ========================================

// --- CONFIGURACIÓN INICIAL ---
// Obtiene el canvas del HTML donde se renderizará el juego.
const canvas = document.getElementById("renderCanvas");
// Crea el motor de renderizado de Babylon.js. El 'true' habilita antialiasing.
const engine = new BABYLON.Engine(canvas, true);

// --- ESTADO DEL JUEGO ---
// Estas variables controlan la lógica principal del juego.
let paqueteEnMano = false;       // ¿El jugador tiene un regalo?
let regalosEntregados = 0;       // Contador de regalos entregados.
let inputMap = {};               // Almacena las teclas que están siendo presionadas.
let camaraLibre = false;         // Controla si la cámara es libre o sigue al jugador.
let jugador = null, regalo = null, trineo = null, scene = null; // Variables para los objetos principales de la escena.

// Objeto para verificar si los modelos 3D principales ya se cargaron.
const modelosCargados = {
    jugador: false,
    regalo: false,
    trineo: false
};

// ========================================
// FUNCIÓN PRINCIPAL: CREAR ESCENA
// Aquí se configura todo el mundo 3D.
// ========================================
const createScene = function () {
    // Crea una nueva escena de Babylon.
    scene = new BABYLON.Scene(engine);
    // Desactivamos el sistema de colisiones global para manejarlo manualmente.
    scene.collisionsEnabled = false;
    // Color de fondo del cielo.
    scene.clearColor = new BABYLON.Color3(0.8, 0.9, 1.0);

    // --- EFECTOS DE AMBIENTE ---
    // Niebla para dar profundidad y un ambiente invernal.
    scene.fogMode = BABYLON.Scene.FOGMODE_EXP; // Niebla exponencial.
    scene.fogDensity = 0.02;                   // Densidad de la niebla.
    scene.fogColor = new BABYLON.Color3(0.8, 0.9, 1.0); // Color de la niebla.

    // --- SKYBOX (CIELO) ---
    // Un cubo gigante que envuelve la escena para simular el cielo.
    const skybox = BABYLON.MeshBuilder.CreateBox("skybox", { size: 1000.0 }, scene);
    const skyboxMaterial = new BABYLON.StandardMaterial("skyBox", scene);
    skyboxMaterial.backFaceCulling = false; // Renderiza el interior del cubo.
    // Textura cúbica para el cielo.
    skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture("https://playground.babylonjs.com/textures/skybox", scene);
    skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
    skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
    skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
    skybox.material = skyboxMaterial;

    // --- CÁMARA ---
    // Cámara de seguimiento que se ancla al jugador.
    const camera = new BABYLON.FollowCamera("camera1", new BABYLON.Vector3(0, 8, -15), scene);
    camera.radius = 15;           // Distancia al objetivo.
    camera.heightOffset = 8;      // Altura sobre el objetivo.
    camera.rotationOffset = 180;  // Rotación para ver la espalda del personaje.
    camera.cameraAcceleration = 0.05; // Suavidad en el seguimiento.
    camera.maxCameraSpeed = 10;   // Velocidad máxima de la cámara.
    // Límites para el zoom y la altura.
    camera.lowerHeightOffsetLimit = 1;
    camera.upperHeightOffsetLimit = 20;
    camera.lowerRadiusLimit = 5;
    camera.upperRadiusLimit = 30;
    camera.attachControl(canvas, false); // 'false' para que no controle el movimiento por defecto.

    // --- LUCES ---
    // Luz hemisférica: ilumina toda la escena de manera uniforme.
    const light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = 0.8;
    // Luz direccional: simula la luz del sol, proyectando sombras.
    const dirLight = new BABYLON.DirectionalLight("dirLight", new BABYLON.Vector3(-1, -2, -1), scene);
    dirLight.intensity = 0.5;

    // --- MATERIALES ---
    // Material para el suelo, simulando nieve.
    const matNieve = new BABYLON.StandardMaterial("matNieve", scene);
    matNieve.diffuseColor = new BABYLON.Color3(0.95, 0.95, 1);
    matNieve.specularColor = new BABYLON.Color3(0.5, 0.5, 0.5);
    matNieve.backFaceCulling = false;

    // Material para la zona de entrega, semitransparente.
    const matZonaTrineo = new BABYLON.StandardMaterial("matZonaTrineo", scene);
    matZonaTrineo.diffuseColor = new BABYLON.Color3(1, 0.84, 0); // Color dorado.
    matZonaTrineo.alpha = 0.5; // 50% de transparencia.

    // --- OBJETOS DEL MUNDO ---
    // Suelo principal del juego.
    const suelo = BABYLON.MeshBuilder.CreateGround("suelo", { width: 1000, height: 1000 }, scene);
    suelo.material = matNieve;
    suelo.position.y = 0;
    suelo.checkCollisions = true; // El suelo es el único objeto con colisión activada.
    suelo.receiveShadows = true;  // Permite que se proyecten sombras sobre él.

    // Indicador visual para la zona de entrega de regalos.
    const zonaEntrega = BABYLON.MeshBuilder.CreateGround("zonaEntrega", { width: 8, height: 8 }, scene);
    zonaEntrega.material = matZonaTrineo;
    zonaEntrega.position = new BABYLON.Vector3(-20, 0.01, 20); // Misma posición que el trineo.

    // --- GENERACIÓN PROCEDURAL DEL MUNDO ---
    // Llama a funciones para poblar el mapa con elementos decorativos.
    crearTalleres(scene); 
    crearBosqueDeArboles(scene);    
    crearNieve(scene);

    // =================================================================
    // CARGA ASINCRÓNICA DE MODELOS 3D (Formato GLB)
    // Usamos SceneLoader para cargar los modelos desde archivos externos.
    // =================================================================

    // --- JUGADOR ---
    BABYLON.SceneLoader.ImportMesh("", "assets/model/", "santa_model.glb", scene, function (meshes) {
        jugador = meshes[0]; // El primer mesh es el nodo principal.
        // Forzamos el uso de rotación Euler (ejes Y) en lugar de cuaterniones.
        // Esto es CRÍTICO para que la rotación del personaje funcione correctamente.
        jugador.rotationQuaternion = null; 
        jugador.position = new BABYLON.Vector3(15, 0, 0); // Posición inicial.
        jugador.scaling = new BABYLON.Vector3(1, 1, 1);   // Escala del modelo.

        jugador.checkCollisions = false; // Desactivamos colisiones para el jugador.
        // Elipsoide de colisión (aunque no se use, es buena práctica definirlo).
        jugador.ellipsoid = new BABYLON.Vector3(0.8, 1.2, 0.8);
        jugador.ellipsoidOffset = new BABYLON.Vector3(0, 1.2, 0);
        
        // Emparentamos el resto de meshes al principal para que se muevan juntos.
        for (let i = 1; i < meshes.length; ++i) {
            meshes[i].parent = jugador;
        }
        modelosCargados.jugador = true; // Marcamos el modelo como cargado.
    });

    // --- REGALO ---
    BABYLON.SceneLoader.ImportMesh("", "assets/model/", "Present.glb", scene, function (meshes) {
        regalo = meshes[0];
        regalo.position = new BABYLON.Vector3(8, 0, 4); // Posición inicial del primer regalo.
        regalo.scaling = new BABYLON.Vector3(3, 3, 3);

        for (let i = 0; i < meshes.length; ++i) {
            meshes[i].isVisible = true;
            if (i > 0) meshes[i].parent = regalo;
            if (meshes[i].material) meshes[i].material.backFaceCulling = false;
        }
        modelosCargados.regalo = true;
    });

    // --- TRINEO ---
    BABYLON.SceneLoader.ImportMesh("", "assets/model/", "uploads_files_5642601_santa_clauss_sleigh.glb", scene, function (meshes) {
        trineo = meshes[0];
        trineo.position = new BABYLON.Vector3(-20, 0, 20); // Nueva posición del trineo.
        trineo.scaling = new BABYLON.Vector3(1, 1, 1);
        trineo.rotation.y = Math.PI; // Rotamos 180 grados.
        trineo.checkCollisions = false; // Desactivamos colisiones.
        
        for (let i = 1; i < meshes.length; ++i) {
            meshes[i].parent = trineo;
            meshes[i].checkCollisions = false;
            if (meshes[i].material) meshes[i].material.backFaceCulling = false;
        }
        modelosCargados.trineo = true;
    });

    // --- TALLER DECORATIVO PRINCIPAL ---
    BABYLON.SceneLoader.ImportMesh("", "assets/model/", "uploads_files_5622189_HouseCake.glb", scene, function (meshes) {
        const taller = new BABYLON.TransformNode("tallerContainer", scene);
        taller.position = new BABYLON.Vector3(8, -2, 8);
        taller.scaling = new BABYLON.Vector3(0.5, 0.5, 0.5);
        for (let i = 0; i < meshes.length; ++i) {
            meshes[i].parent = taller;
            meshes[i].checkCollisions = false; // Sin colisiones.
            meshes[i].isVisible = true;
            if (meshes[i].material) {
                meshes[i].material.backFaceCulling = false;
                meshes[i].material.twoSidedLighting = true;
            }
        }
    });

    // ========================================
    // GESTIÓN DE INPUT (TECLADO)
    // ========================================

    // ActionManager para registrar eventos de teclado.
    scene.actionManager = new BABYLON.ActionManager(scene);
    // Cuando se presiona una tecla, se guarda en 'inputMap'.
    scene.actionManager.registerAction(
        new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyDownTrigger, evt => inputMap[evt.sourceEvent.key.toLowerCase()] = true)
    );
    // Cuando se suelta, se elimina de 'inputMap'.
    scene.actionManager.registerAction(
        new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyUpTrigger, evt => inputMap[evt.sourceEvent.key.toLowerCase()] = false)
    );

    // Observador de teclado para acciones específicas (espacio, cámara).
    scene.onKeyboardObservable.add((kbInfo) => {
        // Solo procesar si los modelos están cargados y es un evento de tecla presionada.
        if (kbInfo.type !== BABYLON.KeyboardEventTypes.KEYDOWN || !modelosCargados.jugador || !modelosCargados.regalo || !modelosCargados.trineo) return;
        
        // ESPACIO: Intenta recoger o entregar un regalo.
        if (kbInfo.event.key === " ") {
            if (!paqueteEnMano) intentaRecogerRegalo();
            else intentaEntregarRegalo();
        }
        // C: Cambia entre cámara fija y libre.
        if (kbInfo.event.key.toLowerCase() === "c") {
            camaraLibre = !camaraLibre;
            if (camaraLibre) {
                camera.attachControl(canvas, true); // Permite control manual de la cámara.
                actualizarEstado("Cámara libre activada (presiona C para desactivar)");
            } else {
                camera.attachControl(canvas, false); // Vuelve al modo seguimiento.
                actualizarEstado(paqueteEnMano ? "Lleva el regalo al trineo" : "Busca un regalo en el taller");
            }
        }
    });

// ========================================
// GAMELOOP (Bucle del Juego)
// Se ejecuta en cada frame.
// ========================================
const VELOCIDAD = 0.3; // Velocidad de movimiento del jugador.

scene.onBeforeRenderObservable.add(() => {
    // No hacer nada si el jugador no ha cargado.
    if (!modelosCargados.jugador) return;

    // Asegura que la cámara siempre apunte al jugador.
    if (camera && jugador && !camera.lockedTarget) camera.lockedTarget = jugador;

    // --- LÓGICA DE MOVIMIENTO Y ROTACIÓN ---
    // 1. Obtener la dirección de la cámara.
    let camForward = scene.activeCamera.getForwardRay().direction;
    camForward.y = 0; // Ignorar la componente Y para movimiento en el plano XZ.
    camForward.normalize();
    
    // Calcular el vector derecho de la cámara.
    let camRight = new BABYLON.Vector3(camForward.z, 0, -camForward.x);

    // 2. Calcular el vector de movimiento basado en el input.
    let moveVector = BABYLON.Vector3.Zero();
    let isMoving = false;
    
    if (inputMap["w"]) { moveVector.addInPlace(camForward); isMoving = true; }
    if (inputMap["s"]) { moveVector.addInPlace(camForward.scale(-1)); isMoving = true; }
    if (inputMap["a"]) { moveVector.addInPlace(camRight.scale(-1)); isMoving = true; }
    if (inputMap["d"]) { moveVector.addInPlace(camRight); isMoving = true; }
    
    // 3. Aplicar movimiento y rotación si hay input.
    if (isMoving && moveVector.length() > 0) {
        // Normalizar y escalar por velocidad para un movimiento constante.
        moveVector.normalize().scaleInPlace(VELOCIDAD);
        // Mover al jugador manualmente (sin colisiones de motor).
        jugador.position.addInPlace(moveVector);
        
        // --- ROTACIÓN SUAVE ---
        // Calcular el ángulo de destino basado en el vector de movimiento.
        let targetRotation = Math.atan2(moveVector.x, moveVector.z);
        
        // Interpolar suavemente desde la rotación actual a la de destino.
        let currentRotation = jugador.rotation.y;
        let diff = targetRotation - currentRotation;
        
        // Asegurar que la rotación tome el camino más corto.
        while (diff < -Math.PI) diff += Math.PI * 2;
        while (diff > Math.PI) diff -= Math.PI * 2;
        
        // Aplicar una fracción de la diferencia en cada frame para suavizar.
        jugador.rotation.y += diff * 0.15;
    }

    // Animación de rotación del regalo cuando está en el suelo.
    if (!paqueteEnMano && modelosCargados.regalo && regalo) regalo.rotation.y += 0.02;
});


    return scene;
};

// ========================================
// FUNCIONES AUXILIARES
// ========================================

/**
 * Intenta recoger un regalo si el jugador está cerca.
 */
function intentaRecogerRegalo() {
    if (!regalo || !jugador) return;
    const dist = BABYLON.Vector3.Distance(jugador.position, regalo.position);
    if (dist < 3) { // Si la distancia es menor a 3 unidades.
        regalo.parent = jugador; // Emparenta el regalo al jugador.
        regalo.position = new BABYLON.Vector3(0, 1.2, 0); // Posición relativa al jugador.
        paqueteEnMano = true;
        actualizarEstado("Lleva el regalo al trineo");
    }
}

/**
 * Intenta entregar un regalo si el jugador está cerca del trineo.
 */
function intentaEntregarRegalo() {
    if (!trineo || !regalo || !jugador) return;
    const dist = BABYLON.Vector3.Distance(jugador.position, trineo.position);
    if (dist < 15) { // Rango de entrega aumentado.
        regalo.parent = null; // Desemparenta el regalo.
        // Coloca el regalo en el trineo con una posición aleatoria.
        regalo.position = new BABYLON.Vector3(
            trineo.position.x + (Math.random() - 0.5) * 2,
            trineo.position.y + 0.5 + (regalosEntregados * 0.7),
            trineo.position.z + (Math.random() - 0.5) * 2
        );
        paqueteEnMano = false;
        regalosEntregados++;
        actualizarContador(regalosEntregados);
        
        // Devuelve al jugador al punto de partida.
        jugador.position = new BABYLON.Vector3(15, 0, 0);
        jugador.rotation.y = 0;
        
        // Crea un nuevo regalo después de 1 segundo.
        setTimeout(() => crearNuevoRegalo(scene), 1000);
        actualizarEstado("Busca un regalo en el taller");
    }
}

/**
 * Crea un árbol decorativo en una posición específica.
 * @param {BABYLON.Scene} scene - La escena donde se creará el árbol.
 * @param {BABYLON.Vector3} posicion - La posición del árbol.
 */
function crearArbol(scene, posicion) {
    BABYLON.SceneLoader.ImportMesh("", "assets/model/", "spruce_tree.glb", scene, function (meshes) {
        if (meshes.length > 0) {
            const arbol = meshes[0];
            arbol.position = posicion;
            const escala = 0.4 + Math.random() * 0.3; // Escala aleatoria.
            arbol.scaling = new BABYLON.Vector3(escala, escala, escala);
            arbol.rotation.y = Math.random() * Math.PI * 2; // Rotación aleatoria.
            arbol.checkCollisions = false; // Sin colisiones.
            
            for (let i = 1; i < meshes.length; ++i) {
                meshes[i].checkCollisions = false;
            }
        }
    });
}

/**
 * Crea un bosque de árboles distribuidos por el mapa.
 */
function crearBosqueDeArboles(scene) {
    // Array de posiciones predefinidas para los árboles.
    const posiciones = [
        new BABYLON.Vector3(-15, 0, 5), new BABYLON.Vector3(-12, 0, -3),
        new BABYLON.Vector3(-18, 0, 8), new BABYLON.Vector3(-20, 0, 2),
        new BABYLON.Vector3(-10, 0, 10), new BABYLON.Vector3(-5, 0, 6),
        new BABYLON.Vector3(-14, 0, -8), new BABYLON.Vector3(-22, 0, -5),
        new BABYLON.Vector3(-30, 0, 40), new BABYLON.Vector3(-20, 0, 45),
        new BABYLON.Vector3(-10, 0, 42), new BABYLON.Vector3(0, 0, 48),
        new BABYLON.Vector3(10, 0, 44), new BABYLON.Vector3(20, 0, 46),
        new BABYLON.Vector3(30, 0, 40), new BABYLON.Vector3(35, 0, 38),
        new BABYLON.Vector3(-30, 0, -40), new BABYLON.Vector3(-20, 0, -45),
        new BABYLON.Vector3(-10, 0, -42), new BABYLON.Vector3(0, 0, -48),
        new BABYLON.Vector3(10, 0, -44), new BABYLON.Vector3(20, 0, -46),
        new BABYLON.Vector3(30, 0, -40), new BABYLON.Vector3(35, 0, -38),
        new BABYLON.Vector3(40, 0, -30), new BABYLON.Vector3(45, 0, -20),
        new BABYLON.Vector3(42, 0, -10), new BABYLON.Vector3(48, 0, 0),
        new BABYLON.Vector3(44, 0, 10), new BABYLON.Vector3(46, 0, 20),
        new BABYLON.Vector3(40, 0, 30), new BABYLON.Vector3(38, 0, 35),
        new BABYLON.Vector3(-40, 0, -30), new BABYLON.Vector3(-45, 0, -20),
        new BABYLON.Vector3(-42, 0, -10), new BABYLON.Vector3(-48, 0, 0),
        new BABYLON.Vector3(-44, 0, 10), new BABYLON.Vector3(-46, 0, 20),
        new BABYLON.Vector3(-40, 0, 30), new BABYLON.Vector3(-38, 0, 35)
    ];
    posiciones.forEach(pos => crearArbol(scene, pos));
}

/**
 * Crea múltiples talleres con regalos cercanos.
 */
function crearTalleres(scene) {
    // Posiciones para los talleres tipo "HouseCake".
    const talleresHouseCake = [
        new BABYLON.Vector3(8, 0, 8), new BABYLON.Vector3(-25, 0, 25),
        new BABYLON.Vector3(25, 0, 25), new BABYLON.Vector3(-25, 0, -25),
        new BABYLON.Vector3(25, 0, -25), new BABYLON.Vector3(-40, 0, 15),
        new BABYLON.Vector3(40, 0, -15), new BABYLON.Vector3(0, 0, 35),
        new BABYLON.Vector3(15, 0, -40)
    ];

    // Posiciones para los talleres tipo "FantasyHouse".
    const talleresFantasyHouse = [
        new BABYLON.Vector3(-15, 0, -10), new BABYLON.Vector3(35, 0, 20),
        new BABYLON.Vector3(-35, 0, -15), new BABYLON.Vector3(10, 0, -30),
        new BABYLON.Vector3(-20, 0, 40), new BABYLON.Vector3(45, 0, 5),
        new BABYLON.Vector3(-10, 0, -35), new BABYLON.Vector3(20, 0, 40)
    ];

    // Crea los talleres "HouseCake" y un regalo cerca de cada uno.
    talleresHouseCake.forEach((pos, index) => {
        BABYLON.SceneLoader.ImportMesh("", "assets/model/", "uploads_files_5622189_HouseCake.glb", scene, function (meshes) {
            const taller = new BABYLON.TransformNode("houseCake" + index, scene);
            taller.position = new BABYLON.Vector3(pos.x, -2, pos.z);
            taller.scaling = new BABYLON.Vector3(0.5, 0.5, 0.5);
            for (let i = 0; i < meshes.length; ++i) {
                meshes[i].parent = taller;
                meshes[i].checkCollisions = false;
                if (meshes[i].material) {
                    meshes[i].material.backFaceCulling = false;
                    meshes[i].material.twoSidedLighting = true;
                }
            }
        });

        // Crea un regalo cerca del taller.
        BABYLON.SceneLoader.ImportMesh("", "assets/model/", "Present.glb", scene, function (meshes) {
            if (meshes.length > 0) {
                const regaloExtra = meshes[0];
                regaloExtra.position = new BABYLON.Vector3(
                    pos.x + (Math.random() - 0.5) * 8, 0,
                    pos.z - 5 + (Math.random() - 0.5) * 4
                );
                regaloExtra.scaling = new BABYLON.Vector3(3, 3, 3);
                for (let i = 1; i < meshes.length; ++i) meshes[i].parent = regaloExtra;
            }
        });
    });

    // Crea los talleres "FantasyHouse" y un regalo cerca de cada uno.
    talleresFantasyHouse.forEach((pos, index) => {
        BABYLON.SceneLoader.ImportMesh("", "assets/model/", "fantasy_house.glb", scene, function (meshes) {
            const taller = new BABYLON.TransformNode("fantasyHouse" + index, scene);
            taller.position = new BABYLON.Vector3(pos.x, -2.5, pos.z);
            taller.scaling = new BABYLON.Vector3(0.3, 0.3, 0.3);
            for (let i = 0; i < meshes.length; ++i) {
                meshes[i].parent = taller;
                meshes[i].checkCollisions = false;
                if (meshes[i].material) {
                    meshes[i].material.backFaceCulling = false;
                    meshes[i].material.twoSidedLighting = true;
                }
            }
        });

        // Crea un regalo cerca del taller.
        BABYLON.SceneLoader.ImportMesh("", "assets/model/", "Present.glb", scene, function (meshes) {
            if (meshes.length > 0) {
                const regaloExtra = meshes[0];
                regaloExtra.position = new BABYLON.Vector3(
                    pos.x + (Math.random() - 0.5) * 8, 0,
                    pos.z - 6 + (Math.random() - 0.5) * 4
                );
                regaloExtra.scaling = new BABYLON.Vector3(3, 3, 3);
                for (let i = 1; i < meshes.length; ++i) meshes[i].parent = regaloExtra;
            }
        });
    });
}

/**
 * Crea un nuevo regalo en una posición aleatoria cerca del taller principal.
 */
function crearNuevoRegalo(scene) {
    BABYLON.SceneLoader.ImportMesh("", "assets/model/", "Present.glb", scene, function (meshes) {
        if (meshes.length > 0) {
            regalo = meshes[0];
            regalo.position = new BABYLON.Vector3(
                8 + (Math.random() - 0.5) * 4, 0,
                4 + (Math.random() - 0.5) * 2
            );
            regalo.scaling = new BABYLON.Vector3(3, 3, 3);
            for (let i = 1; i < meshes.length; ++i) meshes[i].parent = regalo;
            modelosCargados.regalo = true;
        }
    });
}

/**
 * Crea un sistema de partículas para simular nieve.
 */
function crearNieve(scene) {
    const particleSystem = new BABYLON.ParticleSystem("particles", 2000, scene);
    particleSystem.particleTexture = new BABYLON.Texture("https://www.babylonjs-playground.com/textures/flare.png", scene);
    
    // Área de emisión de partículas.
    particleSystem.emitter = new BABYLON.Vector3(0, 10, 0);
    particleSystem.minEmitBox = new BABYLON.Vector3(-20, 0, -20);
    particleSystem.maxEmitBox = new BABYLON.Vector3(20, 0, 20);
    
    // Propiedades de las partículas (color, tamaño, vida, etc.).
    particleSystem.color1 = new BABYLON.Color4(1, 1, 1, 1.0);
    particleSystem.color2 = new BABYLON.Color4(1, 1, 1, 1.0);
    particleSystem.colorDead = new BABYLON.Color4(1, 1, 1, 0.0);
    particleSystem.minSize = 0.1;
    particleSystem.maxSize = 0.3;
    particleSystem.minLifeTime = 2;
    particleSystem.maxLifeTime = 5;
    particleSystem.emitRate = 200;
    particleSystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_ONEONE;
    particleSystem.gravity = new BABYLON.Vector3(0, -1, 0);
    particleSystem.direction1 = new BABYLON.Vector3(0, -1, 0);
    particleSystem.direction2 = new BABYLON.Vector3(0, -1, 0);
    particleSystem.minAngularSpeed = 0;
    particleSystem.maxAngularSpeed = Math.PI;
    particleSystem.minEmitPower = 1;
    particleSystem.maxEmitPower = 3;
    particleSystem.updateSpeed = 0.005;
    
    // Inicia el sistema de partículas.
    particleSystem.start();
}

// --- FUNCIONES DE INTERFAZ (HUD) ---
function actualizarEstado(mensaje) {
    document.getElementById("game-status").textContent = mensaje;
}
function actualizarContador(cantidad) {
    document.getElementById("gift-count").textContent = cantidad;
}

// ========================================
// INICIAR EL JUEGO
// ========================================
// Crea la escena.
scene = createScene();
// Inicia el bucle de renderizado.
engine.runRenderLoop(function () { if (scene) scene.render(); });
// Ajusta el tamaño del canvas si la ventana del navegador cambia.
window.addEventListener("resize", () => engine.resize());

# Proyecto Babylon.js Local

Este proyecto contiene una escena 3D interactiva creada con Babylon.js que incluye:

- ✨ Suelo con textura
- 📦 Cubo con material metálico
- 🔮 Esfera con textura de ladrillo
- 🥤 Cilindro transparente
- 🌳 Árbol (tronco + follaje)
- 🌌 Sky box con textura HDR
- 💡 Iluminación hemisférica y direccional
- 📷 Cámara orbital interactiva

## 🚀 Cómo ejecutar

### Opción 1: Live Server (Recomendado)
1. Instala la extensión "Live Server" en VS Code
2. Haz clic derecho en `index.html`
3. Selecciona "Open with Live Server"

### Opción 2: Python HTTP Server
```bash
# Navega a la carpeta babylon
cd babylon

# Python 3
python -m http.server 5500

# Python 2
python -m SimpleHTTPServer 5500
```
Luego abre: http://localhost:5500

### Opción 3: Node.js HTTP Server
```bash
# Instala http-server globalmente
npm install -g http-server

# Ejecuta desde la carpeta babylon
cd babylon
http-server
```

### Opción 4: Cualquier servidor web local
Coloca los archivos en cualquier servidor web y accede a `index.html`

## 📁 Estructura del proyecto

```
babylon/
├── index.html          # Archivo HTML principal
├── src/
│   └── script.js      # Tu código JavaScript de la escena
└── README.md          # Este archivo
```

## 🎮 Controles

- **Clic izquierdo + arrastrar**: Rotar cámara
- **Scroll/rueda**: Zoom in/out
- **Clic derecho + arrastrar**: Pan (mover lateralmente)

## 🛠 Tecnologías utilizadas

- [Babylon.js](https://www.babylonjs.com/) - Motor 3D
- HTML5 Canvas
- JavaScript ES6+

¡Disfruta explorando tu escena 3D! 🎉
/**
 * skin-renderer.js - Three.js based 3D character renderer.
 * Pre-renders characters at 64 angles into sprite caches.
 * Uses Crossy Road style: box geometry + lambert material + directional light.
 */
import * as THREE from "three";

// Character model definitions
// Each part: { geo: "box"|"sphere"|"cylinder"|"cone", pos: [x,y,z], size: [w,h,d], color: "key", rot: [x,y,z] }
const CHARACTER_MODELS = {

bunny: {
    palette: { body: 0xffffff, accent: 0xffaacc, dark: 0xdddddd, eye: 0x111111, nose: 0xff6688 },
    parts: [
        // Body
        { geo: "box", pos: [0, 0.45, 0], size: [0.5, 0.55, 0.45], color: "body" },
        // Head
        { geo: "box", pos: [0, 1.0, 0.02], size: [0.42, 0.42, 0.38], color: "body" },
        // Left ear
        { geo: "box", pos: [-0.1, 1.5, 0], size: [0.08, 0.38, 0.06], color: "body" },
        // Right ear
        { geo: "box", pos: [0.1, 1.5, 0], size: [0.08, 0.38, 0.06], color: "body" },
        // Inner ears
        { geo: "box", pos: [-0.1, 1.48, 0.02], size: [0.04, 0.28, 0.02], color: "accent" },
        { geo: "box", pos: [0.1, 1.48, 0.02], size: [0.04, 0.28, 0.02], color: "accent" },
        // Left arm
        { geo: "box", pos: [-0.3, 0.5, 0], size: [0.1, 0.25, 0.1], color: "body" },
        // Right arm
        { geo: "box", pos: [0.3, 0.5, 0], size: [0.1, 0.25, 0.1], color: "body" },
        // Left leg
        { geo: "box", pos: [-0.12, 0.1, 0], size: [0.12, 0.2, 0.14], color: "body" },
        // Right leg
        { geo: "box", pos: [0.12, 0.1, 0], size: [0.12, 0.2, 0.14], color: "body" },
        // Feet
        { geo: "box", pos: [-0.12, 0.0, 0.04], size: [0.13, 0.05, 0.16], color: "accent" },
        { geo: "box", pos: [0.12, 0.0, 0.04], size: [0.13, 0.05, 0.16], color: "accent" },
        // Tail
        { geo: "sphere", pos: [0, 0.4, -0.25], size: [0.08], color: "body" },
        // Eyes
        { geo: "sphere", pos: [-0.1, 1.05, 0.19], size: [0.045], color: "eye" },
        { geo: "sphere", pos: [0.1, 1.05, 0.19], size: [0.045], color: "eye" },
        // Nose
        { geo: "sphere", pos: [0, 0.95, 0.2], size: [0.035], color: "nose" },
    ],
},

penguin: {
    palette: { body: 0x1a1a2e, belly: 0xf5f5f5, accent: 0xff8c00, eye: 0xffffff, pupil: 0x111111 },
    parts: [
        // Body
        { geo: "box", pos: [0, 0.45, 0], size: [0.45, 0.6, 0.4], color: "body" },
        // Belly
        { geo: "box", pos: [0, 0.45, 0.12], size: [0.3, 0.45, 0.1], color: "belly" },
        // Head
        { geo: "box", pos: [0, 1.0, 0], size: [0.38, 0.38, 0.35], color: "body" },
        // Left flipper
        { geo: "box", pos: [-0.28, 0.5, 0], size: [0.07, 0.3, 0.15], color: "body", rot: [0, 0, 0.2] },
        // Right flipper
        { geo: "box", pos: [0.28, 0.5, 0], size: [0.07, 0.3, 0.15], color: "body", rot: [0, 0, -0.2] },
        // Left foot
        { geo: "box", pos: [-0.12, 0.0, 0.06], size: [0.14, 0.06, 0.16], color: "accent" },
        // Right foot
        { geo: "box", pos: [0.12, 0.0, 0.06], size: [0.14, 0.06, 0.16], color: "accent" },
        // Beak
        { geo: "cone", pos: [0, 0.92, 0.2], size: [0.06, 0.1, 8], color: "accent", rot: [Math.PI/2, 0, 0] },
        // Eyes
        { geo: "sphere", pos: [-0.1, 1.05, 0.17], size: [0.05], color: "eye" },
        { geo: "sphere", pos: [0.1, 1.05, 0.17], size: [0.05], color: "eye" },
        // Pupils
        { geo: "sphere", pos: [-0.1, 1.05, 0.2], size: [0.03], color: "pupil" },
        { geo: "sphere", pos: [0.1, 1.05, 0.2], size: [0.03], color: "pupil" },
    ],
},

fox: {
    palette: { body: 0xf07020, belly: 0xffffff, dark: 0x222222, eye: 0x111111, accent: 0xffccaa },
    parts: [
        // Body
        { geo: "box", pos: [0, 0.45, 0], size: [0.45, 0.55, 0.38], color: "body" },
        // Belly
        { geo: "box", pos: [0, 0.4, 0.1], size: [0.25, 0.3, 0.08], color: "belly" },
        // Head
        { geo: "box", pos: [0, 1.0, 0.03], size: [0.38, 0.35, 0.34], color: "body" },
        // Muzzle
        { geo: "box", pos: [0, 0.9, 0.2], size: [0.15, 0.1, 0.1], color: "belly" },
        // Left ear (triangle-ish via rotated box)
        { geo: "cone", pos: [-0.14, 1.3, 0], size: [0.07, 0.16, 4], color: "body" },
        // Right ear
        { geo: "cone", pos: [0.14, 1.3, 0], size: [0.07, 0.16, 4], color: "body" },
        // Inner ears
        { geo: "cone", pos: [-0.14, 1.28, 0.01], size: [0.04, 0.1, 4], color: "accent" },
        { geo: "cone", pos: [0.14, 1.28, 0.01], size: [0.04, 0.1, 4], color: "accent" },
        // Tail
        { geo: "box", pos: [0, 0.35, -0.35], size: [0.12, 0.12, 0.25], color: "body" },
        // Tail tip
        { geo: "box", pos: [0, 0.35, -0.5], size: [0.08, 0.08, 0.1], color: "belly" },
        // Legs
        { geo: "box", pos: [-0.12, 0.12, 0], size: [0.09, 0.2, 0.09], color: "body" },
        { geo: "box", pos: [0.12, 0.12, 0], size: [0.09, 0.2, 0.09], color: "body" },
        // Paws
        { geo: "box", pos: [-0.12, 0.0, 0.03], size: [0.1, 0.04, 0.12], color: "dark" },
        { geo: "box", pos: [0.12, 0.0, 0.03], size: [0.1, 0.04, 0.12], color: "dark" },
        // Eyes
        { geo: "sphere", pos: [-0.1, 1.05, 0.17], size: [0.04], color: "eye" },
        { geo: "sphere", pos: [0.1, 1.05, 0.17], size: [0.04], color: "eye" },
        // Nose
        { geo: "sphere", pos: [0, 0.92, 0.26], size: [0.03], color: "dark" },
    ],
},

};

CHARACTER_MODELS.panda = {
    palette: { body: 0xffffff, dark: 0x222222, eye: 0xffffff, pupil: 0x111111, nose: 0x333333 },
    parts: [
        { geo: "box", pos: [0, 0.45, 0], size: [0.5, 0.58, 0.42], color: "body" },
        { geo: "box", pos: [-0.28, 0.5, 0], size: [0.12, 0.28, 0.12], color: "dark" },
        { geo: "box", pos: [0.28, 0.5, 0], size: [0.12, 0.28, 0.12], color: "dark" },
        { geo: "box", pos: [-0.14, 0.1, 0], size: [0.12, 0.2, 0.12], color: "dark" },
        { geo: "box", pos: [0.14, 0.1, 0], size: [0.12, 0.2, 0.12], color: "dark" },
        { geo: "box", pos: [0, 1.0, 0], size: [0.42, 0.4, 0.38], color: "body" },
        { geo: "sphere", pos: [-0.18, 1.2, 0], size: [0.09], color: "dark" },
        { geo: "sphere", pos: [0.18, 1.2, 0], size: [0.09], color: "dark" },
        { geo: "box", pos: [-0.1, 1.02, 0.12], size: [0.1, 0.1, 0.04], color: "dark" },
        { geo: "box", pos: [0.1, 1.02, 0.12], size: [0.1, 0.1, 0.04], color: "dark" },
        { geo: "sphere", pos: [-0.1, 1.03, 0.16], size: [0.035], color: "eye" },
        { geo: "sphere", pos: [0.1, 1.03, 0.16], size: [0.035], color: "eye" },
        { geo: "sphere", pos: [-0.1, 1.03, 0.18], size: [0.02], color: "pupil" },
        { geo: "sphere", pos: [0.1, 1.03, 0.18], size: [0.02], color: "pupil" },
        { geo: "sphere", pos: [0, 0.93, 0.2], size: [0.04], color: "nose" },
    ],
};

CHARACTER_MODELS.owl = {
    palette: { body: 0x8B5E3C, belly: 0xd4a574, dark: 0x5B3E1C, eye: 0xff8c00, pupil: 0x111111, beak: 0xff9800, disc: 0xf0dcc0 },
    parts: [
        { geo: "box", pos: [0, 0.45, 0], size: [0.42, 0.55, 0.38], color: "body" },
        { geo: "box", pos: [0, 0.35, 0.1], size: [0.25, 0.3, 0.08], color: "belly" },
        { geo: "box", pos: [-0.25, 0.5, 0], size: [0.08, 0.32, 0.14], color: "dark" },
        { geo: "box", pos: [0.25, 0.5, 0], size: [0.08, 0.32, 0.14], color: "dark" },
        { geo: "box", pos: [0, 1.0, 0], size: [0.4, 0.38, 0.35], color: "body" },
        { geo: "cone", pos: [-0.16, 1.3, 0], size: [0.06, 0.14, 4], color: "dark" },
        { geo: "cone", pos: [0.16, 1.3, 0], size: [0.06, 0.14, 4], color: "dark" },
        { geo: "sphere", pos: [-0.11, 1.02, 0.15], size: [0.08], color: "disc" },
        { geo: "sphere", pos: [0.11, 1.02, 0.15], size: [0.08], color: "disc" },
        { geo: "sphere", pos: [-0.11, 1.02, 0.2], size: [0.05], color: "eye" },
        { geo: "sphere", pos: [0.11, 1.02, 0.2], size: [0.05], color: "eye" },
        { geo: "sphere", pos: [-0.11, 1.02, 0.23], size: [0.025], color: "pupil" },
        { geo: "sphere", pos: [0.11, 1.02, 0.23], size: [0.025], color: "pupil" },
        { geo: "cone", pos: [0, 0.9, 0.2], size: [0.04, 0.08, 4], color: "beak", rot: [Math.PI/2, 0, 0] },
        { geo: "box", pos: [-0.08, 0.0, 0.04], size: [0.07, 0.05, 0.1], color: "beak" },
        { geo: "box", pos: [0.08, 0.0, 0.04], size: [0.07, 0.05, 0.1], color: "beak" },
    ],
};

CHARACTER_MODELS.frog = {
    palette: { body: 0x2ecc71, belly: 0xa8e6cf, dark: 0x1a7a40, eye_w: 0xffffff, pupil: 0x111111 },
    parts: [
        { geo: "box", pos: [0, 0.3, 0], size: [0.5, 0.35, 0.42], color: "body" },
        { geo: "box", pos: [0, 0.3, 0.12], size: [0.35, 0.25, 0.08], color: "belly" },
        { geo: "box", pos: [0, 0.7, 0], size: [0.48, 0.3, 0.38], color: "body" },
        { geo: "sphere", pos: [-0.18, 0.95, 0.05], size: [0.1], color: "eye_w" },
        { geo: "sphere", pos: [0.18, 0.95, 0.05], size: [0.1], color: "eye_w" },
        { geo: "sphere", pos: [-0.18, 0.95, 0.12], size: [0.05], color: "pupil" },
        { geo: "sphere", pos: [0.18, 0.95, 0.12], size: [0.05], color: "pupil" },
        { geo: "box", pos: [-0.28, 0.15, 0], size: [0.14, 0.18, 0.14], color: "body" },
        { geo: "box", pos: [0.28, 0.15, 0], size: [0.14, 0.18, 0.14], color: "body" },
        { geo: "box", pos: [-0.15, 0.0, 0.05], size: [0.15, 0.04, 0.18], color: "dark" },
        { geo: "box", pos: [0.15, 0.0, 0.05], size: [0.15, 0.04, 0.18], color: "dark" },
    ],
};

CHARACTER_MODELS.chick = {
    palette: { body: 0xffd700, dark: 0xf0a000, beak: 0xff6600, eye: 0x111111, feet: 0xff8c00 },
    parts: [
        { geo: "box", pos: [0, 0.4, 0], size: [0.4, 0.45, 0.38], color: "body" },
        { geo: "box", pos: [0, 0.88, 0], size: [0.35, 0.35, 0.32], color: "body" },
        { geo: "box", pos: [-0.22, 0.45, 0], size: [0.06, 0.2, 0.12], color: "body" },
        { geo: "box", pos: [0.22, 0.45, 0], size: [0.06, 0.2, 0.12], color: "body" },
        { geo: "box", pos: [0, 1.15, 0], size: [0.03, 0.1, 0.03], color: "dark" },
        { geo: "box", pos: [-0.05, 1.12, 0], size: [0.025, 0.07, 0.025], color: "dark" },
        { geo: "box", pos: [0.05, 1.12, 0], size: [0.025, 0.07, 0.025], color: "dark" },
        { geo: "sphere", pos: [-0.09, 0.92, 0.16], size: [0.04], color: "eye" },
        { geo: "sphere", pos: [0.09, 0.92, 0.16], size: [0.04], color: "eye" },
        { geo: "cone", pos: [0, 0.82, 0.2], size: [0.05, 0.08, 4], color: "beak", rot: [Math.PI/2, 0, 0] },
        { geo: "box", pos: [-0.08, 0.0, 0.04], size: [0.08, 0.04, 0.1], color: "feet" },
        { geo: "box", pos: [0.08, 0.0, 0.04], size: [0.08, 0.04, 0.1], color: "feet" },
    ],
};

CHARACTER_MODELS.droplet = {
    palette: { body: 0x00d2ff, dark: 0x0088aa, eye: 0x111111 },
    parts: [
        { geo: "sphere", pos: [0, 0.45, 0], size: [0.3], color: "body" },
        { geo: "box", pos: [0, 0.75, 0], size: [0.22, 0.22, 0.2], color: "body" },
        { geo: "cone", pos: [0, 1.05, 0], size: [0.15, 0.2, 8], color: "body" },
        { geo: "sphere", pos: [-0.08, 0.5, 0.28], size: [0.04], color: "eye" },
        { geo: "sphere", pos: [0.08, 0.5, 0.28], size: [0.04], color: "eye" },
    ],
};

// Aliases for skins that reuse models
CHARACTER_MODELS.astronaut = CHARACTER_MODELS.droplet;
CHARACTER_MODELS.ninja = CHARACTER_MODELS.fox;
CHARACTER_MODELS.skateboard = CHARACTER_MODELS.bunny;
CHARACTER_MODELS.skis = CHARACTER_MODELS.penguin;
CHARACTER_MODELS.hoverboard = CHARACTER_MODELS.chick;


// ==============================
// SkinRenderer Class
// ==============================

export class SkinRenderer {
    constructor(size = 128) {
        this.size = size;
        this.frames = 64; // number of rotation angles
        this.cache = {}; // skinId -> [canvas, canvas, ...]
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.ready = false;
    }

    /** Initialize Three.js scene */
    init() {
        this.scene = new THREE.Scene();

        // Camera: 30 degrees above, looking slightly down
        this.camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
        this.camera.position.set(0, 2.2, 4.5);
        this.camera.lookAt(0, 0.55, 0);

        // Lighting
        const ambient = new THREE.AmbientLight(0xffffff, 0.65);
        this.scene.add(ambient);

        const dirLight = new THREE.DirectionalLight(0xffffff, 0.7);
        dirLight.position.set(3, 5, 4);
        this.scene.add(dirLight);

        const fillLight = new THREE.DirectionalLight(0xaaccff, 0.3);
        fillLight.position.set(-2, 1, -1);
        this.scene.add(fillLight);

        // Renderer (offscreen)
        this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        this.renderer.setSize(this.size, this.size);
        this.renderer.setClearColor(0x000000, 0);

        this.ready = true;
        return this;
    }

    /** Build a THREE.Group from a character model definition */
    buildModel(modelDef, playerColor = null) {
        const group = new THREE.Group();
        const palette = modelDef.palette;

        for (const part of modelDef.parts) {
            let geometry;
            switch (part.geo) {
                case "box":
                    geometry = new THREE.BoxGeometry(part.size[0], part.size[1], part.size[2]);
                    break;
                case "sphere":
                    geometry = new THREE.SphereGeometry(part.size[0], 12, 8);
                    break;
                case "cylinder":
                    geometry = new THREE.CylinderGeometry(part.size[0], part.size[1], part.size[2], 8);
                    break;
                case "cone":
                    geometry = new THREE.ConeGeometry(part.size[0], part.size[1], part.size[2] || 8);
                    break;
                default:
                    geometry = new THREE.BoxGeometry(0.1, 0.1, 0.1);
            }

            let colorHex = palette[part.color] || 0xcccccc;
            if (part.color === "body" && playerColor) {
                colorHex = playerColor;
            }

            const material = new THREE.MeshLambertMaterial({ color: colorHex });
            const mesh = new THREE.Mesh(geometry, material);
            mesh.position.set(part.pos[0], part.pos[1], part.pos[2]);

            if (part.rot) {
                mesh.rotation.set(part.rot[0], part.rot[1], part.rot[2]);
            }

            group.add(mesh);
        }

        return group;
    }

    /** Pre-render a single character at all angles, return array of canvases */
    preRenderSkin(skinId, playerColor = null) {
        const modelDef = CHARACTER_MODELS[skinId];
        if (!modelDef) return null;

        const group = this.buildModel(modelDef, playerColor);
        this.scene.add(group);

        const frames = [];
        for (let i = 0; i < this.frames; i++) {
            group.rotation.y = (i / this.frames) * Math.PI * 2;
            this.renderer.render(this.scene, this.camera);

            // Capture to canvas
            const canvas = document.createElement("canvas");
            canvas.width = this.size;
            canvas.height = this.size;
            canvas.getContext("2d").drawImage(this.renderer.domElement, 0, 0);
            frames.push(canvas);
        }

        this.scene.remove(group);
        // Dispose geometry/materials
        group.traverse(obj => {
            if (obj.geometry) obj.geometry.dispose();
            if (obj.material) obj.material.dispose();
        });

        this.cache[skinId] = frames;
        return frames;
    }

    /** Pre-render all skins */
    preRenderAll(playerColor = null) {
        const skins = Object.keys(CHARACTER_MODELS);
        for (const skinId of skins) {
            this.preRenderSkin(skinId, playerColor);
        }
        return this.cache;
    }

    /** Draw a cached sprite frame to a 2D context */
    draw(ctx, x, y, r, angle, skinId) {
        const frames = this.cache[skinId];
        if (!frames) return;

        const a = ((angle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
        const frameIdx = Math.floor(a / (Math.PI * 2) * this.frames) % this.frames;
        const sprite = frames[frameIdx];
        if (sprite) {
            ctx.drawImage(sprite, x - r, y - r, r * 2, r * 2);
        }
    }

    /** Render a single frame at given angle (for live preview) */
    renderLive(skinId, angle, playerColor = null) {
        const modelDef = CHARACTER_MODELS[skinId];
        if (!modelDef) return null;

        const group = this.buildModel(modelDef, playerColor);
        this.scene.add(group);
        group.rotation.y = angle;
        this.renderer.render(this.scene, this.camera);
        this.scene.remove(group);
        group.traverse(obj => {
            if (obj.geometry) obj.geometry.dispose();
            if (obj.material) obj.material.dispose();
        });
        return this.renderer.domElement;
    }

    /** Get the WebGL canvas element (for attaching to DOM) */
    getCanvas() {
        return this.renderer ? this.renderer.domElement : null;
    }

    /** Dispose all resources */
    dispose() {
        if (this.renderer) {
            this.renderer.dispose();
            this.renderer = null;
        }
        this.cache = {};
        this.ready = false;
    }
}

// Export model list for tests
export { CHARACTER_MODELS };

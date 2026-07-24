/**
 * skin-prerender.js - Pre-renders 3D characters using Three.js into sprite cache.
 * Non-module version for use with regular <script> tags.
 * Requires THREE to be loaded globally before this script.
 * 
 * Usage:
 *   const prerenderer = new SkinPrerenderer();
 *   await prerenderer.init(); // sets up Three.js
 *   await prerenderer.renderAll(); // caches all skins at 64 angles
 *   prerenderer.draw(ctx, x, y, r, angle, skinId); // draws cached sprite
 */

const CHAR_MODELS = {
bunny: {
    palette: { body: 0xffffff, belly: 0xffccdd, accent: 0xffaacc, dark: 0xdddddd, eye: 0x111111, eye_w: 0xffffff, nose: 0xff6688 },
    parts: [
        { geo: "box", pos: [0, 0.45, 0], size: [0.5, 0.55, 0.45], color: "body" },
        { geo: "box", pos: [0, 0.4, 0.22], size: [0.32, 0.38, 0.08], color: "belly" },
        { geo: "box", pos: [0, 1.0, 0.02], size: [0.42, 0.42, 0.38], color: "body" },
        { geo: "box", pos: [-0.1, 1.5, 0], size: [0.08, 0.38, 0.06], color: "body" },
        { geo: "box", pos: [0.1, 1.5, 0], size: [0.08, 0.38, 0.06], color: "body" },
        { geo: "box", pos: [-0.1, 1.48, 0.02], size: [0.04, 0.28, 0.02], color: "accent" },
        { geo: "box", pos: [0.1, 1.48, 0.02], size: [0.04, 0.28, 0.02], color: "accent" },
        { geo: "box", pos: [-0.3, 0.5, 0], size: [0.1, 0.25, 0.1], color: "body" },
        { geo: "box", pos: [0.3, 0.5, 0], size: [0.1, 0.25, 0.1], color: "body" },
        { geo: "box", pos: [-0.12, 0.1, 0], size: [0.12, 0.2, 0.14], color: "body" },
        { geo: "box", pos: [0.12, 0.1, 0], size: [0.12, 0.2, 0.14], color: "body" },
        { geo: "box", pos: [-0.12, 0.0, 0.04], size: [0.13, 0.05, 0.16], color: "accent" },
        { geo: "box", pos: [0.12, 0.0, 0.04], size: [0.13, 0.05, 0.16], color: "accent" },
        { geo: "sphere", pos: [0, 0.4, -0.25], size: [0.08], color: "body" },
        { geo: "sphere", pos: [-0.1, 1.05, 0.19], size: [0.07], color: "eye_w" },
        { geo: "sphere", pos: [0.1, 1.05, 0.19], size: [0.07], color: "eye_w" },
        { geo: "sphere", pos: [-0.1, 1.05, 0.24], size: [0.045], color: "eye" },
        { geo: "sphere", pos: [0.1, 1.05, 0.24], size: [0.045], color: "eye" },
        { geo: "sphere", pos: [0, 0.95, 0.2], size: [0.035], color: "nose" },
    ],
},
penguin: {
    palette: { body: 0x1a1a2e, belly: 0xffffff, accent: 0xff8c00, eye: 0xffffff, pupil: 0x111111 },
    parts: [
        { geo: "box", pos: [0, 0.45, 0], size: [0.45, 0.6, 0.4], color: "body" },
        { geo: "box", pos: [0, 0.45, 0.2], size: [0.32, 0.5, 0.1], color: "belly" },
        { geo: "box", pos: [0, 1.0, 0], size: [0.38, 0.38, 0.35], color: "body" },
        { geo: "box", pos: [-0.28, 0.5, 0], size: [0.07, 0.3, 0.15], color: "body", rot: [0, 0, 0.2] },
        { geo: "box", pos: [0.28, 0.5, 0], size: [0.07, 0.3, 0.15], color: "body", rot: [0, 0, -0.2] },
        { geo: "box", pos: [-0.12, 0.0, 0.06], size: [0.14, 0.06, 0.16], color: "accent" },
        { geo: "box", pos: [0.12, 0.0, 0.06], size: [0.14, 0.06, 0.16], color: "accent" },
        { geo: "cone", pos: [0, 0.92, 0.2], size: [0.06, 0.1, 8], color: "accent", rot: [1.57, 0, 0] },
        { geo: "sphere", pos: [-0.1, 1.05, 0.17], size: [0.07], color: "eye" },
        { geo: "sphere", pos: [0.1, 1.05, 0.17], size: [0.07], color: "eye" },
        { geo: "sphere", pos: [-0.1, 1.05, 0.23], size: [0.045], color: "pupil" },
        { geo: "sphere", pos: [0.1, 1.05, 0.23], size: [0.045], color: "pupil" },
    ],
},
fox: {
    palette: { body: 0xf07020, belly: 0xffeebb, dark: 0x222222, eye: 0x111111, eye_w: 0xffffff, accent: 0xffccaa },
    parts: [
        { geo: "box", pos: [0, 0.45, 0], size: [0.45, 0.55, 0.38], color: "body" },
        { geo: "box", pos: [0, 0.4, 0.19], size: [0.28, 0.35, 0.08], color: "belly" },
        { geo: "box", pos: [0, 1.0, 0.03], size: [0.38, 0.35, 0.34], color: "body" },
        { geo: "box", pos: [0, 0.9, 0.2], size: [0.15, 0.1, 0.1], color: "belly" },
        { geo: "cone", pos: [-0.14, 1.3, 0], size: [0.07, 0.16, 4], color: "body" },
        { geo: "cone", pos: [0.14, 1.3, 0], size: [0.07, 0.16, 4], color: "body" },
        { geo: "cone", pos: [-0.14, 1.28, 0.01], size: [0.04, 0.1, 4], color: "accent" },
        { geo: "cone", pos: [0.14, 1.28, 0.01], size: [0.04, 0.1, 4], color: "accent" },
        { geo: "box", pos: [0, 0.35, -0.35], size: [0.12, 0.12, 0.25], color: "body" },
        { geo: "box", pos: [0, 0.35, -0.5], size: [0.08, 0.08, 0.1], color: "belly" },
        { geo: "box", pos: [-0.12, 0.12, 0], size: [0.09, 0.2, 0.09], color: "body" },
        { geo: "box", pos: [0.12, 0.12, 0], size: [0.09, 0.2, 0.09], color: "body" },
        { geo: "box", pos: [-0.12, 0.0, 0.03], size: [0.1, 0.04, 0.12], color: "dark" },
        { geo: "box", pos: [0.12, 0.0, 0.03], size: [0.1, 0.04, 0.12], color: "dark" },
        { geo: "sphere", pos: [-0.1, 1.05, 0.17], size: [0.065], color: "eye_w" },
        { geo: "sphere", pos: [0.1, 1.05, 0.17], size: [0.065], color: "eye_w" },
        { geo: "sphere", pos: [-0.1, 1.05, 0.22], size: [0.04], color: "eye" },
        { geo: "sphere", pos: [0.1, 1.05, 0.22], size: [0.04], color: "eye" },
        { geo: "sphere", pos: [0, 0.92, 0.26], size: [0.03], color: "dark" },
    ],
},
panda: {
    palette: { body: 0x111111, belly: 0xffffff, dark: 0x000000, eye: 0xffffff, pupil: 0x111111, nose: 0x333333 },
    parts: [
        { geo: "box", pos: [0, 0.45, 0], size: [0.5, 0.58, 0.42], color: "body" },
        { geo: "box", pos: [0, 0.4, 0.21], size: [0.34, 0.44, 0.08], color: "belly" },
        { geo: "box", pos: [-0.28, 0.5, 0], size: [0.12, 0.28, 0.12], color: "dark" },
        { geo: "box", pos: [0.28, 0.5, 0], size: [0.12, 0.28, 0.12], color: "dark" },
        { geo: "box", pos: [-0.14, 0.1, 0], size: [0.12, 0.2, 0.12], color: "dark" },
        { geo: "box", pos: [0.14, 0.1, 0], size: [0.12, 0.2, 0.12], color: "dark" },
        { geo: "box", pos: [0, 1.0, 0], size: [0.42, 0.4, 0.38], color: "belly" },
        { geo: "sphere", pos: [-0.18, 1.2, 0], size: [0.09], color: "dark" },
        { geo: "sphere", pos: [0.18, 1.2, 0], size: [0.09], color: "dark" },
        { geo: "box", pos: [-0.1, 1.02, 0.12], size: [0.1, 0.1, 0.04], color: "dark" },
        { geo: "box", pos: [0.1, 1.02, 0.12], size: [0.1, 0.1, 0.04], color: "dark" },
        { geo: "sphere", pos: [-0.1, 1.03, 0.16], size: [0.055], color: "eye" },
        { geo: "sphere", pos: [0.1, 1.03, 0.16], size: [0.055], color: "eye" },
        { geo: "sphere", pos: [-0.1, 1.03, 0.21], size: [0.04], color: "pupil" },
        { geo: "sphere", pos: [0.1, 1.03, 0.21], size: [0.04], color: "pupil" },
        { geo: "sphere", pos: [0, 0.93, 0.2], size: [0.04], color: "nose" },
    ],
},
owl: {
    palette: { body: 0x8B5E3C, belly: 0xb8e8d0, dark: 0x5B3E1C, eye: 0xff8c00, pupil: 0x111111, beak: 0xff9800, disc: 0xf0dcc0 },
    parts: [
        { geo: "box", pos: [0, 0.45, 0], size: [0.42, 0.55, 0.38], color: "body" },
        { geo: "box", pos: [0, 0.38, 0.19], size: [0.28, 0.35, 0.08], color: "belly" },
        { geo: "box", pos: [-0.25, 0.5, 0], size: [0.08, 0.32, 0.14], color: "dark" },
        { geo: "box", pos: [0.25, 0.5, 0], size: [0.08, 0.32, 0.14], color: "dark" },
        { geo: "box", pos: [0, 1.0, 0], size: [0.4, 0.38, 0.35], color: "body" },
        { geo: "cone", pos: [-0.16, 1.3, 0], size: [0.06, 0.14, 4], color: "dark" },
        { geo: "cone", pos: [0.16, 1.3, 0], size: [0.06, 0.14, 4], color: "dark" },
        { geo: "sphere", pos: [-0.11, 1.02, 0.15], size: [0.08], color: "disc" },
        { geo: "sphere", pos: [0.11, 1.02, 0.15], size: [0.08], color: "disc" },
        { geo: "sphere", pos: [-0.11, 1.02, 0.2], size: [0.07], color: "eye" },
        { geo: "sphere", pos: [0.11, 1.02, 0.2], size: [0.07], color: "eye" },
        { geo: "sphere", pos: [-0.11, 1.02, 0.26], size: [0.04], color: "pupil" },
        { geo: "sphere", pos: [0.11, 1.02, 0.26], size: [0.04], color: "pupil" },
        { geo: "cone", pos: [0, 0.9, 0.2], size: [0.04, 0.08, 4], color: "beak", rot: [1.57, 0, 0] },
        { geo: "box", pos: [-0.08, 0.0, 0.04], size: [0.07, 0.05, 0.1], color: "beak" },
        { geo: "box", pos: [0.08, 0.0, 0.04], size: [0.07, 0.05, 0.1], color: "beak" },
    ],
},
frog: {
    palette: { body: 0x2ecc71, belly: 0xa8e6cf, dark: 0x1a7a40, eye_w: 0xffffff, pupil: 0x111111 },
    parts: [
        { geo: "box", pos: [0, 0.3, 0], size: [0.5, 0.35, 0.42], color: "body" },
        { geo: "box", pos: [0, 0.3, 0.2], size: [0.35, 0.25, 0.08], color: "belly" },
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
},
chick: {
    palette: { body: 0xffd700, dark: 0xf0a000, beak: 0xff6600, eye: 0x111111, eye_w: 0xffffff, feet: 0xff8c00 },
    parts: [
        { geo: "box", pos: [0, 0.4, 0], size: [0.4, 0.45, 0.38], color: "body" },
        { geo: "box", pos: [0, 0.88, 0], size: [0.35, 0.35, 0.32], color: "body" },
        { geo: "box", pos: [-0.22, 0.45, 0], size: [0.06, 0.2, 0.12], color: "body" },
        { geo: "box", pos: [0.22, 0.45, 0], size: [0.06, 0.2, 0.12], color: "body" },
        { geo: "box", pos: [0, 1.15, 0], size: [0.03, 0.1, 0.03], color: "dark" },
        { geo: "box", pos: [-0.05, 1.12, 0], size: [0.025, 0.07, 0.025], color: "dark" },
        { geo: "box", pos: [0.05, 1.12, 0], size: [0.025, 0.07, 0.025], color: "dark" },
        { geo: "sphere", pos: [-0.09, 0.92, 0.16], size: [0.06], color: "eye_w" },
        { geo: "sphere", pos: [0.09, 0.92, 0.16], size: [0.06], color: "eye_w" },
        { geo: "sphere", pos: [-0.09, 0.92, 0.2], size: [0.035], color: "eye" },
        { geo: "sphere", pos: [0.09, 0.92, 0.2], size: [0.035], color: "eye" },
        { geo: "cone", pos: [0, 0.82, 0.2], size: [0.05, 0.08, 4], color: "beak", rot: [1.57, 0, 0] },
        { geo: "box", pos: [-0.08, 0.0, 0.04], size: [0.08, 0.04, 0.1], color: "feet" },
        { geo: "box", pos: [0.08, 0.0, 0.04], size: [0.08, 0.04, 0.1], color: "feet" },
    ],
},
droplet: {
    palette: { body: 0x00d2ff, eye: 0x111111, eye_w: 0xffffff },
    parts: [
        { geo: "sphere", pos: [0, 0.5, 0], size: [0.4], color: "body" },
        { geo: "sphere", pos: [-0.12, 0.6, 0.32], size: [0.08], color: "eye_w" },
        { geo: "sphere", pos: [0.12, 0.6, 0.32], size: [0.08], color: "eye_w" },
        { geo: "sphere", pos: [-0.12, 0.6, 0.36], size: [0.05], color: "eye" },
        { geo: "sphere", pos: [0.12, 0.6, 0.36], size: [0.05], color: "eye" },
    ],
},
};

// Aliases
CHAR_MODELS.skateboard = {
    palette: { body: 0x3498db, belly: 0xf0f0f0, dark: 0x222222, eye: 0x111111, eye_w: 0xffffff, hair: 0xf39c12, board: 0xc0392b, wheel: 0x333333 },
    parts: [
        { geo: "box", pos: [0, 0.5, 0], size: [0.4, 0.45, 0.3], color: "body" },
        { geo: "box", pos: [0, 0.45, 0.1], size: [0.22, 0.25, 0.06], color: "belly" },
        { geo: "box", pos: [0, 1.0, 0], size: [0.32, 0.32, 0.28], color: "belly" },
        { geo: "box", pos: [0, 1.22, 0], size: [0.28, 0.12, 0.24], color: "hair" },
        { geo: "box", pos: [-0.2, 0.55, 0], size: [0.08, 0.22, 0.08], color: "body" },
        { geo: "box", pos: [0.2, 0.55, 0], size: [0.08, 0.22, 0.08], color: "body" },
        { geo: "box", pos: [-0.1, 0.1, 0], size: [0.1, 0.2, 0.1], color: "dark" },
        { geo: "box", pos: [0.1, 0.1, 0], size: [0.1, 0.2, 0.1], color: "dark" },
        { geo: "sphere", pos: [-0.08, 1.02, 0.14], size: [0.05], color: "eye_w" },
        { geo: "sphere", pos: [0.08, 1.02, 0.14], size: [0.05], color: "eye_w" },
        { geo: "sphere", pos: [-0.08, 1.02, 0.17], size: [0.03], color: "eye" },
        { geo: "sphere", pos: [0.08, 1.02, 0.17], size: [0.03], color: "eye" },
        { geo: "box", pos: [0, -0.05, 0], size: [0.12, 0.03, 0.45], color: "board" },
        { geo: "sphere", pos: [0, -0.06, 0.15], size: [0.03], color: "wheel" },
        { geo: "sphere", pos: [0, -0.06, -0.15], size: [0.03], color: "wheel" },
    ],
};

CHAR_MODELS.hoverboard = {
    palette: { body: 0x2c3e50, belly: 0x2c3e50, dark: 0x1a252f, eye: 0x00ffcc, eye_w: 0xffffff, glow: 0x00d2ff, board: 0x7b2ff7 },
    parts: [
        { geo: "box", pos: [0, 0.6, 0], size: [0.38, 0.45, 0.3], color: "body" },
        { geo: "box", pos: [0, 1.05, 0], size: [0.3, 0.3, 0.26], color: "body" },
        { geo: "box", pos: [0, 1.22, 0], size: [0.32, 0.05, 0.28], color: "glow" },
        { geo: "box", pos: [-0.22, 0.65, 0], size: [0.07, 0.2, 0.08], color: "body" },
        { geo: "box", pos: [0.22, 0.65, 0], size: [0.07, 0.2, 0.08], color: "body" },
        { geo: "box", pos: [-0.1, 0.2, 0], size: [0.09, 0.25, 0.09], color: "dark" },
        { geo: "box", pos: [0.1, 0.2, 0], size: [0.09, 0.25, 0.09], color: "dark" },
        { geo: "sphere", pos: [-0.08, 1.08, 0.13], size: [0.05], color: "eye_w" },
        { geo: "sphere", pos: [0.08, 1.08, 0.13], size: [0.05], color: "eye_w" },
        { geo: "sphere", pos: [-0.08, 1.08, 0.16], size: [0.035], color: "eye" },
        { geo: "sphere", pos: [0.08, 1.08, 0.16], size: [0.035], color: "eye" },
        { geo: "box", pos: [0, 0.0, 0], size: [0.15, 0.04, 0.5], color: "board" },
        { geo: "box", pos: [0, -0.02, 0], size: [0.12, 0.02, 0.45], color: "glow" },
    ],
};

CHAR_MODELS.skis = {
    palette: { body: 0xe74c3c, belly: 0xf0f0f0, dark: 0x222222, eye: 0x111111, eye_w: 0xffffff, ski: 0x1e90ff, pole: 0x888888 },
    parts: [
        { geo: "box", pos: [0, 0.5, 0], size: [0.42, 0.48, 0.32], color: "body" },
        { geo: "box", pos: [0, 0.45, 0.1], size: [0.24, 0.28, 0.06], color: "belly" },
        { geo: "box", pos: [0, 1.0, 0], size: [0.32, 0.32, 0.28], color: "belly" },
        { geo: "sphere", pos: [0, 1.2, 0], size: [0.15], color: "body" },
        { geo: "box", pos: [-0.24, 0.6, 0], size: [0.06, 0.18, 0.06], color: "body" },
        { geo: "box", pos: [0.24, 0.6, 0], size: [0.06, 0.18, 0.06], color: "body" },
        { geo: "box", pos: [-0.1, 0.12, 0], size: [0.09, 0.22, 0.09], color: "dark" },
        { geo: "box", pos: [0.1, 0.12, 0], size: [0.09, 0.22, 0.09], color: "dark" },
        { geo: "sphere", pos: [-0.08, 1.02, 0.14], size: [0.04], color: "eye_w" },
        { geo: "sphere", pos: [0.08, 1.02, 0.14], size: [0.04], color: "eye_w" },
        { geo: "sphere", pos: [-0.08, 1.02, 0.17], size: [0.03], color: "eye" },
        { geo: "sphere", pos: [0.08, 1.02, 0.17], size: [0.03], color: "eye" },
        { geo: "box", pos: [-0.08, -0.02, 0], size: [0.04, 0.02, 0.55], color: "ski" },
        { geo: "box", pos: [0.08, -0.02, 0], size: [0.04, 0.02, 0.55], color: "ski" },
        { geo: "cylinder", pos: [-0.3, 0.4, 0], size: [0.01, 0.01, 0.9], color: "pole" },
        { geo: "cylinder", pos: [0.3, 0.4, 0], size: [0.01, 0.01, 0.9], color: "pole" },
    ],
};

CHAR_MODELS.ninja = {
    palette: { body: 0x2f3542, belly: 0x2f3542, dark: 0x111111, eye: 0xffffff, eye_w: 0x2f3542, band: 0xff4757, sword: 0xcccccc },
    parts: [
        { geo: "box", pos: [0, 0.5, 0], size: [0.42, 0.5, 0.32], color: "body" },
        { geo: "box", pos: [0, 1.0, 0], size: [0.32, 0.32, 0.28], color: "body" },
        { geo: "box", pos: [0, 1.05, 0.02], size: [0.34, 0.08, 0.3], color: "band" },
        { geo: "box", pos: [0.2, 1.05, -0.12], size: [0.04, 0.04, 0.12], color: "band" },
        { geo: "box", pos: [-0.22, 0.5, 0], size: [0.08, 0.24, 0.08], color: "body" },
        { geo: "box", pos: [0.22, 0.5, 0], size: [0.08, 0.24, 0.08], color: "body" },
        { geo: "box", pos: [-0.1, 0.1, 0], size: [0.1, 0.2, 0.1], color: "dark" },
        { geo: "box", pos: [0.1, 0.1, 0], size: [0.1, 0.2, 0.1], color: "dark" },
        { geo: "sphere", pos: [-0.08, 1.04, 0.14], size: [0.04], color: "eye" },
        { geo: "sphere", pos: [0.08, 1.04, 0.14], size: [0.04], color: "eye" },
        { geo: "box", pos: [0.05, 0.6, -0.2], size: [0.02, 0.02, 0.35], color: "sword" },
        { geo: "box", pos: [0.05, 0.6, -0.36], size: [0.04, 0.08, 0.02], color: "dark" },
    ],
};

CHAR_MODELS.astronaut = {
    palette: { body: 0xeeeeee, belly: 0xcccccc, dark: 0x666666, eye: 0x44aaff, eye_w: 0x222244, visor: 0x3399ff, pack: 0x888888 },
    parts: [
        { geo: "box", pos: [0, 0.5, 0], size: [0.45, 0.5, 0.35], color: "body" },
        { geo: "box", pos: [0, 0.45, 0.1], size: [0.2, 0.2, 0.06], color: "dark" },
        { geo: "sphere", pos: [0, 1.05, 0], size: [0.25], color: "body" },
        { geo: "box", pos: [0, 1.02, 0.15], size: [0.2, 0.15, 0.06], color: "visor" },
        { geo: "sphere", pos: [-0.06, 1.04, 0.19], size: [0.03], color: "eye" },
        { geo: "sphere", pos: [0.06, 1.04, 0.19], size: [0.03], color: "eye" },
        { geo: "box", pos: [-0.28, 0.55, 0], size: [0.1, 0.22, 0.1], color: "body" },
        { geo: "box", pos: [0.28, 0.55, 0], size: [0.1, 0.22, 0.1], color: "body" },
        { geo: "box", pos: [-0.12, 0.1, 0], size: [0.1, 0.2, 0.1], color: "body" },
        { geo: "box", pos: [0.12, 0.1, 0], size: [0.1, 0.2, 0.1], color: "body" },
        { geo: "box", pos: [0, 0.5, -0.2], size: [0.2, 0.3, 0.12], color: "pack" },
    ],
};

CHAR_MODELS.pirate = {
    palette: { body: 0x8B4513, belly: 0xf5deb3, dark: 0x222222, eye: 0x111111, eye_w: 0xffffff, hat: 0x1a1a1a, gold: 0xffd700, patch: 0x111111 },
    parts: [
        { geo: "box", pos: [0, 0.5, 0], size: [0.42, 0.48, 0.32], color: "body" },
        { geo: "box", pos: [0, 0.45, 0.1], size: [0.24, 0.28, 0.06], color: "belly" },
        { geo: "box", pos: [0, 1.0, 0.02], size: [0.32, 0.32, 0.28], color: "belly" },
        { geo: "box", pos: [0, 1.25, 0], size: [0.36, 0.12, 0.32], color: "hat" },
        { geo: "box", pos: [0, 1.32, 0], size: [0.2, 0.12, 0.2], color: "hat" },
        { geo: "box", pos: [0, 1.32, 0.1], size: [0.06, 0.06, 0.02], color: "gold" },
        { geo: "box", pos: [-0.22, 0.5, 0], size: [0.08, 0.22, 0.08], color: "body" },
        { geo: "box", pos: [0.22, 0.5, 0], size: [0.08, 0.22, 0.08], color: "body" },
        { geo: "box", pos: [-0.1, 0.1, 0], size: [0.1, 0.2, 0.1], color: "dark" },
        { geo: "box", pos: [0.1, 0.1, 0], size: [0.1, 0.2, 0.1], color: "dark" },
        { geo: "sphere", pos: [-0.08, 1.03, 0.15], size: [0.05], color: "eye_w" },
        { geo: "sphere", pos: [-0.08, 1.03, 0.18], size: [0.03], color: "eye" },
        { geo: "box", pos: [0.08, 1.02, 0.14], size: [0.05, 0.05, 0.02], color: "patch" },
    ],
};

CHAR_MODELS.dog = {
    palette: { body: 0xc68642, belly: 0xf5deb3, dark: 0x8B5E3C, eye: 0x111111, eye_w: 0xffffff, nose: 0x222222, tongue: 0xff6b81 },
    parts: [
        { geo: "box", pos: [0, 0.45, 0], size: [0.44, 0.5, 0.36], color: "body" },
        { geo: "box", pos: [0, 0.4, 0.12], size: [0.26, 0.3, 0.08], color: "belly" },
        { geo: "box", pos: [0, 0.95, 0.04], size: [0.34, 0.34, 0.3], color: "body" },
        { geo: "box", pos: [0, 0.85, 0.18], size: [0.18, 0.12, 0.08], color: "belly" },
        { geo: "box", pos: [-0.18, 1.18, -0.02], size: [0.1, 0.14, 0.06], color: "dark" },
        { geo: "box", pos: [0.18, 1.18, -0.02], size: [0.1, 0.14, 0.06], color: "dark" },
        { geo: "box", pos: [-0.12, 0.1, 0], size: [0.09, 0.2, 0.09], color: "body" },
        { geo: "box", pos: [0.12, 0.1, 0], size: [0.09, 0.2, 0.09], color: "body" },
        { geo: "box", pos: [0, 0.5, -0.25], size: [0.06, 0.06, 0.18], color: "body" },
        { geo: "sphere", pos: [-0.09, 1.0, 0.15], size: [0.06], color: "eye_w" },
        { geo: "sphere", pos: [0.09, 1.0, 0.15], size: [0.06], color: "eye_w" },
        { geo: "sphere", pos: [-0.09, 1.0, 0.19], size: [0.035], color: "eye" },
        { geo: "sphere", pos: [0.09, 1.0, 0.19], size: [0.035], color: "eye" },
        { geo: "sphere", pos: [0, 0.88, 0.22], size: [0.04], color: "nose" },
        { geo: "box", pos: [0, 0.8, 0.2], size: [0.03, 0.06, 0.02], color: "tongue" },
    ],
};

CHAR_MODELS.cat = {
    palette: { body: 0x555555, belly: 0xf0f0f0, dark: 0x333333, eye: 0x44dd44, eye_w: 0xffffff, nose: 0xffaaaa, ear: 0xff88aa },
    parts: [
        { geo: "box", pos: [0, 0.45, 0], size: [0.4, 0.48, 0.32], color: "body" },
        { geo: "box", pos: [0, 0.4, 0.1], size: [0.24, 0.28, 0.06], color: "belly" },
        { geo: "box", pos: [0, 0.95, 0.02], size: [0.34, 0.32, 0.3], color: "body" },
        { geo: "cone", pos: [-0.14, 1.2, 0], size: [0.06, 0.14, 4], color: "body" },
        { geo: "cone", pos: [0.14, 1.2, 0], size: [0.06, 0.14, 4], color: "body" },
        { geo: "cone", pos: [-0.14, 1.18, 0.01], size: [0.035, 0.08, 4], color: "ear" },
        { geo: "cone", pos: [0.14, 1.18, 0.01], size: [0.035, 0.08, 4], color: "ear" },
        { geo: "box", pos: [-0.12, 0.1, 0], size: [0.08, 0.18, 0.08], color: "body" },
        { geo: "box", pos: [0.12, 0.1, 0], size: [0.08, 0.18, 0.08], color: "body" },
        { geo: "box", pos: [0.05, 0.5, -0.25], size: [0.04, 0.04, 0.3], color: "dark" },
        { geo: "sphere", pos: [-0.09, 0.98, 0.15], size: [0.06], color: "eye_w" },
        { geo: "sphere", pos: [0.09, 0.98, 0.15], size: [0.06], color: "eye_w" },
        { geo: "sphere", pos: [-0.09, 0.98, 0.19], size: [0.04], color: "eye" },
        { geo: "sphere", pos: [0.09, 0.98, 0.19], size: [0.04], color: "eye" },
        { geo: "sphere", pos: [0, 0.88, 0.17], size: [0.03], color: "nose" },
    ],
};

class SkinPrerenderer {
    constructor(size) {
        this.size = size || 128;
        this.frames = 64;
        this.cache = {};
        this.ready = false;
    }

    init() {
        if (typeof THREE === "undefined") {
            console.error("SkinPrerenderer: THREE not loaded");
            return false;
        }
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
        this.camera.position.set(0, 2.2, 4.5);
        this.camera.lookAt(0, 0.55, 0);

        this.scene.add(new THREE.AmbientLight(0xffffff, 0.65));
        var dir = new THREE.DirectionalLight(0xffffff, 0.7);
        dir.position.set(3, 5, 4);
        this.scene.add(dir);
        var fill = new THREE.DirectionalLight(0xaaccff, 0.3);
        fill.position.set(-2, 1, -1);
        this.scene.add(fill);

        this.glRenderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        this.glRenderer.setSize(this.size, this.size);
        this.glRenderer.setClearColor(0x000000, 0);

        this.ready = true;
        return true;
    }

    buildModel(modelDef, playerColor) {
        var group = new THREE.Group();
        var palette = modelDef.palette;
        for (var i = 0; i < modelDef.parts.length; i++) {
            var part = modelDef.parts[i];
            var geometry;
            if (part.geo === "box") geometry = new THREE.BoxGeometry(part.size[0], part.size[1], part.size[2]);
            else if (part.geo === "sphere") geometry = new THREE.SphereGeometry(part.size[0], 12, 8);
            else if (part.geo === "cone") geometry = new THREE.ConeGeometry(part.size[0], part.size[1], part.size[2] || 8);
            else if (part.geo === "cylinder") geometry = new THREE.CylinderGeometry(part.size[0], part.size[1], part.size[2], 8);
            else geometry = new THREE.BoxGeometry(0.1, 0.1, 0.1);

            var colorHex = palette[part.color] !== undefined ? palette[part.color] : 0xcccccc;
            if (part.color === "body" && playerColor) colorHex = playerColor;

            var material = new THREE.MeshLambertMaterial({ color: colorHex });
            var mesh = new THREE.Mesh(geometry, material);
            mesh.position.set(part.pos[0], part.pos[1], part.pos[2]);
            if (part.rot) mesh.rotation.set(part.rot[0], part.rot[1], part.rot[2]);
            group.add(mesh);
        }
        return group;
    }

    preRenderSkin(skinId, playerColor) {
        var modelDef = CHAR_MODELS[skinId];
        if (!modelDef) return null;
        var group = this.buildModel(modelDef, playerColor);
        this.scene.add(group);
        var frames = [];
        for (var i = 0; i < this.frames; i++) {
            group.rotation.y = (i / this.frames) * Math.PI * 2;
            this.glRenderer.render(this.scene, this.camera);
            var c = document.createElement("canvas");
            c.width = c.height = this.size;
            c.getContext("2d").drawImage(this.glRenderer.domElement, 0, 0);
            frames.push(c);
        }
        this.scene.remove(group);
        group.traverse(function(obj) { if (obj.geometry) obj.geometry.dispose(); if (obj.material) obj.material.dispose(); });
        this.cache[skinId] = frames;
        return frames;
    }

    renderAll(playerColor) {
        for (var key in CHAR_MODELS) {
            if (CHAR_MODELS.hasOwnProperty(key)) {
                this.preRenderSkin(key, playerColor);
            }
        }
    }

    draw(ctx, x, y, r, angle, skinId) {
        var frames = this.cache[skinId];
        if (!frames) return false;
        // Map game angle to sprite frame:
        // game: right=0, down=PI/2, left=PI, up=3PI/2
        // We want: moving down = facing camera = frame 0
        // Three.js: rotation.y=0 = facing camera (at z=4.5)
        // So offset by -PI/2 and negate for CW->CCW
        var a = ((-angle + Math.PI / 2) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);
        var idx = Math.floor(a / (Math.PI * 2) * this.frames) % this.frames;
        ctx.drawImage(frames[idx], x - r, y - r, r * 2, r * 2);
        return true;
    }

    dispose() {
        if (this.glRenderer) { this.glRenderer.dispose(); this.glRenderer = null; }
        this.cache = {};
        this.ready = false;
    }
}

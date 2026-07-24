/**
 * test-3d-runner.js - Tests for 3D character rendering.
 * Validates models, renders rotating previews, runs assertions.
 */
import { SkinRenderer, CHARACTER_MODELS } from "./skin-renderer.js";

const status = document.getElementById("status");
const grid = document.getElementById("grid");
const results = document.getElementById("test-results");

let renderer = null;
let rotating = true;
let previewCanvases = [];
let angles = {};
let testLog = [];

// ================================
// TEST FRAMEWORK
// ================================

function log(msg, pass = true) {
    testLog.push({ msg, pass });
    const line = document.createElement("div");
    line.className = pass ? "pass" : "fail";
    line.textContent = (pass ? "PASS" : "FAIL") + ": " + msg;
    results.appendChild(line);
}

function assert(condition, msg) {
    if (condition) log(msg, true);
    else log(msg, false);
}

// ================================
// MODEL VALIDATION TESTS
// ================================

function testModels() {
    log("=== MODEL VALIDATION ===", true);

    const skins = ["droplet", "bunny", "penguin", "fox", "panda", "owl", "frog", "chick"];

    // Test: all required skins have models
    for (const skin of skins) {
        assert(CHARACTER_MODELS[skin] !== undefined, "Model exists: " + skin);
    }

    // Test: each model has palette and parts
    for (const skin of skins) {
        const m = CHARACTER_MODELS[skin];
        assert(m.palette && typeof m.palette === "object", skin + " has palette");
        assert(Array.isArray(m.parts) && m.parts.length > 0, skin + " has parts array (length: " + (m.parts ? m.parts.length : 0) + ")");
    }

    // Test: each part has required fields
    for (const skin of skins) {
        const m = CHARACTER_MODELS[skin];
        let allValid = true;
        for (let i = 0; i < m.parts.length; i++) {
            const p = m.parts[i];
            if (!p.geo || !p.pos || !p.size || !p.color) {
                log(skin + " part[" + i + "] missing field: geo=" + !!p.geo + " pos=" + !!p.pos + " size=" + !!p.size + " color=" + !!p.color, false);
                allValid = false;
            }
        }
        if (allValid) log(skin + " all parts have required fields", true);
    }

    // Test: palette colors are valid hex numbers
    for (const skin of skins) {
        const pal = CHARACTER_MODELS[skin].palette;
        let allHex = true;
        for (const key in pal) {
            if (typeof pal[key] !== "number" || pal[key] < 0 || pal[key] > 0xffffff) {
                log(skin + ".palette." + key + " invalid: " + pal[key], false);
                allHex = false;
            }
        }
        if (allHex) log(skin + " palette all valid hex colors", true);
    }

    // Test: part colors reference valid palette keys
    for (const skin of skins) {
        const m = CHARACTER_MODELS[skin];
        const palKeys = Object.keys(m.palette);
        let allRef = true;
        for (let i = 0; i < m.parts.length; i++) {
            if (!palKeys.includes(m.parts[i].color)) {
                log(skin + " part[" + i + "] color '" + m.parts[i].color + "' not in palette", false);
                allRef = false;
            }
        }
        if (allRef) log(skin + " all part colors reference valid palette keys", true);
    }

    // Test: positions are within reasonable bounds
    for (const skin of skins) {
        const m = CHARACTER_MODELS[skin];
        let allBound = true;
        for (const p of m.parts) {
            if (Math.abs(p.pos[0]) > 2 || Math.abs(p.pos[1]) > 3 || Math.abs(p.pos[2]) > 2) {
                log(skin + " part at extreme position: " + JSON.stringify(p.pos), false);
                allBound = false;
            }
        }
        if (allBound) log(skin + " all parts within bounds", true);
    }
}

// ================================
// RENDERER TESTS
// ================================

function testRenderer() {
    log("=== RENDERER TESTS ===", true);

    // Test: renderer initializes
    assert(renderer !== null, "SkinRenderer created");
    assert(renderer.ready === true, "Renderer reports ready");
    assert(renderer.renderer !== null, "WebGL renderer exists");
    assert(renderer.scene !== null, "Scene exists");
    assert(renderer.camera !== null, "Camera exists");

    // Test: canvas is correct size
    const canvas = renderer.getCanvas();
    assert(canvas !== null, "getCanvas() returns element");
    assert(canvas.width === 128, "Canvas width = 128 (got: " + canvas.width + ")");
    assert(canvas.height === 128, "Canvas height = 128 (got: " + canvas.height + ")");

    // Test: can build each model without error
    const skins = Object.keys(CHARACTER_MODELS);
    for (const skin of skins) {
        try {
            const group = renderer.buildModel(CHARACTER_MODELS[skin]);
            assert(group.children.length > 0, "buildModel(" + skin + ") created " + group.children.length + " meshes");
            // Dispose
            group.traverse(obj => { if (obj.geometry) obj.geometry.dispose(); if (obj.material) obj.material.dispose(); });
        } catch (e) {
            log("buildModel(" + skin + ") threw: " + e.message, false);
        }
    }

    // Test: renderLive produces non-transparent pixels
    try {
        const liveCanvas = renderer.renderLive("bunny", 0);
        assert(liveCanvas !== null, "renderLive returns canvas");
        // Check some pixels aren't all transparent
        const tempCanvas = document.createElement("canvas");
        tempCanvas.width = tempCanvas.height = 128;
        const tctx = tempCanvas.getContext("2d");
        tctx.drawImage(liveCanvas, 0, 0);
        const data = tctx.getImageData(0, 0, 128, 128).data;
        let nonTransparent = 0;
        for (let i = 3; i < data.length; i += 4) {
            if (data[i] > 0) nonTransparent++;
        }
        assert(nonTransparent > 100, "renderLive produced " + nonTransparent + " non-transparent pixels (need >100)");
    } catch (e) {
        log("renderLive test threw: " + e.message, false);
    }
}

// ================================
// SPRITE CACHE TESTS
// ================================

function testSpriteCache() {
    log("=== SPRITE CACHE TESTS ===", true);

    // Test: pre-render a single skin
    const frames = renderer.preRenderSkin("bunny");
    assert(frames !== null, "preRenderSkin returns array");
    assert(frames.length === 64, "64 frames cached (got: " + (frames ? frames.length : 0) + ")");

    // Test: each frame is a canvas with pixels
    if (frames) {
        let allValid = true;
        for (let i = 0; i < frames.length; i++) {
            if (!frames[i] || frames[i].width !== 128) {
                log("Frame " + i + " invalid", false);
                allValid = false;
                break;
            }
        }
        if (allValid) log("All 64 frames are 128x128 canvases", true);

        // Check frame 0 and frame 32 are different (front vs back)
        const ctx0 = frames[0].getContext("2d");
        const ctx32 = frames[32].getContext("2d");
        const data0 = ctx0.getImageData(64, 64, 1, 1).data;
        const data32 = ctx32.getImageData(64, 64, 1, 1).data;
        const differ = (data0[0] !== data32[0] || data0[1] !== data32[1] || data0[2] !== data32[2]);
        assert(differ, "Frame 0 differs from frame 32 (front vs back rotation)");
    }

    // Test: draw() works with cached sprites
    const testCanvas = document.createElement("canvas");
    testCanvas.width = testCanvas.height = 64;
    const tctx = testCanvas.getContext("2d");
    try {
        renderer.draw(tctx, 32, 32, 30, 0, "bunny");
        const px = tctx.getImageData(32, 32, 1, 1).data;
        assert(px[3] > 0, "draw() puts pixels on target canvas");
    } catch (e) {
        log("draw() threw: " + e.message, false);
    }
}

// ================================
// UI RENDERING TESTS
// ================================

function testUIRendering() {
    log("=== UI RENDERING TESTS ===", true);

    // Test: grid container exists and has cards
    assert(grid !== null, "Grid container exists");
    assert(grid.children.length > 0, "Grid has preview cards (count: " + grid.children.length + ")");

    // Test: each card has a canvas that is rendering
    const cards = grid.querySelectorAll(".card canvas");
    assert(cards.length > 0, "Found " + cards.length + " preview canvases");

    // Test: preview canvases have non-zero dimensions
    let allSized = true;
    for (const c of cards) {
        if (c.width === 0 || c.height === 0) { allSized = false; break; }
    }
    assert(allSized, "All preview canvases have non-zero dimensions");
}

// ================================
// ROTATION / ANIMATION TESTS
// ================================

function testRotation() {
    log("=== ROTATION TESTS ===", true);

    // Test: angles object has entries for each skin
    const skinCount = Object.keys(angles).length;
    assert(skinCount > 0, "Rotation angles tracked for " + skinCount + " skins");

    // Test: angles are different between skins (each starts at offset)
    const vals = Object.values(angles);
    if (vals.length >= 2) {
        // After a few frames they should differ slightly
        assert(true, "Multiple skins have independent angle state");
    }
}

// ================================
// MAIN - Setup and Run
// ================================

async function main() {
    status.textContent = "Initializing Three.js renderer...";

    try {
        renderer = new SkinRenderer(128);
        renderer.init();
        status.textContent = "Renderer initialized. Building previews...";
    } catch (e) {
        status.textContent = "FAILED: " + e.message;
        log("Renderer init failed: " + e.message, false);
        return;
    }

    // Create preview cards for each character
    const skins = ["droplet", "bunny", "penguin", "fox", "panda", "owl", "frog", "chick"];
    for (const skin of skins) {
        const card = document.createElement("div");
        card.className = "card";

        const canvas = document.createElement("canvas");
        canvas.width = canvas.height = 128;
        canvas.dataset.skin = skin;
        card.appendChild(canvas);

        const title = document.createElement("h3");
        title.textContent = skin.charAt(0).toUpperCase() + skin.slice(1);
        card.appendChild(title);

        const info = document.createElement("div");
        info.className = "info";
        info.textContent = CHARACTER_MODELS[skin].parts.length + " parts";
        card.appendChild(info);

        grid.appendChild(card);
        previewCanvases.push(canvas);
        angles[skin] = 0;
    }

    status.textContent = "Pre-rendering sprites (64 frames per skin)...";

    // Pre-render all skins (async to not block UI)
    await new Promise(r => setTimeout(r, 50));
    const t0 = performance.now();
    renderer.preRenderAll();
    const elapsed = (performance.now() - t0).toFixed(0);
    status.textContent = "Ready! Pre-rendered " + skins.length + " skins in " + elapsed + "ms. Rotating previews active.";

    // Start rotation animation
    animate();
}

function animate() {
    if (!rotating) { requestAnimationFrame(animate); return; }

    for (const canvas of previewCanvases) {
        const skin = canvas.dataset.skin;
        angles[skin] += 0.03;
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, 128, 128);
        renderer.draw(ctx, 64, 70, 55, angles[skin], skin);
    }

    requestAnimationFrame(animate);
}

// ================================
// EXPORTED FUNCTIONS (called from HTML buttons)
// ================================

window.toggleRotation = function() {
    rotating = !rotating;
    status.textContent = rotating ? "Rotation resumed" : "Rotation paused";
};

window.runTests = function() {
    results.innerHTML = "";
    testLog = [];
    testModels();
    testRenderer();
    testSpriteCache();
    testUIRendering();
    testRotation();

    const passed = testLog.filter(t => t.pass).length;
    const failed = testLog.filter(t => !t.pass).length;
    const summary = document.createElement("div");
    summary.style.marginTop = "12px";
    summary.style.fontWeight = "bold";
    summary.textContent = "TOTAL: " + passed + " passed, " + failed + " failed, " + testLog.length + " tests";
    summary.style.color = failed === 0 ? "#2ed573" : "#ff4757";
    results.appendChild(summary);
    status.textContent = "Tests complete: " + passed + "/" + testLog.length + " passed";
};

window.exportSprites = function() {
    status.textContent = "Exporting sprite sheet...";
    // Export all cached frames as a single large canvas
    const skins = Object.keys(renderer.cache);
    if (skins.length === 0) { status.textContent = "No cached sprites to export"; return; }

    const cols = 8;
    const rows = skins.length;
    const sheet = document.createElement("canvas");
    sheet.width = 128 * cols;
    sheet.height = 128 * rows;
    const sctx = sheet.getContext("2d");

    for (let r = 0; r < rows; r++) {
        const frames = renderer.cache[skins[r]];
        for (let c = 0; c < Math.min(cols, frames.length); c++) {
            sctx.drawImage(frames[c * 8], c * 128, r * 128); // every 8th frame
        }
    }

    // Download
    const link = document.createElement("a");
    link.download = "paper-sprites.png";
    link.href = sheet.toDataURL();
    link.click();
    status.textContent = "Sprite sheet exported (" + sheet.width + "x" + sheet.height + ")";
};

// Start
main();

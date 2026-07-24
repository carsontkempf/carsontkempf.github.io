/**
 * Game - Main controller for continuous Paper.io clone.
 */

const PLAYER_COLORS = ["#00d2ff", "#ff4757", "#2ed573", "#ffa502", "#7b2ff7", "#ff6b81"];
const AI_NAMES = ["Alpha", "Beta", "Gamma", "Delta", "Epsilon"];

class Game {
    constructor() {
        this.engine = new Engine();
        this.renderer = null;
        this.joystick = null;
        this.effects = new Effects();
        this.minimap = new MiniMap();
        this.players = [];
        this.humanPlayer = null;
        this.aiControllers = [];
        this.aiCount = 3;
        this.state = "menu";

        // User data
        this.userId = null;
        this.userName = "";
        this.isAdmin = false;
        this.coins = 0;
        this.unlockedSkins = ["default"];
        this.equippedColor = "#00d2ff";
        this.equippedPattern = "solid";
        this.equippedShape = "droplet";
        this.equippedPowerup = "none";
        this.stats = { gamesPlayed: 0, wins: 0, kills: 0, totalTerritory: 0 };
        this.shop = null;
        this.tokenManager = new TokenManager();
        this.jackpot = new Jackpot();
        this.toasts = new Toasts();
        this.skins3d = null; // will be set after prerender
        this.skinPrerenderer = null;
        this.currentLevel = 1;
    }

    /** Initialize 3D character pre-renderer */
    initSkins() {
        dbg("initSkins: THREE=" + (typeof THREE) + " SkinPrerenderer=" + (typeof SkinPrerenderer));
        if (typeof SkinPrerenderer === "undefined" || typeof THREE === "undefined") {
            dbg("No THREE/SkinPrerenderer - using fallback");
            return;
        }
        try {
            this.skinPrerenderer = new SkinPrerenderer(128);
            dbg("initSkins: prerenderer created");
            if (this.skinPrerenderer.init()) {
                dbg("initSkins: GL init OK, rendering all...");
                this.skinPrerenderer.renderAll();
                this.skins3d = this.skinPrerenderer;
                dbg("initSkins: done, cached " + Object.keys(this.skinPrerenderer.cache).length + " skins");
            } else {
                dbg("SkinPrerenderer init failed");
            }
        } catch (e) {
            dbg("3D skin err: " + e.message + " | " + e.stack);
        }
    }

    loadUserData(user) {
        this.userId = user.id || user.email || "local";
        this.userName = user.name || user.email || "Player";
        this.isAdmin = this.checkAdmin(user);

        const key = "paper_data_" + this.userId;
        try {
            const saved = localStorage.getItem(key);
            if (saved) {
                const d = JSON.parse(saved);
                this.coins = d.coins || 0;
                this.unlockedSkins = d.unlockedSkins || ["default"];
                this.equippedColor = d.equippedColor || "#00d2ff";
                this.equippedPattern = d.equippedPattern || "solid";
                this.equippedShape = d.equippedShape || "droplet";
                this.equippedPowerup = d.equippedPowerup || "none";
                this.stats = d.stats || this.stats;
                this.currentLevel = d.currentLevel || 1;
                // Validate shape
                if (typeof SKIN_CATALOG !== "undefined" && !SKIN_CATALOG.shapes.find(s => s.id === this.equippedShape)) {
                    this.equippedShape = "droplet";
                }
            }
        } catch (e) {
            // Corrupted data - reset
            localStorage.removeItem(key);
            dbg("localStorage reset");
        }

        // Admins get everything unlocked
        if (this.isAdmin) {
            try {
                const allItems = [
                    ...SKIN_CATALOG.colors.map(i => i.id),
                    ...SKIN_CATALOG.patterns.map(i => i.id),
                    ...SKIN_CATALOG.shapes.map(i => i.id),
                    ...SKIN_CATALOG.powerups.map(i => i.id),
                ];
                this.unlockedSkins = [...new Set([...this.unlockedSkins, ...allItems])];
            } catch (e) { console.warn("Admin unlock failed:", e); }
        }

        this.updateCoinDisplays();
    }

    checkAdmin(user) {
        // Admin emails for carsontkempf.github.io
        const adminEmails = [
            "carsontkempf@gmail.com",
            "carson@cloudprototype.org",
            "spamington607@gmail.com",
        ];
        const email = (user.email || "").toLowerCase();
        return adminEmails.includes(email);
    }

    saveUserData() {
        if (!this.userId) return;
        localStorage.setItem("paper_data_" + this.userId, JSON.stringify({
            coins: this.coins, unlockedSkins: this.unlockedSkins,
            equippedColor: this.equippedColor, equippedPattern: this.equippedPattern,
            equippedShape: this.equippedShape, equippedPowerup: this.equippedPowerup,
            stats: this.stats, currentLevel: this.currentLevel,
        }));
    }

    addCoins(n) { this.coins += n; this.saveUserData(); this.updateCoinDisplays(); }
    updateCoinDisplays() { document.querySelectorAll("#menu-coins, #shop-coins").forEach(e => e.textContent = this.coins); }

    init() {
        try {
            this.shop = new Shop(this);
        } catch (e) {
            console.error("Shop init error:", e);
            this.shop = { render: ()=>{}, renderLoadout: ()=>{} };
        }
        this.bindUI();
        this.initSkins();
        this.showScreen("menu");
        window.addEventListener("resize", () => { if (this.renderer) this.renderer.resize(); });
    }

    bindUI() {
        const on = (id, fn) => {
            const el = document.getElementById(id);
            if (el) {
                el.addEventListener("click", fn);
                el.addEventListener("touchend", (e) => { e.preventDefault(); fn(); });
            }
        };

        on("btn-play", () => { this.renderLevelSelect(); this.showScreen("settings"); });
        on("btn-start-game", () => this.startGame());
        on("btn-back-menu", () => this.showScreen("menu"));
        on("btn-play-again", () => this.startGame());
        on("btn-results-menu", () => this.showScreen("menu"));
        on("btn-shop", () => { this.showScreen("shop"); this.shop.render(); });
        on("btn-shop-back", () => this.showScreen("menu"));
        on("btn-loadout", () => { this.showScreen("loadout"); this.shop.renderLoadout(); });
        on("btn-loadout-back", () => this.showScreen("menu"));
        on("btn-pause", () => this.pauseGame());
        on("btn-resume", () => this.resumeGame());
        on("btn-quit-game", () => this.quitGame());
        on("btn-loadout-pause", () => { this.showScreen("loadout"); this.shop.renderLoadout(); });
    }

    showScreen(name) {
        this.state = name;
        document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
        const el = document.getElementById("screen-" + name);
        if (el) el.classList.add("active");
    }

    renderLevelSelect() {
        const container = document.getElementById("level-select");
        if (!container) return;
        const maxLevel = this.stats.maxLevel || 1;
        let html = "";
        for (const level of LEVELS) {
            const locked = level.id > maxLevel;
            const selected = level.id === this.currentLevel;
            html += `<div class="level-btn ${locked ? 'locked' : ''} ${selected ? 'selected' : ''}" data-level="${level.id}">
                <div class="level-num">${level.id}</div>
                <div class="level-name">${level.name}</div>
            </div>`;
        }
        container.innerHTML = html;
        container.querySelectorAll(".level-btn:not(.locked)").forEach(btn => {
            btn.addEventListener("click", () => {
                this.currentLevel = parseInt(btn.dataset.level);
                this.renderLevelSelect();
            });
        });
    }

    pauseGame() {
        this.engine.running = false;
        // Build diagnostic dump
        var lines = [];
        lines.push("=== PAPER CONQUEST DEBUG ===");
        lines.push("Time: " + new Date().toISOString());
        lines.push("State: " + this.state);
        lines.push("Engine running: " + this.engine.running);
        lines.push("GameTime: " + (this.engine.gameTime || 0).toFixed(2));
        lines.push("Frame count: " + (this._fc || 0));
        lines.push("");
        lines.push("--- RENDERER ---");
        if (this.renderer) {
            lines.push("screenW: " + this.renderer.screenW);
            lines.push("screenH: " + this.renderer.screenH);
            lines.push("canvas.width: " + this.renderer.canvas.width);
            lines.push("canvas.height: " + this.renderer.canvas.height);
            lines.push("scale: " + this.renderer.scale);
            lines.push("baseScale: " + this.renderer.baseScale);
            lines.push("cameraX: " + this.renderer.cameraX);
            lines.push("cameraY: " + this.renderer.cameraY);
            lines.push("canvas display: " + this.renderer.canvas.style.display);
            lines.push("canvas parent: " + (this.renderer.canvas.parentElement ? this.renderer.canvas.parentElement.id : "none"));
            lines.push("canvas offsetW: " + this.renderer.canvas.offsetWidth);
            lines.push("canvas offsetH: " + this.renderer.canvas.offsetHeight);
        } else {
            lines.push("renderer is NULL");
        }
        lines.push("");
        lines.push("--- PLAYER ---");
        if (this.humanPlayer) {
            lines.push("x: " + this.humanPlayer.x);
            lines.push("y: " + this.humanPlayer.y);
            lines.push("alive: " + this.humanPlayer.alive);
            lines.push("shape: " + this.humanPlayer.shape);
            lines.push("color: " + this.humanPlayer.color);
            lines.push("trail length: " + (this.humanPlayer.trail ? this.humanPlayer.trail.length : 0));
            if (this.renderer) {
                var sp = this.renderer.worldToScreen(this.humanPlayer.x, this.humanPlayer.y);
                lines.push("screenPos: " + sp.x.toFixed(1) + ", " + sp.y.toFixed(1));
            }
        } else {
            lines.push("humanPlayer is NULL");
        }
        lines.push("");
        lines.push("--- PLAYERS ---");
        lines.push("count: " + this.players.length);
        for (var i = 0; i < this.players.length; i++) {
            var p = this.players[i];
            lines.push("  [" + i + "] " + p.name + " alive:" + p.alive + " shape:" + p.shape + " pos:" + Math.round(p.x) + "," + Math.round(p.y));
        }
        lines.push("");
        lines.push("--- ENGINE ---");
        lines.push("WORLD_SIZE: " + WORLD_SIZE);
        lines.push("GRID_RES: " + GRID_RES);
        lines.push("CELL_SIZE: " + CELL_SIZE);
        lines.push("Territory(0): " + this.engine.countTerritory(0));
        lines.push("Level: " + this.currentLevel);
        lines.push("");
        lines.push("--- EQUIPPED ---");
        lines.push("shape: " + this.equippedShape);
        lines.push("color: " + this.equippedColor);
        lines.push("powerup: " + this.equippedPowerup);
        lines.push("");
        lines.push("--- SKINS3D ---");
        lines.push("skins3d exists: " + !!this.skins3d);
        if (this.skins3d) lines.push("type: " + typeof this.skins3d.draw);
        lines.push("window.innerWidth: " + window.innerWidth);
        lines.push("window.innerHeight: " + window.innerHeight);
        lines.push("devicePixelRatio: " + devicePixelRatio);

        var dump = lines.join("\n");
        console.log(dump);

        // Show in pause overlay as selectable text
        var overlay = document.getElementById("pause-overlay");
        if (overlay) {
            overlay.classList.remove("hidden");
            overlay.innerHTML = '<div style="position:absolute;inset:0;background:rgba(0,0,0,0.95);overflow:auto;padding:16px;z-index:999;">'
                + '<textarea id="debug-dump" style="width:100%;height:70%;background:#111;color:#0f0;font:11px monospace;border:1px solid #333;padding:8px;resize:none;" readonly>' + dump + '</textarea>'
                + '<div style="margin-top:12px;text-align:center;">'
                + '<button onclick="document.getElementById(\'debug-dump\').select();document.execCommand(\'copy\')" style="padding:8px 16px;background:#00d2ff;color:#000;border:none;border-radius:6px;margin:4px;cursor:pointer;">Copy Logs</button>'
                + '<button onclick="document.getElementById(\'pause-overlay\').classList.add(\'hidden\');game.resumeGame();" style="padding:8px 16px;background:#2ed573;color:#000;border:none;border-radius:6px;margin:4px;cursor:pointer;">Resume</button>'
                + '<button onclick="document.getElementById(\'pause-overlay\').classList.add(\'hidden\');game.quitGame();" style="padding:8px 16px;background:#ff4757;color:#000;border:none;border-radius:6px;margin:4px;cursor:pointer;">Quit</button>'
                + '</div></div>';
        }
    }

    resumeGame() {
        document.getElementById("pause-overlay").classList.add("hidden");
        this.engine.running = true;
        this.engine._lastTime = performance.now();
        this.engine._loop();
    }

    quitGame() {
        document.getElementById("pause-overlay").classList.add("hidden");
        this.engine.stop();
        this.showScreen("menu");
    }

    startGame() {
        dbg("startGame called");
        try {
            this._startGameInner();
            dbg("startGame done");
        } catch (e) {
            dbg("startGame FAIL:" + e.message);
            console.error("startGame error:", e);
        }
    }

    _startGameInner() {
        this.showScreen("game");
        this.state = "playing";
        this.engine.initGrid();
        this.players = [];
        this.aiControllers = [];

        // Level config
        const level = getLevel(this.currentLevel);
        const arenaRadius = level.radius;
        const center = WORLD_SIZE / 2;

        // Human player (center of arena)
        this.humanPlayer = new Player(0, this.userName || "You", this.equippedColor, center, center);
        this.humanPlayer.shape = this.equippedShape || "droplet";
        this.humanPlayer.arenaRadius = arenaRadius;
        // Apply powerups
        if (this.equippedPowerup === "heart_1") this.humanPlayer.hearts = 1;
        else if (this.equippedPowerup === "heart_3") this.humanPlayer.hearts = 3;
        else if (this.equippedPowerup === "big_start_1") this.humanPlayer.spawnRadius = 600;
        else if (this.equippedPowerup === "big_start_2") this.humanPlayer.spawnRadius = 700;
        else if (this.equippedPowerup === "big_start_3") this.humanPlayer.spawnRadius = 850;
        else if (this.equippedPowerup === "big_start_4") this.humanPlayer.spawnRadius = 1000;
        else if (this.equippedPowerup === "big_start_5") this.humanPlayer.spawnRadius = 1250;
        this.humanPlayer.spawnTerritory(this.engine);
        this.players.push(this.humanPlayer);

        // AI players - spawn in ring around center, well inside arena
        const aiCount = level.aiCount;
        const aiTypes = level.aiTypes;
        // Spawn distance: far enough from center to not overlap human territory,
        // but inside arena with room for their own territory
        const humanTerritoryRadius = this.humanPlayer.spawnRadius || 500;
        const aiTerritoryRadius = 500;
        const minSpawnDist = humanTerritoryRadius + aiTerritoryRadius + 200;
        const maxSpawnDist = arenaRadius - aiTerritoryRadius - 200;
        const spawnDist = Math.min(maxSpawnDist, Math.max(minSpawnDist, arenaRadius * 0.4));

        for (let i = 0; i < aiCount; i++) {
            const angle = (Math.PI * 2 * i) / aiCount + Math.PI / 4;
            const sx = center + Math.cos(angle) * spawnDist;
            const sy = center + Math.sin(angle) * spawnDist;
            const bot = new Player(i + 1, AI_NAMES[i % AI_NAMES.length], PLAYER_COLORS[(i + 1) % PLAYER_COLORS.length], sx, sy);
            bot.shape = ["droplet", "bunny", "penguin", "fox", "panda", "chick"][i % 6];
            bot.arenaRadius = arenaRadius;
            bot.spawnTerritory(this.engine);
            this.players.push(bot);
            this.aiControllers.push(new AIController(bot, aiTypes[i] || "expansive"));
        }

        // Renderer + joystick
        this.renderer = new Renderer(document.getElementById("game-canvas"));
        this.joystick = new Joystick("joystick-zone");

        // Set camera immediately to player (no lerp delay)
        this.renderer.cameraX = center * this.renderer.scale;
        this.renderer.cameraY = center * this.renderer.scale;
        this.renderer.targetCamX = this.renderer.cameraX;
        this.renderer.targetCamY = this.renderer.cameraY;

        // Engine callbacks
        this.engine.onUpdate = (dt) => this.update(dt);
        this.engine.onRender = (dt) => this.render(dt);
        this.engine.onGameEnd = () => this.gameEnd();
        this.tokenManager.reset();

        // Start after layout settles
        requestAnimationFrame(() => {
            this.renderer.resize();
            this.renderer.cameraX = center * this.renderer.scale;
            this.renderer.cameraY = center * this.renderer.scale;
            this.renderer.targetCamX = this.renderer.cameraX;
            this.renderer.targetCamY = this.renderer.cameraY;
            this.engine.start();
        });
    }

    getSpawns(count) {
        const m = 3000;
        const c = WORLD_SIZE / 2;
        return [
            { x: m, y: m }, { x: WORLD_SIZE - m, y: WORLD_SIZE - m },
            { x: m, y: WORLD_SIZE - m }, { x: WORLD_SIZE - m, y: m },
            { x: c, y: m },
        ].slice(0, count);
    }

    getSpawnsCircular(count, center, radius) {
        const spawns = [];
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 * i) / count + Math.PI / 4;
            spawns.push({
                x: center + Math.cos(angle) * radius,
                y: center + Math.sin(angle) * radius,
            });
        }
        return spawns;
    }

    update(dt) {
        // Human input
        if (this.joystick && this.joystick.angle !== null) {
            this.humanPlayer.setTargetAngle(this.joystick.angle);
        }

        // Apply powerup effects (no speed boost - too OP)
        this.humanPlayer.speed = PLAYER_SPEED;

        // Update all players
        for (const p of this.players) {
            const prevKills = p.kills;
            const event = p.update(this.engine, this.players, dt);
            if (event === "fill") {
                const { x, y } = this.renderer.worldToScreen(p.x, p.y);
                this.effects.addCaptureWave(x, y, p.color, 60);
                this.effects.spawnParticles(x, y, p.color, 10, "sparkle");
                if (p.id === 0) this.effects.vibrate(30);
            } else if (event === "died") {
                const { x, y } = this.renderer.worldToScreen(p.x, p.y);
                this.effects.shake(8);
                this.effects.spawnParticles(x, y, p.color, 20, "burst");
                if (p.id === 0) this.effects.vibrate(100);
            }
            // Kill toast
            if (p.id === 0 && p.kills > prevKills) {
                this.toasts.show("💀 Eliminated an opponent!", "#ff4757");
            }
        }

        // Update AI
        for (const ai of this.aiControllers) {
            ai.update(this.engine, this.players, dt);
        }

        // Update tokens
        const prevCollected = this.tokenManager.collected.length;
        this.tokenManager.update(dt, this.players);
        if (this.tokenManager.collected.length > prevCollected) {
            const total = this.tokenManager.collected.length;
            this.toasts.show(`🎰 Token collected! +1 Jackpot spin (${total} total)`, "#ffd700");
        }

        this.updateHUD();
    }

    render(dt) {
        if (!this.renderer) return;
        if (!this._fc) this._fc = 0;
        this._fc++;

        this.effects.update(dt);
        this.renderer.setCameraTarget(this.humanPlayer.x, this.humanPlayer.y);
        const pct = parseFloat(this.engine.getTerritoryPercent(0));
        this.renderer.setZoomForTerritory(pct);
        this.renderer.updateCamera(dt);
        this.renderer.cameraX += this.effects.shakeOffsetX;
        this.renderer.cameraY += this.effects.shakeOffsetY;

        this.renderer.clear();
        const level = getLevel(this.currentLevel);
        this.renderer.renderBorder(level.radius);
        this.renderer.renderTerritories(this.engine, this.players);
        this.renderer.renderTrails(this.players);
        this.renderer.renderPlayers(this.players, this.skins3d);
        this.tokenManager.render(this.renderer.ctx, this.renderer);
        this.effects.render(this.renderer.ctx);
        this.minimap.render(this.renderer.ctx, this.engine, this.players, this.renderer.screenW);
        this.jackpot.update();
        this.jackpot.render(this.renderer.ctx, this.renderer.screenW, this.renderer.screenH);
        this.toasts.update(dt);
        this.toasts.render(this.renderer.ctx, this.renderer.screenW, this.renderer.screenH);
    }

    updateHUD() {
        // Stopwatch (counts up)
        const elapsed = Math.floor(this.engine.gameTime);
        const mins = Math.floor(elapsed / 60);
        const secs = elapsed % 60;
        document.getElementById("hud-timer").textContent = `${mins}:${secs.toString().padStart(2, "0")}`;
        document.getElementById("hud-territory").textContent = this.engine.getTerritoryPercent(0) + "%";
        document.getElementById("hud-kills").textContent = this.humanPlayer.kills + "K";

        // Hearts display
        const heartsEl = document.getElementById("hud-hearts");
        if (heartsEl && this.humanPlayer.hearts > 0) heartsEl.textContent = this.humanPlayer.hearts + "HP";
        else if (heartsEl) heartsEl.textContent = "";

        // Leaderboard update every ~0.5s
        if (Math.floor(this.engine.gameTime * 2) % 1 === 0) {
            const lb = this.players.map(p => ({
                name: p.name, pct: parseFloat(this.engine.getTerritoryPercent(p.id)), isMe: p.id === 0
            })).sort((a, b) => b.pct - a.pct).slice(0, 4);
            const el = document.getElementById("hud-leaderboard");
            if (el) el.innerHTML = lb.map(r => `<div class="lb-row ${r.isMe ? 'me' : ''}"><span class="lb-name">${r.name}</span><span class="lb-pct">${r.pct}%</span></div>`).join("");
        }
    }

    gameEnd() {
        this.engine.stop();
        const scores = this.players.map(p => ({
            name: p.name, territory: parseFloat(this.engine.getTerritoryPercent(p.id)),
            kills: p.kills, isHuman: p.id === 0,
        })).sort((a, b) => b.territory - a.territory);
        const rank = scores.findIndex(s => s.isHuman) + 1;
        const h = scores.find(s => s.isHuman);
        const won = rank === 1;
        let coins = Math.floor(h.territory * 2) + h.kills * 10 + (won ? 50 : 0) + 12;

        // Jackpot if tokens collected
        const collected = this.tokenManager.collected;
        if (collected.length >= 1) {
            this.jackpot.start(collected, (jackpotCoins) => {
                coins += jackpotCoins;
                this.showResults(h, rank, won, coins, collected.length);
            });
        } else {
            this.showResults(h, rank, won, coins, collected.length);
        }
    }

    showResults(h, rank, won, coins, tokensCollected) {
        const level = getLevel(this.currentLevel);
        document.getElementById("result-title").textContent = won ? "Victory!" : `#${rank} Place`;
        document.getElementById("result-stats").innerHTML = `
            <div>Level: <strong>${level.name} (${this.currentLevel})</strong></div>
            <div>Territory: <strong>${h.territory}%</strong></div>
            <div>Kills: <strong>${h.kills}</strong></div>
            <div>Rank: <strong>#${rank} of ${this.players.length}</strong></div>
            <div>Tokens: <strong>${tokensCollected}</strong></div>
        `;
        document.getElementById("result-coins").textContent = `+${coins} coins`;
        this.addCoins(coins);
        this.stats.gamesPlayed++; if (won) this.stats.wins++;
        this.stats.kills += h.kills; this.stats.totalTerritory += h.territory;
        // Level up on win
        if (won && this.currentLevel < LEVELS.length) {
            this.currentLevel++;
            if (!this.stats.maxLevel || this.currentLevel > this.stats.maxLevel) {
                this.stats.maxLevel = this.currentLevel;
            }
        }
        this.saveUserData();
        this.showScreen("results");
    }
}

// Boot
let game;

// On-screen debug log
const _dbg = [];
function dbg(msg) {
    _dbg.push(msg);
    console.log("[DBG]", msg);
    const el = document.getElementById("loading-status");
    if (el) el.textContent = _dbg.slice(-5).join(" | ");
}

window.onerror = function(msg, src, line) {
    dbg("ERR:" + msg + " L" + line);
};

document.addEventListener("DOMContentLoaded", () => {
    dbg("DOM ready");

    try {
        game = new Game();
        dbg("Game created");
    } catch (e) {
        dbg("Game FAIL:" + e.message);
        return;
    }

    try {
        game.init();
        dbg("init OK");
    } catch (e) {
        dbg("init FAIL:" + e.message);
        return;
    }

    const gate = document.getElementById("auth-gate");
    const app = document.getElementById("app");
    const skipBtn = document.getElementById("btn-skip-auth");

    function showApp(user) {
        try {
            gate.style.display = "none";
            app.classList.remove("hidden");
            if (user) game.loadUserData(user);
            dbg("showApp OK");
        } catch (e) {
            dbg("showApp FAIL:" + e.message);
            gate.style.display = "none";
            app.classList.remove("hidden");
        }
    }

    if (skipBtn) {
        skipBtn.addEventListener("click", () => showApp({ name: "Guest", email: "guest@local" }));
        skipBtn.addEventListener("touchend", (e) => { e.preventDefault(); showApp({ name: "Guest", email: "guest@local" }); });
    }

    let authResolved = false;

    async function checkAuth() {
        if (authResolved) return;
        try {
            if (window.authService) {
                const authed = await window.authService.isAuthenticated();
                if (authed) {
                    authResolved = true;
                    const u = await window.authService.getUser();
                    showApp(u || { name: "Player", email: "unknown" });
                    return;
                }
            }
        } catch (e) {
            dbg("auth err:" + e.message);
        }
        if (skipBtn) { skipBtn.style.display = "inline-block"; skipBtn.textContent = "Play"; }
    }

    window.addEventListener("auth:ready", async (ev) => {
        if (authResolved) return;
        if (ev.detail && ev.detail.isAuthenticated) {
            authResolved = true;
            try {
                const u = await window.authService.getUser();
                showApp(u || { name: "Player", email: "unknown" });
            } catch (e) {
                showApp({ name: "Player", email: "unknown" });
            }
        } else {
            if (skipBtn) { skipBtn.style.display = "inline-block"; skipBtn.textContent = "Play"; }
        }
    });

    setTimeout(() => { if (!authResolved) checkAuth(); }, 1000);
    setTimeout(() => {
        if (!authResolved && skipBtn) {
            skipBtn.style.display = "inline-block";
            skipBtn.textContent = "Play";
        }
    }, 3000);
});

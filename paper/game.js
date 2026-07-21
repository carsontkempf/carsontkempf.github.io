/**
 * Game - Main controller. Ties engine, renderer, players, AI, and UI together.
 */

const PLAYER_COLORS = ["#00d2ff", "#ff4757", "#2ed573", "#ffa502", "#7b2ff7", "#ff6b81"];
const AI_NAMES = ["Bot Alpha", "Bot Beta", "Bot Gamma", "Bot Delta", "Bot Epsilon"];

class Game {
    constructor() {
        this.engine = new Engine();
        this.renderer = null;
        this.joystick = null;
        this.players = [];
        this.humanPlayer = null;
        this.aiControllers = [];
        this.aiCount = 3;
        this.state = "menu"; // menu, settings, playing, results
        
        // User data (persisted in localStorage)
        this.userId = null;
        this.userName = "";
        this.coins = 0;
        this.unlockedSkins = ["default"];
        this.equippedColor = "#00d2ff";
        this.equippedPattern = "solid";
        this.equippedShape = "cube";
        this.stats = { gamesPlayed: 0, wins: 0, kills: 0, totalTerritory: 0 };
        this.shop = null;
        this.charRenderer = null;
        this.effects = new Effects();
        this.minimap = new MiniMap();
    }

    /**
     * Load user data from localStorage keyed by user ID.
     */
    loadUserData(user) {
        this.userId = user.id || user.email || "local";
        this.userName = user.name || user.email || "Player";
        
        const key = "paper_data_" + this.userId;
        const saved = localStorage.getItem(key);
        if (saved) {
            try {
                const data = JSON.parse(saved);
                this.coins = data.coins || 0;
                this.unlockedSkins = data.unlockedSkins || ["default"];
                this.equippedColor = data.equippedColor || "#00d2ff";
                this.equippedPattern = data.equippedPattern || "solid";
                this.equippedShape = data.equippedShape || "cube";
                this.stats = data.stats || this.stats;
            } catch (e) {
                console.warn("Failed to load saved data:", e);
            }
        }
        
        this.updateCoinDisplays();
    }

    /**
     * Save user data to localStorage.
     */
    saveUserData() {
        if (!this.userId) return;
        const key = "paper_data_" + this.userId;
        const data = {
            coins: this.coins,
            unlockedSkins: this.unlockedSkins,
            equippedColor: this.equippedColor,
            equippedPattern: this.equippedPattern,
            equippedShape: this.equippedShape,
            stats: this.stats,
        };
        localStorage.setItem(key, JSON.stringify(data));
    }

    /**
     * Add coins and save.
     */
    addCoins(amount) {
        this.coins += amount;
        this.saveUserData();
        this.updateCoinDisplays();
    }

    updateCoinDisplays() {
        const els = document.querySelectorAll("#menu-coins, #shop-coins");
        els.forEach(el => { el.textContent = this.coins; });
    }

    init() {
        this.shop = new Shop(this);
        this.bindUI();
        this.showScreen("menu");

        window.addEventListener("resize", () => {
            if (this.renderer) this.renderer.resize();
        });
    }

    bindUI() {
        document.getElementById("btn-play").addEventListener("click", () => this.showScreen("settings"));
        document.getElementById("btn-start-game").addEventListener("click", () => this.startGame());
        document.getElementById("btn-back-menu").addEventListener("click", () => this.showScreen("menu"));
        document.getElementById("btn-play-again").addEventListener("click", () => this.startGame());
        document.getElementById("btn-results-menu").addEventListener("click", () => this.showScreen("menu"));
        document.getElementById("btn-shop").addEventListener("click", () => { this.showScreen("shop"); this.shop.render(); });
        document.getElementById("btn-shop-back").addEventListener("click", () => this.showScreen("menu"));

        // AI count toggle
        document.querySelectorAll("#ai-count-toggle .opt-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                document.querySelectorAll("#ai-count-toggle .opt-btn").forEach(b => b.classList.remove("active"));
                btn.classList.add("active");
                this.aiCount = parseInt(btn.dataset.val);
            });
        });
    }

    showScreen(name) {
        this.state = name;
        document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
        const el = document.getElementById("screen-" + name);
        if (el) el.classList.add("active");
    }

    startGame() {
        this.showScreen("game");
        this.state = "playing";

        // Init engine
        this.engine.initGrid();
        this.players = [];
        this.aiControllers = [];

        // Create human player (center-ish)
        const hx = Math.floor(GRID_SIZE / 2);
        const hy = Math.floor(GRID_SIZE / 2);
        this.humanPlayer = new Player(0, this.userName || "You", this.equippedColor, hx, hy);
        this.humanPlayer.spawnTerritory(this.engine);
        this.players.push(this.humanPlayer);

        // Create AI players
        const spawnPositions = this.getSpawnPositions(this.aiCount);
        for (let i = 0; i < this.aiCount; i++) {
            const pos = spawnPositions[i];
            const bot = new Player(i + 1, AI_NAMES[i], PLAYER_COLORS[i + 1], pos.x, pos.y);
            bot.spawnTerritory(this.engine);
            this.players.push(bot);

            const type = AI_TYPES[i % AI_TYPES.length];
            this.aiControllers.push(new AIController(bot, type));
        }

        this.engine.players = this.players;

        // Init renderer
        const canvas = document.getElementById("game-canvas");
        this.renderer = new Renderer(canvas);
        this.renderer.resize();
        this.charRenderer = new CharacterRenderer(this.renderer);

        // Set human player's shape
        this.humanPlayer.shape = this.equippedShape;

        // Init joystick
        this.joystick = new Joystick("joystick-zone");

        // Set engine callbacks
        this.engine.onTick = () => this.gameTick();
        this.engine.onRender = (dt) => this.gameRender(dt);
        this.engine.onGameEnd = () => this.gameEnd();

        // Start
        this.engine.start();
    }

    getSpawnPositions(count) {
        const margin = 30;
        const mid = GRID_SIZE / 2;
        const positions = [
            { x: margin, y: margin },
            { x: GRID_SIZE - margin, y: GRID_SIZE - margin },
            { x: margin, y: GRID_SIZE - margin },
            { x: GRID_SIZE - margin, y: margin },
            { x: mid, y: margin },
        ];
        return positions.slice(0, count);
    }

    gameTick() {
        // Apply joystick input to human player
        if (this.joystick && this.joystick.direction !== null) {
            this.humanPlayer.setDirection(this.joystick.direction);
        }

        // Tick all players and handle events
        for (const p of this.players) {
            const event = p.tick(this.engine, this.players);
            if (event === "fill" && this.renderer) {
                const { x, y } = this.renderer.gridToScreen(p.x, p.y);
                this.effects.addCaptureWave(x, y, p.color, 80);
                this.effects.spawnParticles(x, y, p.color, 12, "sparkle");
                if (p.id === 0) this.effects.vibrate(30);
            } else if (event === "kill" && this.renderer) {
                const { x, y } = this.renderer.gridToScreen(p.x, p.y);
                this.effects.shake(6);
                this.effects.spawnParticles(x, y, "#ff4757", 20, "burst");
                if (p.id === 0) this.effects.vibrate(50);
            } else if (event === "died" && this.renderer) {
                const { x, y } = this.renderer.gridToScreen(p.x, p.y);
                this.effects.shake(10);
                this.effects.spawnParticles(x, y, p.color, 25, "burst");
                if (p.id === 0) this.effects.vibrate(100);
            } else if (event === "trail" && this.renderer && p.id === 0) {
                // Subtle trail glow for human player
                const { x, y } = this.renderer.gridToScreen(p.x, p.y);
                this.effects.addTrailGlow(x, y, p.trailColor);
            }
        }

        // Tick AI
        for (const ai of this.aiControllers) {
            ai.tick(this.engine, this.players);
        }

        // Update HUD
        this.updateHUD();
    }

    gameRender(dt) {
        if (!this.renderer) return;

        // Update effects
        this.effects.update(dt);
        if (this.charRenderer) this.charRenderer.update(dt);

        // Camera follows human player + screen shake offset
        this.renderer.setCameraTarget(this.humanPlayer.x, this.humanPlayer.y);
        this.renderer.updateCamera(dt);
        this.renderer.cameraX += this.effects.shakeOffsetX;
        this.renderer.cameraY += this.effects.shakeOffsetY;

        // Render grid
        this.renderer.clear();
        this.renderer.renderGrid(this.engine, this.players);

        // Render characters on top (z-sorted)
        const ctx = this.renderer.ctx;
        const sorted = [...this.players].filter(p => p.alive).sort((a, b) => (a.y + a.x) - (b.y + b.x));
        for (const p of sorted) {
            const shape = p.shape || "cube";
            const moving = true;
            this.charRenderer.draw(ctx, p.x, p.y, p.color, shape, moving, p.direction);
        }

        // Render effects (particles, waves, glows)
        this.effects.render(ctx);

        // Render minimap
        this.minimap.render(ctx, this.engine, this.players, this.renderer.screenW);
    }

    updateHUD() {
        const remaining = Math.max(0, GAME_DURATION - this.engine.gameTime);
        const min = Math.floor(remaining / 60);
        const sec = Math.floor(remaining % 60).toString().padStart(2, "0");
        document.getElementById("hud-timer").textContent = `${min}:${sec}`;
        document.getElementById("hud-territory").textContent = this.engine.getTerritoryPercent(0) + "%";
        document.getElementById("hud-kills").textContent = this.humanPlayer.kills + " kills";

        // Update leaderboard every 10 ticks (~1s)
        if (Math.floor(this.engine.gameTime * TICK_RATE) % 10 === 0) {
            const lb = this.players
                .filter(p => p.alive)
                .map(p => ({ name: p.name, pct: parseFloat(this.engine.getTerritoryPercent(p.id)), isMe: p.id === 0 }))
                .sort((a, b) => b.pct - a.pct)
                .slice(0, 4);

            const lbEl = document.getElementById("hud-leaderboard");
            if (lbEl) {
                lbEl.innerHTML = lb.map(r =>
                    `<div class="lb-row ${r.isMe ? 'me' : ''}"><span class="lb-name">${r.name}</span><span class="lb-pct">${r.pct}%</span></div>`
                ).join("");
            }
        }
    }

    gameEnd() {
        this.engine.stop();
        this.state = "results";

        // Calculate scores
        const scores = this.players.map(p => ({
            name: p.name,
            territory: parseFloat(this.engine.getTerritoryPercent(p.id)),
            kills: p.kills,
            isHuman: p.id === 0,
        })).sort((a, b) => b.territory - a.territory);

        const rank = scores.findIndex(s => s.isHuman) + 1;
        const humanScore = scores.find(s => s.isHuman);
        const won = rank === 1;

        // Calculate coins
        let coins = Math.floor(humanScore.territory * 2); // 2 coins per % territory
        coins += humanScore.kills * 10; // 10 coins per kill
        if (won) coins += 50; // win bonus
        coins += Math.floor(GAME_DURATION / 10); // survival bonus (always get this)

        // Show results
        document.getElementById("result-title").textContent = won ? "Victory!" : `#${rank} Place`;
        document.getElementById("result-stats").innerHTML = `
            <div>Territory: <strong>${humanScore.territory}%</strong></div>
            <div>Kills: <strong>${humanScore.kills}</strong></div>
            <div>Rank: <strong>#${rank} of ${this.players.length}</strong></div>
        `;
        document.getElementById("result-coins").textContent = `+${coins} coins`;

        // Save progress
        this.addCoins(coins);
        this.stats.gamesPlayed++;
        if (won) this.stats.wins++;
        this.stats.kills += humanScore.kills;
        this.stats.totalTerritory += humanScore.territory;
        this.saveUserData();

        this.showScreen("results");
    }
}

// Boot
document.addEventListener("DOMContentLoaded", () => {
    const game = new Game();
    game.init();

    // Auth gate - uses site's AuthSDK
    const gate = document.getElementById("auth-gate");
    const app = document.getElementById("app");

    async function checkAuth() {
        if (window.authService && typeof window.authService.isAuthenticated === 'function') {
            const authed = await window.authService.isAuthenticated();
            if (authed) {
                gate.classList.add("hidden");
                app.classList.remove("hidden");
                const user = await window.authService.getUser();
                if (user) game.loadUserData(user);
            }
        }
    }

    // Listen for auth:ready event
    window.addEventListener('auth:ready', async (event) => {
        if (event.detail?.isAuthenticated) {
            gate.classList.add("hidden");
            app.classList.remove("hidden");
            const user = await window.authService.getUser();
            if (user) game.loadUserData(user);
        }
    });

    // Fallback check after 2s (in case auth:ready already fired)
    setTimeout(checkAuth, 2000);
});

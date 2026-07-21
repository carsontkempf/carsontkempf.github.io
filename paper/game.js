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
        this.equippedShape = "cube";
        this.equippedPowerup = "none";
        this.stats = { gamesPlayed: 0, wins: 0, kills: 0, totalTerritory: 0 };
        this.shop = null;
        this.tokenManager = new TokenManager();
        this.jackpot = new Jackpot();
        this.toasts = new Toasts();
    }

    loadUserData(user) {
        this.userId = user.id || user.email || "local";
        this.userName = user.name || user.email || "Player";
        this.isAdmin = this.checkAdmin(user);

        const key = "paper_data_" + this.userId;
        const saved = localStorage.getItem(key);
        if (saved) {
            try {
                const d = JSON.parse(saved);
                this.coins = d.coins || 0;
                this.unlockedSkins = d.unlockedSkins || ["default"];
                this.equippedColor = d.equippedColor || "#00d2ff";
                this.equippedPattern = d.equippedPattern || "solid";
                this.equippedShape = d.equippedShape || "cube";
                this.equippedPowerup = d.equippedPowerup || "none";
                this.stats = d.stats || this.stats;
            } catch (e) {}
        }

        // Admins get everything unlocked
        if (this.isAdmin) {
            const allItems = [
                ...SKIN_CATALOG.colors.map(i => i.id),
                ...SKIN_CATALOG.patterns.map(i => i.id),
                ...SKIN_CATALOG.shapes.map(i => i.id),
                ...SKIN_CATALOG.powerups.map(i => i.id),
            ];
            this.unlockedSkins = [...new Set([...this.unlockedSkins, ...allItems])];
        }

        this.updateCoinDisplays();
    }

    checkAdmin(user) {
        // Admin emails for carsontkempf.github.io
        const adminEmails = [
            "carsontkempf@gmail.com",
            "carson@cloudprototype.org",
        ];
        const email = (user.email || "").toLowerCase();
        return adminEmails.includes(email);
    }

    saveUserData() {
        if (!this.userId) return;
        localStorage.setItem("paper_data_" + this.userId, JSON.stringify({
            coins: this.coins, unlockedSkins: this.unlockedSkins,
            equippedColor: this.equippedColor, equippedPattern: this.equippedPattern,
            equippedShape: this.equippedShape, equippedPowerup: this.equippedPowerup, stats: this.stats,
        }));
    }

    addCoins(n) { this.coins += n; this.saveUserData(); this.updateCoinDisplays(); }
    updateCoinDisplays() { document.querySelectorAll("#menu-coins, #shop-coins").forEach(e => e.textContent = this.coins); }

    init() {
        this.shop = new Shop(this);
        this.bindUI();
        this.showScreen("menu");
        window.addEventListener("resize", () => { if (this.renderer) this.renderer.resize(); });
    }

    bindUI() {
        document.getElementById("btn-play").addEventListener("click", () => this.showScreen("settings"));
        document.getElementById("btn-start-game").addEventListener("click", () => this.startGame());
        document.getElementById("btn-back-menu").addEventListener("click", () => this.showScreen("menu"));
        document.getElementById("btn-play-again").addEventListener("click", () => this.startGame());
        document.getElementById("btn-results-menu").addEventListener("click", () => this.showScreen("menu"));
        document.getElementById("btn-shop").addEventListener("click", () => { this.showScreen("shop"); this.shop.render(); });
        document.getElementById("btn-shop-back").addEventListener("click", () => this.showScreen("menu"));
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
        document.getElementById("screen-" + name)?.classList.add("active");
    }

    startGame() {
        this.showScreen("game");
        this.state = "playing";
        this.engine.initGrid();
        this.players = [];
        this.aiControllers = [];

        // Human player (center)
        this.humanPlayer = new Player(0, this.userName || "You", this.equippedColor, WORLD_SIZE / 2, WORLD_SIZE / 2);
        this.humanPlayer.spawnTerritory(this.engine);
        // Apply hearts from powerup
        if (this.equippedPowerup === "heart_1") this.humanPlayer.hearts = 1;
        else if (this.equippedPowerup === "heart_3") this.humanPlayer.hearts = 3;
        this.players.push(this.humanPlayer);

        // AI players
        const spawns = this.getSpawns(this.aiCount);
        for (let i = 0; i < this.aiCount; i++) {
            const bot = new Player(i + 1, AI_NAMES[i], PLAYER_COLORS[i + 1], spawns[i].x, spawns[i].y);
            bot.spawnTerritory(this.engine);
            this.players.push(bot);
            this.aiControllers.push(new AIController(bot, ["cautious", "aggressive", "expansive"][i % 3]));
        }

        // Renderer + joystick
        this.renderer = new Renderer(document.getElementById("game-canvas"));
        this.renderer.resize();
        this.joystick = new Joystick("joystick-zone");

        // Engine callbacks
        this.engine.onUpdate = (dt) => this.update(dt);
        this.engine.onRender = (dt) => this.render(dt);
        this.engine.onGameEnd = () => this.gameEnd();
        this.tokenManager.reset();
        this.engine.start();
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

    update(dt) {
        // Human input
        if (this.joystick && this.joystick.angle !== null) {
            this.humanPlayer.setTargetAngle(this.joystick.angle);
        }

        // Apply powerup: speed boost
        if (this.equippedPowerup === "speed_boost") {
            this.humanPlayer.speed = PLAYER_SPEED * 1.1;
        } else {
            this.humanPlayer.speed = PLAYER_SPEED;
        }

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
        this.effects.update(dt);
        this.renderer.setCameraTarget(this.humanPlayer.x, this.humanPlayer.y);
        // Dynamic zoom based on territory
        const pct = parseFloat(this.engine.getTerritoryPercent(0));
        this.renderer.setZoomForTerritory(pct);
        this.renderer.updateCamera(dt);
        this.renderer.cameraX += this.effects.shakeOffsetX;
        this.renderer.cameraY += this.effects.shakeOffsetY;

        this.renderer.clear();
        this.renderer.renderBorder();
        this.renderer.renderTerritories(this.engine, this.players);
        this.renderer.renderTrails(this.players);
        this.renderer.renderPlayers(this.players);
        this.tokenManager.render(this.renderer.ctx, this.renderer);
        this.effects.render(this.renderer.ctx);
        this.minimap.render(this.renderer.ctx, this.engine, this.players, this.renderer.screenW);
        this.jackpot.update();
        this.jackpot.render(this.renderer.ctx, this.renderer.screenW, this.renderer.screenH);
        this.toasts.update(dt);
        this.toasts.render(this.renderer.ctx, this.renderer.screenW, this.renderer.screenH);
    }

    updateHUD() {
        const rem = Math.max(0, GAME_DURATION - this.engine.gameTime);
        document.getElementById("hud-timer").textContent = `${Math.floor(rem / 60)}:${Math.floor(rem % 60).toString().padStart(2, "0")}`;
        document.getElementById("hud-territory").textContent = this.engine.getTerritoryPercent(0) + "%";
        document.getElementById("hud-kills").textContent = this.humanPlayer.kills + " kills";

        // Hearts display
        const heartsEl = document.getElementById("hud-hearts");
        if (heartsEl) heartsEl.textContent = "❤️".repeat(this.humanPlayer.hearts);

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
        document.getElementById("result-title").textContent = won ? "Victory!" : `#${rank} Place`;
        document.getElementById("result-stats").innerHTML = `
            <div>Territory: <strong>${h.territory}%</strong></div>
            <div>Kills: <strong>${h.kills}</strong></div>
            <div>Rank: <strong>#${rank} of ${this.players.length}</strong></div>
            <div>Tokens: <strong>${tokensCollected}</strong></div>
        `;
        document.getElementById("result-coins").textContent = `+${coins} coins`;
        this.addCoins(coins);
        this.stats.gamesPlayed++; if (won) this.stats.wins++;
        this.stats.kills += h.kills; this.stats.totalTerritory += h.territory;
        this.saveUserData();
        this.showScreen("results");
    }
}

// Boot
let game;
document.addEventListener("DOMContentLoaded", () => {
    game = new Game();
    game.init();
    const gate = document.getElementById("auth-gate");
    const app = document.getElementById("app");
    async function checkAuth() {
        if (window.authService) {
            const authed = await window.authService.isAuthenticated();
            if (authed) { gate.classList.add("hidden"); app.classList.remove("hidden"); const u = await window.authService.getUser(); if (u) game.loadUserData(u); }
        }
    }
    window.addEventListener('auth:ready', async (ev) => {
        if (ev.detail?.isAuthenticated) { gate.classList.add("hidden"); app.classList.remove("hidden"); const u = await window.authService.getUser(); if (u) game.loadUserData(u); }
    });
    setTimeout(checkAuth, 2000);
});

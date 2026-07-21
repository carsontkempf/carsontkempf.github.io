/**
 * Jackpot - Slot machine after game ends.
 * Each token collected = one spin.
 * Three of a kind = coin reward (small/medium/large based on symbol).
 * 
 * Symbols: ⭐ (small=25), 💎 (medium=75), 🔥 (large=200)
 */

const JACKPOT_REWARDS = { 0: 25, 1: 75, 2: 200 };
const JACKPOT_SYMBOLS = ["⭐", "💎", "🔥"];

class Jackpot {
    constructor() {
        this.visible = false;
        this.spins = []; // { reels: [0,1,2], result: "win"|"lose", reward: number }
        this.currentSpin = 0;
        this.animating = false;
        this.reelValues = [0, 0, 0];
        this.reelTargets = [0, 0, 0];
        this.reelSpeeds = [0, 0, 0];
        this.onComplete = null;
        this.totalWon = 0;
    }

    /**
     * Start jackpot sequence. 1 token = 1 spin.
     */
    start(collectedTokens, onComplete) {
        this.visible = true;
        this.currentSpin = 0;
        this.totalWon = 0;
        this.onComplete = onComplete;
        this.spins = [];

        const spinCount = collectedTokens.length;
        for (let i = 0; i < spinCount; i++) {
            const reels = [
                Math.floor(Math.random() * 3),
                Math.floor(Math.random() * 3),
                Math.floor(Math.random() * 3)
            ];
            if (Math.random() < 0.2) {
                const val = Math.floor(Math.random() * 3);
                reels[0] = val; reels[1] = val; reels[2] = val;
            }
            const isWin = reels[0] === reels[1] && reels[1] === reels[2];
            const reward = isWin ? JACKPOT_REWARDS[reels[0]] : 0;
            this.spins.push({ reels, result: isWin ? "win" : "lose", reward });
        }

        if (this.spins.length === 0) {
            this.visible = false;
            if (onComplete) onComplete(0);
            return;
        }

        this.showSpin(0);
    }

    showSpin(index) {
        if (index >= this.spins.length) {
            // All spins done
            setTimeout(() => {
                this.visible = false;
                if (this.onComplete) this.onComplete(this.totalWon);
            }, 800);
            return;
        }
        this.currentSpin = index;
        this.animating = true;
        this.reelValues = [Math.random() * 3, Math.random() * 3, Math.random() * 3];
        this.reelTargets = this.spins[index].reels;
        this.reelSpeeds = [12, 12, 12]; // spinning speed
        this.stopTimers = [600, 1000, 1400]; // ms until each reel stops
        this.startTime = performance.now();
    }

    update() {
        if (!this.animating) return;
        const elapsed = performance.now() - this.startTime;

        for (let i = 0; i < 3; i++) {
            if (elapsed < this.stopTimers[i]) {
                this.reelValues[i] += 0.2;
                if (this.reelValues[i] >= 3) this.reelValues[i] -= 3;
            } else {
                this.reelValues[i] = this.reelTargets[i];
            }
        }

        if (elapsed > this.stopTimers[2] + 500) {
            this.animating = false;
            const spin = this.spins[this.currentSpin];
            if (spin.result === "win") this.totalWon += spin.reward;
            // Auto-advance after delay
            setTimeout(() => this.showSpin(this.currentSpin + 1), 1200);
        }
    }

    render(ctx, screenW, screenH) {
        if (!this.visible) return;

        // Overlay
        ctx.fillStyle = "rgba(0,0,0,0.75)";
        ctx.fillRect(0, 0, screenW, screenH);

        const cx = screenW / 2;
        const cy = screenH / 2;

        // Title
        ctx.fillStyle = "#ffd700";
        ctx.font = "bold 20px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("🎰 JACKPOT SPIN!", cx, cy - 80);

        // Spin counter
        ctx.fillStyle = "#aaa";
        ctx.font = "14px sans-serif";
        ctx.fillText(`Spin ${this.currentSpin + 1} of ${this.spins.length}`, cx, cy - 55);

        // Reels
        const reelW = 60, reelH = 70, gap = 12;
        const startX = cx - (reelW * 3 + gap * 2) / 2;

        for (let i = 0; i < 3; i++) {
            const rx = startX + i * (reelW + gap);
            const ry = cy - reelH / 2;

            // Reel background
            ctx.fillStyle = "#1a1a2e";
            ctx.strokeStyle = "#444";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.roundRect(rx, ry, reelW, reelH, 10);
            ctx.fill();
            ctx.stroke();

            // Symbol
            const val = Math.floor(this.reelValues[i]) % 3;
            ctx.font = `${reelW * 0.55}px sans-serif`;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(JACKPOT_SYMBOLS[val], rx + reelW / 2, ry + reelH / 2);
        }

        // Result text
        if (!this.animating && this.spins[this.currentSpin]) {
            const spin = this.spins[this.currentSpin];
            if (spin.result === "win") {
                ctx.fillStyle = "#2ed573";
                ctx.font = "bold 18px sans-serif";
                ctx.fillText(`THREE OF A KIND! +${spin.reward} coins`, cx, cy + 60);
            } else {
                ctx.fillStyle = "#666";
                ctx.font = "16px sans-serif";
                ctx.fillText("No match", cx, cy + 60);
            }
        }

        // Total won
        if (this.totalWon > 0) {
            ctx.fillStyle = "#ffd700";
            ctx.font = "bold 16px sans-serif";
            ctx.fillText(`Total won: ${this.totalWon} coins`, cx, cy + 90);
        }
    }
}

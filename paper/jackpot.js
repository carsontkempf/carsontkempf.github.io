/**
 * Slot Machine - Popup overlay after game ends.
 * Each token collected = one spin.
 * User must click/tap the lever to spin.
 * Three of a kind = coin reward.
 *
 * Symbols: 7 (cherry=25), BAR (bar=75), $ (jackpot=200)
 */

const SLOT_REWARDS = [25, 75, 200];
const SLOT_SYMBOLS = ["7", "BAR", "$"];
const SLOT_COLORS = ["#ff4757", "#ffa502", "#2ed573"];

class Jackpot {
    constructor() {
        this.visible = false;
        this.spins = [];
        this.currentSpin = 0;
        this.spinsRemaining = 0;
        this.totalWon = 0;
        this.onComplete = null;

        // Reel state
        this.reels = [0, 0, 0];
        this.reelTargets = [0, 0, 0];
        this.reelSpeeds = [0, 0, 0];
        this.spinning = false;
        this.spinStartTime = 0;
        this.reelStopTimes = [0, 0, 0];
        this.showResult = false;
        this.resultTimer = 0;

        // Lever state
        this.leverPulled = false;
        this.leverAngle = 0; // 0 = up, 1 = pulled down
        this.leverAnimating = false;

        // Click handling
        this._clickHandler = null;
    }

    start(collectedTokens, onComplete) {
        this.visible = true;
        this.currentSpin = 0;
        this.totalWon = 0;
        this.onComplete = onComplete;
        this.spinning = false;
        this.showResult = false;
        this.leverPulled = false;
        this.leverAngle = 0;
        this.spinsRemaining = collectedTokens.length;

        // Pre-generate all spin results
        this.spins = [];
        for (let i = 0; i < collectedTokens.length; i++) {
            const reels = [
                Math.floor(Math.random() * 3),
                Math.floor(Math.random() * 3),
                Math.floor(Math.random() * 3)
            ];
            // 20% chance of jackpot (all same)
            if (Math.random() < 0.2) {
                const val = Math.floor(Math.random() * 3);
                reels[0] = val; reels[1] = val; reels[2] = val;
            }
            const isWin = reels[0] === reels[1] && reels[1] === reels[2];
            this.spins.push({ reels, win: isWin, reward: isWin ? SLOT_REWARDS[reels[0]] : 0 });
        }

        if (this.spins.length === 0) {
            this.visible = false;
            if (onComplete) onComplete(0);
            return;
        }

        // Bind click/tap
        this._clickHandler = (e) => this._handleClick(e);
        document.addEventListener("pointerdown", this._clickHandler);
    }

    _handleClick(e) {
        if (!this.visible || this.spinning || this.showResult) return;

        // Check if click is on the lever area or anywhere (tap to spin)
        this.pullLever();
    }

    pullLever() {
        if (this.spinning || this.currentSpin >= this.spins.length) return;

        this.leverPulled = true;
        this.leverAnimating = true;
        this.leverAngle = 0;

        // Animate lever down then start spin
        const self = this;
        const leverStart = performance.now();
        function animLever() {
            const t = (performance.now() - leverStart) / 300;
            if (t < 1) {
                self.leverAngle = t;
                requestAnimationFrame(animLever);
            } else {
                self.leverAngle = 1;
                setTimeout(() => {
                    self.leverAngle = 0;
                    self.leverAnimating = false;
                    self._startSpin();
                }, 200);
            }
        }
        animLever();
    }

    _startSpin() {
        const spin = this.spins[this.currentSpin];
        this.spinning = true;
        this.showResult = false;
        this.reelTargets = spin.reels;
        this.reels = [Math.random() * 3, Math.random() * 3, Math.random() * 3];
        this.reelSpeeds = [14, 14, 14];
        this.spinStartTime = performance.now();
        // Stagger stop times
        this.reelStopTimes = [800, 1200, 1600];
    }

    update() {
        if (!this.visible) return;
        if (!this.spinning) return;

        const elapsed = performance.now() - this.spinStartTime;

        for (let i = 0; i < 3; i++) {
            if (elapsed < this.reelStopTimes[i]) {
                // Still spinning
                this.reels[i] += 0.25;
                if (this.reels[i] >= 3) this.reels[i] -= 3;
            } else {
                // Stopped - snap to target
                this.reels[i] = this.reelTargets[i];
            }
        }

        // All reels stopped
        if (elapsed > this.reelStopTimes[2] + 400) {
            this.spinning = false;
            this.showResult = true;
            this.resultTimer = performance.now();

            const spin = this.spins[this.currentSpin];
            if (spin.win) this.totalWon += spin.reward;
            this.spinsRemaining--;

            // Auto-advance after delay
            setTimeout(() => {
                this.showResult = false;
                this.currentSpin++;
                if (this.currentSpin >= this.spins.length) {
                    // All done
                    setTimeout(() => this._finish(), 500);
                }
                // Otherwise wait for next lever pull
            }, 1800);
        }
    }

    _finish() {
        this.visible = false;
        if (this._clickHandler) {
            document.removeEventListener("pointerdown", this._clickHandler);
            this._clickHandler = null;
        }
        if (this.onComplete) this.onComplete(this.totalWon);
    }

    render(ctx, screenW, screenH) {
        if (!this.visible) return;

        // Darken background
        ctx.fillStyle = "rgba(0,0,0,0.8)";
        ctx.fillRect(0, 0, screenW, screenH);

        const cx = screenW / 2;
        const cy = screenH / 2;

        // Machine body (popup card)
        const mw = Math.min(320, screenW * 0.85);
        const mh = 280;
        const mx = cx - mw / 2;
        const my = cy - mh / 2;

        // Machine background
        ctx.fillStyle = "#1a1a2e";
        ctx.strokeStyle = "#ffd700";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.roundRect(mx, my, mw, mh, 16);
        ctx.fill();
        ctx.stroke();

        // Top banner
        ctx.fillStyle = "#ffd700";
        ctx.fillRect(mx + 10, my + 10, mw - 20, 36);
        ctx.fillStyle = "#1a1a2e";
        ctx.font = "bold 18px monospace";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("SLOT MACHINE", cx, my + 28);

        // Spins remaining
        ctx.fillStyle = "#aaa";
        ctx.font = "12px monospace";
        ctx.fillText("Spins: " + this.spinsRemaining + " remaining", cx, my + 56);

        // Reels
        const reelW = mw * 0.22;
        const reelH = 70;
        const reelGap = mw * 0.04;
        const reelsStartX = cx - (reelW * 3 + reelGap * 2) / 2;
        const reelY = my + 72;

        for (let i = 0; i < 3; i++) {
            const rx = reelsStartX + i * (reelW + reelGap);

            // Reel border
            ctx.fillStyle = "#0a0a1a";
            ctx.strokeStyle = "#555";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.roundRect(rx, reelY, reelW, reelH, 8);
            ctx.fill();
            ctx.stroke();

            // Symbol
            const val = Math.floor(this.reels[i]) % 3;
            const sym = SLOT_SYMBOLS[val];
            const col = SLOT_COLORS[val];

            ctx.fillStyle = col;
            ctx.font = "bold " + (reelW * 0.5) + "px monospace";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(sym, rx + reelW / 2, reelY + reelH / 2);

            // Spinning blur effect
            if (this.spinning && (performance.now() - this.spinStartTime) < this.reelStopTimes[i]) {
                ctx.fillStyle = "rgba(10,10,26,0.4)";
                ctx.fillRect(rx + 2, reelY + 2, reelW - 4, reelH - 4);
            }
        }

        // Win line
        ctx.strokeStyle = "#ffd700";
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(reelsStartX - 5, reelY + reelH / 2);
        ctx.lineTo(reelsStartX + reelW * 3 + reelGap * 2 + 5, reelY + reelH / 2);
        ctx.stroke();
        ctx.setLineDash([]);

        // Result text
        const resultY = reelY + reelH + 25;
        if (this.showResult && this.spins[this.currentSpin]) {
            const spin = this.spins[this.currentSpin];
            if (spin.win) {
                ctx.fillStyle = "#2ed573";
                ctx.font = "bold 18px monospace";
                ctx.fillText("WIN! +" + spin.reward + " coins", cx, resultY);
            } else {
                ctx.fillStyle = "#666";
                ctx.font = "14px monospace";
                ctx.fillText("No match - try again!", cx, resultY);
            }
        } else if (!this.spinning && this.currentSpin < this.spins.length) {
            ctx.fillStyle = "#ffd700";
            ctx.font = "bold 14px monospace";
            ctx.fillText("TAP ANYWHERE TO PULL LEVER", cx, resultY);
        }

        // Total won display
        if (this.totalWon > 0) {
            ctx.fillStyle = "#ffd700";
            ctx.font = "bold 14px monospace";
            ctx.fillText("Total: +" + this.totalWon + " coins", cx, resultY + 24);
        }

        // Lever (right side of machine)
        const leverX = mx + mw - 25;
        const leverBaseY = reelY + 10;
        const leverH = reelH - 20;

        // Lever track
        ctx.fillStyle = "#333";
        ctx.fillRect(leverX - 3, leverBaseY, 6, leverH);

        // Lever handle (moves based on leverAngle)
        const handleY = leverBaseY + this.leverAngle * (leverH - 12);
        ctx.fillStyle = "#ff4757";
        ctx.beginPath();
        ctx.arc(leverX, handleY + 6, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#cc0000";
        ctx.lineWidth = 2;
        ctx.stroke();

        // Lever shaft
        ctx.strokeStyle = "#888";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(leverX, handleY + 14);
        ctx.lineTo(leverX, leverBaseY + leverH);
        ctx.stroke();

        // Close button (if all spins done)
        if (this.currentSpin >= this.spins.length) {
            const btnW = 120, btnH = 36;
            const btnX = cx - btnW / 2;
            const btnY = my + mh - 50;
            ctx.fillStyle = "#2ed573";
            ctx.beginPath();
            ctx.roundRect(btnX, btnY, btnW, btnH, 8);
            ctx.fill();
            ctx.fillStyle = "#000";
            ctx.font = "bold 14px monospace";
            ctx.fillText("COLLECT", cx, btnY + btnH / 2);
        }
    }
}

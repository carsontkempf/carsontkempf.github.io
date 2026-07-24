/**
 * Slot Machine - Center popup after game ends.
 * Each token = one spin. User drags/clicks lever to spin.
 * Tokens are only spent when user pulls the lever.
 * Three of a kind = coin reward.
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
        this.spinning = false;
        this.spinStartTime = 0;
        this.reelStopTimes = [0, 0, 0];
        this.showResult = false;

        // Lever state (0 = up, 1 = fully down)
        this.leverPos = 0;
        this.leverDragging = false;
        this.leverReleased = false;
        this.leverReturnSpeed = 0;

        // Layout (computed on render)
        this._layout = null;

        // Input handlers
        this._pointerDown = null;
        this._pointerMove = null;
        this._pointerUp = null;
    }

    start(collectedTokens, onComplete) {
        this.visible = true;
        this.currentSpin = 0;
        this.totalWon = 0;
        this.onComplete = onComplete;
        this.spinning = false;
        this.showResult = false;
        this.leverPos = 0;
        this.leverDragging = false;
        this.leverReleased = false;
        this.spinsRemaining = collectedTokens.length;

        // Pre-generate spin results
        this.spins = [];
        for (let i = 0; i < collectedTokens.length; i++) {
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
            this.spins.push({ reels, win: isWin, reward: isWin ? SLOT_REWARDS[reels[0]] : 0 });
        }

        if (this.spins.length === 0) {
            this.visible = false;
            if (onComplete) onComplete(0);
            return;
        }

        // Bind pointer events
        this._pointerDown = (e) => this._onDown(e);
        this._pointerMove = (e) => this._onMove(e);
        this._pointerUp = (e) => this._onUp(e);
        document.addEventListener("pointerdown", this._pointerDown);
        document.addEventListener("pointermove", this._pointerMove);
        document.addEventListener("pointerup", this._pointerUp);
    }

    _getLayout(screenW, screenH) {
        const mw = Math.min(300, screenW * 0.8);
        const mh = 320;
        const mx = (screenW - mw) / 2;
        const my = (screenH - mh) / 2;
        // Lever hitbox (right side)
        const leverX = mx + mw - 30;
        const leverTop = my + 80;
        const leverH = 120;
        return { mx, my, mw, mh, leverX, leverTop, leverH };
    }

    _onDown(e) {
        if (!this.visible || this.spinning || this.showResult) return;
        if (this.spinsRemaining <= 0) {
            this._finish();
            return;
        }
        const lay = this._layout;
        if (!lay) return;
        const x = e.clientX, y = e.clientY;
        // Check if pointer is near lever
        if (Math.abs(x - lay.leverX) < 40 && y >= lay.leverTop - 10 && y <= lay.leverTop + lay.leverH + 20) {
            this.leverDragging = true;
            this._dragStartY = y;
        }
    }

    _onMove(e) {
        if (!this.leverDragging) return;
        const lay = this._layout;
        if (!lay) return;
        const dy = e.clientY - this._dragStartY;
        this.leverPos = Math.max(0, Math.min(1, dy / lay.leverH));
    }

    _onUp(e) {
        if (!this.leverDragging) return;
        this.leverDragging = false;
        // If pulled past 70%, trigger spin
        if (this.leverPos >= 0.7) {
            this.leverReleased = true;
            this._triggerSpin();
        } else {
            // Snap back
            this.leverReleased = false;
            this.leverReturnSpeed = 4;
        }
    }

    _triggerSpin() {
        if (this.currentSpin >= this.spins.length) return;
        this.spinning = true;
        this.showResult = false;
        this.spinsRemaining--;
        const spin = this.spins[this.currentSpin];
        this.reelTargets = spin.reels;
        this.reels = [Math.random() * 3, Math.random() * 3, Math.random() * 3];
        this.spinStartTime = performance.now();
        this.reelStopTimes = [700, 1100, 1500];
        // Lever returns to top
        this.leverReturnSpeed = 3;
    }

    update() {
        if (!this.visible) return;

        // Lever return animation
        if (!this.leverDragging && this.leverPos > 0) {
            this.leverPos -= 0.05 * (this.leverReturnSpeed || 2);
            if (this.leverPos < 0) this.leverPos = 0;
        }

        if (!this.spinning) return;

        const elapsed = performance.now() - this.spinStartTime;

        for (let i = 0; i < 3; i++) {
            if (elapsed < this.reelStopTimes[i]) {
                this.reels[i] += 0.3;
                if (this.reels[i] >= 3) this.reels[i] -= 3;
            } else {
                this.reels[i] = this.reelTargets[i];
            }
        }

        // All stopped
        if (elapsed > this.reelStopTimes[2] + 300) {
            this.spinning = false;
            this.showResult = true;
            const spin = this.spins[this.currentSpin];
            if (spin.win) this.totalWon += spin.reward;
            this.currentSpin++;
            // Clear result after delay
            setTimeout(() => { this.showResult = false; }, 2000);
        }
    }

    _finish() {
        this.visible = false;
        if (this._pointerDown) document.removeEventListener("pointerdown", this._pointerDown);
        if (this._pointerMove) document.removeEventListener("pointermove", this._pointerMove);
        if (this._pointerUp) document.removeEventListener("pointerup", this._pointerUp);
        this._pointerDown = null;
        this._pointerMove = null;
        this._pointerUp = null;
        if (this.onComplete) this.onComplete(this.totalWon);
    }

    render(ctx, screenW, screenH) {
        if (!this.visible) return;

        const lay = this._getLayout(screenW, screenH);
        this._layout = lay;
        const { mx, my, mw, mh, leverX, leverTop, leverH } = lay;
        const cx = mx + mw / 2;

        // Semi-transparent background (game still visible)
        ctx.fillStyle = "rgba(0,0,0,0.7)";
        ctx.fillRect(0, 0, screenW, screenH);

        // Machine body - 3D effect with gradient and shadow
        // Shadow
        ctx.fillStyle = "rgba(0,0,0,0.5)";
        ctx.beginPath();
        ctx.roundRect(mx + 4, my + 6, mw, mh, 14);
        ctx.fill();

        // Main body (dark gradient look)
        const grad = ctx.createLinearGradient(mx, my, mx, my + mh);
        grad.addColorStop(0, "#2a1a3e");
        grad.addColorStop(0.5, "#1a1a2e");
        grad.addColorStop(1, "#0a0a1e");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.roundRect(mx, my, mw, mh, 14);
        ctx.fill();

        // Gold trim
        ctx.strokeStyle = "#ffd700";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.roundRect(mx, my, mw, mh, 14);
        ctx.stroke();

        // Top plate (3D raised)
        ctx.fillStyle = "#ffd700";
        ctx.beginPath();
        ctx.roundRect(mx + 12, my + 10, mw - 24, 32, 6);
        ctx.fill();
        ctx.fillStyle = "#8B6914";
        ctx.fillRect(mx + 12, my + 34, mw - 24, 4);

        // Title
        ctx.fillStyle = "#1a1a2e";
        ctx.font = "bold 16px monospace";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("SLOT MACHINE", cx - 10, my + 26);

        // Spins display
        ctx.fillStyle = "#ffd700";
        ctx.font = "bold 12px monospace";
        ctx.fillText("SPINS: " + this.spinsRemaining, cx - 10, my + 56);

        // Reel area (3D inset)
        const reelAreaX = mx + 15;
        const reelAreaY = my + 68;
        const reelAreaW = mw - 70;
        const reelAreaH = 80;

        // Inset shadow
        ctx.fillStyle = "#000";
        ctx.beginPath();
        ctx.roundRect(reelAreaX, reelAreaY, reelAreaW, reelAreaH, 8);
        ctx.fill();
        ctx.fillStyle = "#0a0a1a";
        ctx.beginPath();
        ctx.roundRect(reelAreaX + 2, reelAreaY + 2, reelAreaW - 4, reelAreaH - 4, 6);
        ctx.fill();

        // Individual reels
        const reelW = (reelAreaW - 20) / 3;
        const reelGap = 5;
        for (let i = 0; i < 3; i++) {
            const rx = reelAreaX + 5 + i * (reelW + reelGap);
            const ry = reelAreaY + 5;
            const rh = reelAreaH - 10;

            // Reel bg
            ctx.fillStyle = "#111122";
            ctx.strokeStyle = "#333";
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.roundRect(rx, ry, reelW, rh, 4);
            ctx.fill();
            ctx.stroke();

            // Symbol
            const val = Math.floor(this.reels[i]) % 3;
            ctx.fillStyle = SLOT_COLORS[val];
            ctx.font = "bold " + (reelW * 0.5) + "px monospace";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(SLOT_SYMBOLS[val], rx + reelW / 2, ry + rh / 2);

            // Spinning blur
            if (this.spinning && (performance.now() - this.spinStartTime) < this.reelStopTimes[i]) {
                ctx.fillStyle = "rgba(10,10,26,0.5)";
                ctx.fillRect(rx + 1, ry + 1, reelW - 2, rh - 2);
                // Show blurred next symbol
                const val2 = (val + 1) % 3;
                ctx.globalAlpha = 0.3;
                ctx.fillStyle = SLOT_COLORS[val2];
                ctx.fillText(SLOT_SYMBOLS[val2], rx + reelW / 2, ry + rh / 2 - 15);
                ctx.globalAlpha = 1;
            }
        }

        // Win line
        ctx.strokeStyle = "#ffd700";
        ctx.lineWidth = 2;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(reelAreaX, reelAreaY + reelAreaH / 2);
        ctx.lineTo(reelAreaX + reelAreaW, reelAreaY + reelAreaH / 2);
        ctx.stroke();
        ctx.setLineDash([]);

        // LEVER (3D, right side of machine)
        const leverSlotX = mx + mw - 38;
        const leverSlotTop = leverTop;
        const leverSlotH = leverH;
        const handleY = leverSlotTop + this.leverPos * leverSlotH;

        // Lever track (3D groove)
        ctx.fillStyle = "#222";
        ctx.beginPath();
        ctx.roundRect(leverSlotX - 4, leverSlotTop - 5, 8, leverSlotH + 10, 4);
        ctx.fill();
        ctx.strokeStyle = "#444";
        ctx.lineWidth = 1;
        ctx.stroke();

        // Lever shaft
        ctx.strokeStyle = "#888";
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(leverSlotX, handleY + 10);
        ctx.lineTo(leverSlotX, leverSlotTop + leverSlotH);
        ctx.stroke();

        // Lever handle (3D ball)
        const ballR = 12;
        const ballGrad = ctx.createRadialGradient(
            leverSlotX - 2, handleY - 2, 2,
            leverSlotX, handleY, ballR
        );
        ballGrad.addColorStop(0, "#ff6b6b");
        ballGrad.addColorStop(0.7, "#cc0000");
        ballGrad.addColorStop(1, "#800000");
        ctx.fillStyle = ballGrad;
        ctx.beginPath();
        ctx.arc(leverSlotX, handleY, ballR, 0, Math.PI * 2);
        ctx.fill();
        // Highlight
        ctx.fillStyle = "rgba(255,255,255,0.3)";
        ctx.beginPath();
        ctx.arc(leverSlotX - 3, handleY - 4, 4, 0, Math.PI * 2);
        ctx.fill();

        // Arrow hint on lever
        if (!this.spinning && !this.showResult && this.spinsRemaining > 0 && this.leverPos < 0.1) {
            ctx.fillStyle = "#ffd700";
            ctx.font = "10px monospace";
            ctx.textAlign = "center";
            ctx.fillText("PULL", leverSlotX, leverSlotTop - 12);
            ctx.fillText("v", leverSlotX, leverSlotTop + leverSlotH + 18);
        }

        // Result display area
        const resultY = reelAreaY + reelAreaH + 15;

        if (this.showResult) {
            const spin = this.spins[this.currentSpin - 1];
            if (spin && spin.win) {
                ctx.fillStyle = "#2ed573";
                ctx.font = "bold 16px monospace";
                ctx.textAlign = "center";
                ctx.fillText("WIN! +" + spin.reward + " coins!", cx - 10, resultY + 10);
            } else {
                ctx.fillStyle = "#777";
                ctx.font = "14px monospace";
                ctx.textAlign = "center";
                ctx.fillText("No match", cx - 10, resultY + 10);
            }
        } else if (!this.spinning && this.spinsRemaining > 0) {
            ctx.fillStyle = "#ccc";
            ctx.font = "12px monospace";
            ctx.textAlign = "center";
            ctx.fillText("Drag lever down to spin!", cx - 10, resultY + 10);
        } else if (!this.spinning && this.spinsRemaining <= 0) {
            ctx.fillStyle = "#ffd700";
            ctx.font = "bold 13px monospace";
            ctx.textAlign = "center";
            ctx.fillText("All spins used!", cx - 10, resultY + 10);
        }

        // Total won
        if (this.totalWon > 0) {
            ctx.fillStyle = "#ffd700";
            ctx.font = "bold 14px monospace";
            ctx.textAlign = "center";
            ctx.fillText("Total: +" + this.totalWon + " coins", cx - 10, resultY + 32);
        }

        // Collect button (when all spins done)
        if (this.spinsRemaining <= 0 && !this.spinning && !this.showResult) {
            const btnW = 130, btnH = 36;
            const btnX = cx - 10 - btnW / 2;
            const btnY = my + mh - 52;
            // 3D button
            ctx.fillStyle = "#1a8c4e";
            ctx.beginPath();
            ctx.roundRect(btnX, btnY + 3, btnW, btnH, 8);
            ctx.fill();
            ctx.fillStyle = "#2ed573";
            ctx.beginPath();
            ctx.roundRect(btnX, btnY, btnW, btnH, 8);
            ctx.fill();
            ctx.fillStyle = "#000";
            ctx.font = "bold 14px monospace";
            ctx.textAlign = "center";
            ctx.fillText("COLLECT", cx - 10, btnY + btnH / 2);
        }

        // Machine base (3D feet)
        ctx.fillStyle = "#333";
        ctx.fillRect(mx + 20, my + mh - 6, 30, 6);
        ctx.fillRect(mx + mw - 50, my + mh - 6, 30, 6);
    }
}

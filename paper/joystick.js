/**
 * Joystick - 360° input via touch, mouse, or keyboard.
 * Outputs a target angle (radians) or null if no input.
 */

class Joystick {
    constructor(zoneId) {
        this.zone = document.getElementById(zoneId);
        this.active = false;
        this.angle = null; // current input angle (null = no input)
        this.startX = 0;
        this.startY = 0;
        this.deadzone = 12;

        // Visuals
        this.baseEl = document.createElement("div");
        this.baseEl.style.cssText = "position:absolute;width:100px;height:100px;border-radius:50%;background:rgba(255,255,255,0.06);border:2px solid rgba(255,255,255,0.12);display:none;pointer-events:none;transform:translate(-50%,-50%);";
        this.zone.appendChild(this.baseEl);

        this.stickEl = document.createElement("div");
        this.stickEl.style.cssText = "position:absolute;width:40px;height:40px;border-radius:50%;background:rgba(0,210,255,0.4);border:2px solid rgba(0,210,255,0.7);display:none;pointer-events:none;transform:translate(-50%,-50%);";
        this.zone.appendChild(this.stickEl);

        this.bindTouch();
        this.bindMouse();
        this.bindKeyboard();
    }

    bindTouch() {
        this.zone.addEventListener("touchstart", (e) => {
            e.preventDefault();
            const t = e.touches[0];
            const r = this.zone.getBoundingClientRect();
            this.startX = t.clientX - r.left;
            this.startY = t.clientY - r.top;
            this.active = true;
            this.baseEl.style.display = "block";
            this.baseEl.style.left = this.startX + "px";
            this.baseEl.style.top = this.startY + "px";
            this.stickEl.style.display = "block";
            this.stickEl.style.left = this.startX + "px";
            this.stickEl.style.top = this.startY + "px";
        }, { passive: false });

        this.zone.addEventListener("touchmove", (e) => {
            if (!this.active) return;
            e.preventDefault();
            const t = e.touches[0];
            const r = this.zone.getBoundingClientRect();
            const cx = t.clientX - r.left;
            const cy = t.clientY - r.top;
            let dx = cx - this.startX;
            let dy = cy - this.startY;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist > this.deadzone) {
                this.angle = Math.atan2(dy, dx);
            }
            const max = 40;
            if (dist > max) { dx = (dx / dist) * max; dy = (dy / dist) * max; }
            this.stickEl.style.left = (this.startX + dx) + "px";
            this.stickEl.style.top = (this.startY + dy) + "px";
        }, { passive: false });

        this.zone.addEventListener("touchend", () => {
            this.active = false;
            this.baseEl.style.display = "none";
            this.stickEl.style.display = "none";
        });
        this.zone.addEventListener("touchcancel", () => {
            this.active = false;
            this.baseEl.style.display = "none";
            this.stickEl.style.display = "none";
        });
    }

    bindMouse() {
        // Mouse: player steers toward cursor position relative to screen center.
        // No click needed - just move the mouse and the player follows.
        document.addEventListener("mousemove", (e) => {
            const cx = window.innerWidth / 2;
            const cy = window.innerHeight / 2;
            const dx = e.clientX - cx;
            const dy = e.clientY - cy;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist > 25) {
                this.angle = Math.atan2(dy, dx);
            }
        });
    }

    bindKeyboard() {
        const keys = new Set();
        document.addEventListener("keydown", (e) => {
            keys.add(e.key);
            this.updateKeyAngle(keys);
        });
        document.addEventListener("keyup", (e) => {
            keys.delete(e.key);
            this.updateKeyAngle(keys);
        });
        this._keys = keys;
    }

    updateKeyAngle(keys) {
        let dx = 0, dy = 0;
        if (keys.has("ArrowUp") || keys.has("w") || keys.has("W")) dy -= 1;
        if (keys.has("ArrowDown") || keys.has("s") || keys.has("S")) dy += 1;
        if (keys.has("ArrowLeft") || keys.has("a") || keys.has("A")) dx -= 1;
        if (keys.has("ArrowRight") || keys.has("d") || keys.has("D")) dx += 1;
        if (dx !== 0 || dy !== 0) {
            this.angle = Math.atan2(dy, dx);
        }
    }
}

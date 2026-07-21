/**
 * Virtual Joystick for mobile touch controls.
 * 
 * Appears where the user touches in the joystick zone.
 * Maps angle to 4 directions (up/right/down/left).
 */

class Joystick {
    constructor(zoneId) {
        this.zone = document.getElementById(zoneId);
        this.active = false;
        this.startX = 0;
        this.startY = 0;
        this.currentX = 0;
        this.currentY = 0;
        this.direction = null; // 0=up, 1=right, 2=down, 3=left
        this.deadzone = 15; // minimum drag distance in px

        // Visual elements
        this.baseEl = null;
        this.stickEl = null;
        this.createVisuals();
        this.bindEvents();
    }

    createVisuals() {
        this.baseEl = document.createElement("div");
        this.baseEl.style.cssText = `
            position: absolute;
            width: 100px;
            height: 100px;
            border-radius: 50%;
            background: rgba(255,255,255,0.08);
            border: 2px solid rgba(255,255,255,0.15);
            display: none;
            pointer-events: none;
            transform: translate(-50%, -50%);
        `;
        this.zone.appendChild(this.baseEl);

        this.stickEl = document.createElement("div");
        this.stickEl.style.cssText = `
            position: absolute;
            width: 44px;
            height: 44px;
            border-radius: 50%;
            background: rgba(0,210,255,0.5);
            border: 2px solid rgba(0,210,255,0.8);
            display: none;
            pointer-events: none;
            transform: translate(-50%, -50%);
        `;
        this.zone.appendChild(this.stickEl);
    }

    bindEvents() {
        // Touch
        this.zone.addEventListener("touchstart", (e) => this.onStart(e), { passive: false });
        this.zone.addEventListener("touchmove", (e) => this.onMove(e), { passive: false });
        this.zone.addEventListener("touchend", (e) => this.onEnd(e), { passive: false });
        this.zone.addEventListener("touchcancel", (e) => this.onEnd(e), { passive: false });

        // Mouse (for PC) - uses the full game screen
        document.addEventListener("mousedown", (e) => this.onMouseDown(e));
        document.addEventListener("mousemove", (e) => this.onMouseMove(e));
        document.addEventListener("mouseup", (e) => this.onMouseUp(e));

        // Keyboard (WASD + Arrow keys)
        document.addEventListener("keydown", (e) => this.onKeyDown(e));
        document.addEventListener("keyup", (e) => this.onKeyUp(e));
        this.keysHeld = new Set();
    }

    onMouseDown(e) {
        if (e.target.closest("#hud") || e.target.closest(".menu-container")) return;
        this.mouseActive = true;
        this.mouseStartX = e.clientX;
        this.mouseStartY = e.clientY;
    }

    onMouseMove(e) {
        if (!this.mouseActive) return;
        const dx = e.clientX - this.mouseStartX;
        const dy = e.clientY - this.mouseStartY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 10) {
            const angle = Math.atan2(dy, dx);
            if (angle > -Math.PI / 4 && angle <= Math.PI / 4) this.direction = 1;
            else if (angle > Math.PI / 4 && angle <= 3 * Math.PI / 4) this.direction = 2;
            else if (angle > -3 * Math.PI / 4 && angle <= -Math.PI / 4) this.direction = 0;
            else this.direction = 3;
            this.mouseStartX = e.clientX;
            this.mouseStartY = e.clientY;
        }
    }

    onMouseUp(e) {
        this.mouseActive = false;
    }

    onKeyDown(e) {
        this.keysHeld.add(e.key);
        const dir = this.keyToDir(e.key);
        if (dir !== null) {
            this.direction = dir;
            e.preventDefault();
        }
    }

    onKeyUp(e) {
        this.keysHeld.delete(e.key);
    }

    keyToDir(key) {
        switch (key) {
            case "ArrowUp": case "w": case "W": return 0;
            case "ArrowRight": case "d": case "D": return 1;
            case "ArrowDown": case "s": case "S": return 2;
            case "ArrowLeft": case "a": case "A": return 3;
            default: return null;
        }
    }

    onStart(e) {
        e.preventDefault();
        const touch = e.touches[0];
        const rect = this.zone.getBoundingClientRect();
        this.startX = touch.clientX - rect.left;
        this.startY = touch.clientY - rect.top;
        this.currentX = this.startX;
        this.currentY = this.startY;
        this.active = true;

        this.baseEl.style.display = "block";
        this.baseEl.style.left = this.startX + "px";
        this.baseEl.style.top = this.startY + "px";

        this.stickEl.style.display = "block";
        this.stickEl.style.left = this.startX + "px";
        this.stickEl.style.top = this.startY + "px";
    }

    onMove(e) {
        if (!this.active) return;
        e.preventDefault();
        const touch = e.touches[0];
        const rect = this.zone.getBoundingClientRect();
        this.currentX = touch.clientX - rect.left;
        this.currentY = touch.clientY - rect.top;

        // Clamp stick within base
        let dx = this.currentX - this.startX;
        let dy = this.currentY - this.startY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const maxDist = 40;
        if (dist > maxDist) {
            dx = (dx / dist) * maxDist;
            dy = (dy / dist) * maxDist;
        }

        this.stickEl.style.left = (this.startX + dx) + "px";
        this.stickEl.style.top = (this.startY + dy) + "px";

        // Calculate direction
        if (dist > this.deadzone) {
            const angle = Math.atan2(dy, dx); // -PI to PI
            // Map to 4 directions
            if (angle > -Math.PI / 4 && angle <= Math.PI / 4) {
                this.direction = 1; // right
            } else if (angle > Math.PI / 4 && angle <= 3 * Math.PI / 4) {
                this.direction = 2; // down
            } else if (angle > -3 * Math.PI / 4 && angle <= -Math.PI / 4) {
                this.direction = 0; // up
            } else {
                this.direction = 3; // left
            }
        }
    }

    onEnd(e) {
        this.active = false;
        this.direction = null;
        this.baseEl.style.display = "none";
        this.stickEl.style.display = "none";
    }
}

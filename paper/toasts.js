/**
 * Toasts - Small popup notifications at the bottom of the screen.
 */

class Toasts {
    constructor() {
        this.items = []; // { text, color, timer }
        this.maxVisible = 3;
    }

    show(text, color) {
        this.items.push({ text, color: color || "#fff", timer: 2.5 });
        if (this.items.length > this.maxVisible) {
            this.items.shift();
        }
    }

    update(dt) {
        for (let i = this.items.length - 1; i >= 0; i--) {
            this.items[i].timer -= dt;
            if (this.items[i].timer <= 0) this.items.splice(i, 1);
        }
    }

    render(ctx, screenW, screenH) {
        const startY = screenH - 60;
        ctx.textAlign = "center";

        for (let i = 0; i < this.items.length; i++) {
            const t = this.items[i];
            const y = startY - i * 32;
            const alpha = Math.min(1, t.timer / 0.5); // fade out in last 0.5s

            // Background pill
            ctx.globalAlpha = alpha * 0.8;
            const textW = ctx.measureText(t.text).width || 100;
            ctx.fillStyle = "rgba(0,0,0,0.7)";
            ctx.beginPath();
            ctx.roundRect(screenW / 2 - textW / 2 - 16, y - 12, textW + 32, 28, 14);
            ctx.fill();

            // Text
            ctx.globalAlpha = alpha;
            ctx.fillStyle = t.color;
            ctx.font = "bold 13px -apple-system, sans-serif";
            ctx.fillText(t.text, screenW / 2, y + 4);
        }
        ctx.globalAlpha = 1;
        ctx.textAlign = "start";
    }
}

/**
 * Category Wheel - Trivia Crack style spinning wheel.
 * 
 * Spins fast (8-12 full rotations), decelerates dramatically, lands on selected category.
 * Pointer at TOP (12 o'clock). Category returned always matches visual landing.
 */

const CATEGORIES = [
    { name: "Science", color: "#4CAF50", icon: "S" },
    { name: "History", color: "#FF9800", icon: "H" },
    { name: "Entertainment", color: "#E91E63", icon: "E" },
    { name: "Geography", color: "#2196F3", icon: "G" },
    { name: "Art", color: "#9C27B0", icon: "A" },
    { name: "Sports", color: "#FF5722", icon: "Sp" },
];

class CategoryWheel {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext("2d");
        this.rotation = 0;
        this.spinning = false;
        this.segments = CATEGORIES.length;
        this.segmentAngle = (2 * Math.PI) / this.segments;
        this._draw();
    }

    /**
     * Spin the wheel. Spins 8-12 full rotations then lands on a random category.
     * Returns a promise resolving to the selected category object.
     */
    spin() {
        if (this.spinning) return Promise.resolve(null);

        return new Promise((resolve) => {
            this.spinning = true;

            // Pick target category
            const targetSegment = Math.floor(Math.random() * this.segments);

            // Calculate final rotation angle that puts targetSegment under pointer (top = -PI/2)
            // Segment i center is at angle: i * segmentAngle + segmentAngle/2
            // For it to be at top: rotation + segmentCenter = -PI/2 (mod 2PI)
            // rotation = -PI/2 - segmentCenter
            const segmentCenter = targetSegment * this.segmentAngle + this.segmentAngle / 2;
            const landingAngle = -Math.PI / 2 - segmentCenter;

            // Add 8-12 full spins plus jitter within the segment
            const fullSpins = (8 + Math.random() * 4) * 2 * Math.PI;
            const jitter = (Math.random() - 0.5) * this.segmentAngle * 0.5;
            const targetRotation = this.rotation + fullSpins + landingAngle - this.rotation % (2 * Math.PI) + jitter;

            const startRotation = this.rotation;
            const totalDelta = targetRotation - startRotation;
            const duration = 4500 + Math.random() * 1500; // 4.5-6 seconds
            const startTime = performance.now();

            const animate = (now) => {
                const elapsed = now - startTime;
                const t = Math.min(elapsed / duration, 1);

                // Custom easing: fast start, very slow end (quintic ease-out)
                const eased = 1 - Math.pow(1 - t, 5);

                this.rotation = startRotation + totalDelta * eased;
                this._draw();

                if (t < 1) {
                    requestAnimationFrame(animate);
                } else {
                    this.spinning = false;
                    resolve(CATEGORIES[targetSegment]);
                }
            };

            requestAnimationFrame(animate);
        });
    }

    _draw() {
        const ctx = this.ctx;
        const cx = this.canvas.width / 2;
        const cy = this.canvas.height / 2;
        const radius = Math.min(cx, cy) - 10;

        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        for (let i = 0; i < this.segments; i++) {
            const startAngle = this.rotation + i * this.segmentAngle;
            const endAngle = startAngle + this.segmentAngle;

            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.arc(cx, cy, radius, startAngle, endAngle);
            ctx.closePath();
            ctx.fillStyle = CATEGORIES[i].color;
            ctx.fill();
            ctx.strokeStyle = "#ffffff";
            ctx.lineWidth = 2;
            ctx.stroke();

            // Label
            const midAngle = startAngle + this.segmentAngle / 2;
            const lr = radius * 0.6;
            const lx = cx + Math.cos(midAngle) * lr;
            const ly = cy + Math.sin(midAngle) * lr;

            ctx.save();
            ctx.translate(lx, ly);
            ctx.rotate(midAngle + Math.PI / 2);
            ctx.fillStyle = "#fff";
            ctx.font = `bold ${Math.max(11, radius * 0.09)}px Arial, sans-serif`;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(CATEGORIES[i].name, 0, 0);
            ctx.restore();
        }

        // Center circle
        ctx.beginPath();
        ctx.arc(cx, cy, 16, 0, 2 * Math.PI);
        ctx.fillStyle = "#222";
        ctx.fill();
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 2;
        ctx.stroke();

        // Pointer (top triangle)
        ctx.beginPath();
        ctx.moveTo(cx, 3);
        ctx.lineTo(cx - 10, 22);
        ctx.lineTo(cx + 10, 22);
        ctx.closePath();
        ctx.fillStyle = "#222";
        ctx.fill();
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    resize(width, height) {
        this.canvas.width = width;
        this.canvas.height = height;
        this._draw();
    }
}

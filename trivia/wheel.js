/**
 * Category Wheel - Trivia Crack style spinning wheel.
 * Uses canvas for rendering, pure JS animation.
 * 
 * Pointer is at the TOP (12 o'clock). Wheel rotates clockwise.
 * Segments are drawn starting from the right (3 o'clock) going clockwise.
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
        this.rotation = 0; // Current rotation in radians
        this.spinning = false;
        this.segments = CATEGORIES.length;
        this.segmentAngle = (2 * Math.PI) / this.segments;
        
        this._draw();
    }

    /**
     * Spin the wheel. Returns a promise that resolves with the selected category.
     * We pick the target category FIRST, then spin to land on it.
     */
    spin() {
        if (this.spinning) return Promise.resolve(null);
        
        return new Promise((resolve) => {
            this.spinning = true;
            
            // Pick a random category index
            const targetSegment = Math.floor(Math.random() * this.segments);
            
            // Calculate the angle that puts this segment under the pointer (top = -PI/2)
            // Each segment i spans from (i * segmentAngle) to ((i+1) * segmentAngle)
            // The pointer is at -PI/2 (top). We need the midpoint of targetSegment to align with -PI/2.
            const segmentMid = targetSegment * this.segmentAngle + this.segmentAngle / 2;
            // We need rotation such that: rotation + segmentMid = -PI/2 + 2*PI*N (some multiple)
            // So rotation = -PI/2 - segmentMid + full rotations
            const fullSpins = (4 + Math.random() * 3) * 2 * Math.PI; // 4-7 full spins
            const jitter = (Math.random() - 0.5) * this.segmentAngle * 0.6; // random within segment
            const targetRotation = fullSpins + (-Math.PI / 2 - segmentMid + jitter);
            
            const startRotation = this.rotation;
            const deltaRotation = targetRotation - startRotation;
            const duration = 3000 + Math.random() * 1000;
            const startTime = performance.now();
            
            const animate = (currentTime) => {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                
                // Ease-out cubic
                const eased = 1 - Math.pow(1 - progress, 3);
                
                this.rotation = startRotation + deltaRotation * eased;
                this._draw();
                
                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    this.spinning = false;
                    // Return the category we targeted
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
        
        // Draw segments
        for (let i = 0; i < this.segments; i++) {
            const startAngle = this.rotation + i * this.segmentAngle;
            const endAngle = startAngle + this.segmentAngle;
            
            // Segment fill
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.arc(cx, cy, radius, startAngle, endAngle);
            ctx.closePath();
            ctx.fillStyle = CATEGORIES[i].color;
            ctx.fill();
            
            // Segment border
            ctx.strokeStyle = "#ffffff";
            ctx.lineWidth = 2;
            ctx.stroke();
            
            // Category label
            const midAngle = startAngle + this.segmentAngle / 2;
            const labelRadius = radius * 0.62;
            const lx = cx + Math.cos(midAngle) * labelRadius;
            const ly = cy + Math.sin(midAngle) * labelRadius;
            
            ctx.save();
            ctx.translate(lx, ly);
            ctx.rotate(midAngle + Math.PI / 2);
            ctx.fillStyle = "#ffffff";
            ctx.font = `bold ${Math.max(11, radius * 0.09)}px Arial, sans-serif`;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(CATEGORIES[i].name, 0, 0);
            ctx.restore();
        }
        
        // Center circle
        ctx.beginPath();
        ctx.arc(cx, cy, 18, 0, 2 * Math.PI);
        ctx.fillStyle = "#222";
        ctx.fill();
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Pointer (triangle at top)
        ctx.beginPath();
        ctx.moveTo(cx, 4);
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

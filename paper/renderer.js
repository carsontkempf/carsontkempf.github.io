/**
 * Renderer - Slightly tilted top-down view with 3D territory.
 * Territory rendered as smooth blobs with drop shadow and raised edges.
 * Trails as thick smooth curves.
 */

class Renderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.baseScale = 0.12;
        this.scale = this.baseScale;
        this.targetScale = this.baseScale;
        this.cameraX = 0;
        this.cameraY = 0;
        this.targetCamX = 0;
        this.targetCamY = 0;
        this.resize();
    }

    resize() {
        this.canvas.width = window.innerWidth * devicePixelRatio;
        this.canvas.height = window.innerHeight * devicePixelRatio;
        this.ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
        this.screenW = window.innerWidth;
        this.screenH = window.innerHeight;
    }

    worldToScreen(wx, wy) {
        return {
            x: wx * this.scale - this.cameraX + this.screenW / 2,
            y: wy * this.scale - this.cameraY + this.screenH / 2
        };
    }

    setCameraTarget(wx, wy) {
        this.targetCamX = wx * this.scale;
        this.targetCamY = wy * this.scale;
    }

    updateCamera(dt) {
        const lerp = 1 - Math.pow(0.005, dt);
        this.cameraX += (this.targetCamX - this.cameraX) * lerp;
        this.cameraY += (this.targetCamY - this.cameraY) * lerp;
        this.scale += (this.targetScale - this.scale) * lerp * 0.3;
    }

    setZoomForTerritory(pct) {
        this.targetScale = Math.max(0.02, this.baseScale - pct * 0.002);
    }

    clear() {
        this.ctx.fillStyle = "#111820";
        this.ctx.fillRect(0, 0, this.screenW, this.screenH);
    }

    /**
     * Render territories as smooth blobs with 3D shadow effect.
     * Uses rounded circles per cell to create organic shapes.
     */
    renderTerritories(engine, players) {
        const ctx = this.ctx;
        const cellWorld = CELL_SIZE;
        const cs = cellWorld * this.scale;

        for (const p of players) {
            // Collect visible cells
            const cells = [];
            for (let gy = 0; gy < GRID_RES; gy++) {
                for (let gx = 0; gx < GRID_RES; gx++) {
                    if (engine.grid[gy][gx] !== p.id) continue;
                    const wx = (gx + 0.5) * cellWorld;
                    const wy = (gy + 0.5) * cellWorld;
                    const { x, y } = this.worldToScreen(wx, wy);
                    if (x < -cs * 2 || x > this.screenW + cs * 2 || y < -cs * 2 || y > this.screenH + cs * 2) continue;
                    cells.push({ x, y });
                }
            }
            if (cells.length === 0) continue;

            const r = cs * 0.7; // circle radius per cell (overlap for smooth look)

            // 3D Shadow layer (offset down and slightly transparent)
            ctx.fillStyle = "rgba(0,0,0,0.35)";
            for (const c of cells) {
                ctx.beginPath();
                ctx.arc(c.x + 2, c.y + 4, r, 0, Math.PI * 2);
                ctx.fill();
            }

            // Main territory fill (circles that overlap = smooth blob)
            ctx.fillStyle = p.territoryColor;
            for (const c of cells) {
                ctx.beginPath();
                ctx.arc(c.x, c.y, r, 0, Math.PI * 2);
                ctx.fill();
            }

            // Highlight on top edge (lighter circles, smaller, offset up)
            ctx.fillStyle = this.lighten(p.territoryColor, 0.15);
            for (const c of cells) {
                ctx.beginPath();
                ctx.arc(c.x, c.y - 1, r * 0.75, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }

    /**
     * Render trails as tapered paths (wide at player, thin at start).
     */
    renderTrails(players) {
        const ctx = this.ctx;

        for (const p of players) {
            if (!p.alive || p.trail.length < 2) continue;

            const points = [...p.trail, { x: p.x, y: p.y }];
            const maxWidth = PLAYER_RADIUS * this.scale * 1.2; // narrower than player icon
            const minWidth = 1.5;

            // Draw tapered trail using individual segments with varying width
            for (let i = 0; i < points.length - 1; i++) {
                const t = i / (points.length - 1); // 0 at start, 1 at player
                const width = minWidth + (maxWidth - minWidth) * t * t; // quadratic taper

                const p0 = this.worldToScreen(points[i].x, points[i].y);
                const p1 = this.worldToScreen(points[i + 1].x, points[i + 1].y);

                // Shadow
                ctx.beginPath();
                ctx.moveTo(p0.x + 1, p0.y + 2);
                ctx.lineTo(p1.x + 1, p1.y + 2);
                ctx.strokeStyle = "rgba(0,0,0,0.2)";
                ctx.lineWidth = width + 2;
                ctx.lineCap = "round";
                ctx.stroke();

                // Main trail color
                ctx.beginPath();
                ctx.moveTo(p0.x, p0.y);
                ctx.lineTo(p1.x, p1.y);
                ctx.strokeStyle = p.trailColor;
                ctx.lineWidth = width;
                ctx.lineCap = "round";
                ctx.stroke();

                // Inner highlight
                ctx.beginPath();
                ctx.moveTo(p0.x, p0.y);
                ctx.lineTo(p1.x, p1.y);
                ctx.strokeStyle = p.color;
                ctx.lineWidth = width * 0.4;
                ctx.lineCap = "round";
                ctx.stroke();
            }
        }
    }

    renderPlayers(players, skins3d) {
        const ctx = this.ctx;
        for (const p of players) {
            if (!p.alive) continue;
            const { x, y } = this.worldToScreen(p.x, p.y);
            const r = PLAYER_RADIUS * this.scale * 5.0; // 5x bigger than trail

            // Shadow
            ctx.beginPath();
            ctx.ellipse(x + 1, y + r * 0.3, r * 0.7, r * 0.25, 0, 0, Math.PI * 2);
            ctx.fillStyle = "rgba(0,0,0,0.25)";
            ctx.fill();

            // Draw 3D skin
            const skinId = p.shape || "droplet";
            if (skins3d) {
                skins3d.draw(ctx, x, y, r, p.angle, skinId, p.color);
            } else {
                // Fallback droplet
                ctx.save();
                ctx.translate(x, y);
                ctx.rotate(p.angle);
                ctx.beginPath();
                ctx.moveTo(r * 0.9, 0);
                ctx.quadraticCurveTo(r * 0.3, -r * 0.7, -r * 0.6, -r * 0.3);
                ctx.quadraticCurveTo(-r * 1.0, 0, -r * 0.6, r * 0.3);
                ctx.quadraticCurveTo(r * 0.3, r * 0.7, r * 0.9, 0);
                ctx.closePath();
                const grad = ctx.createRadialGradient(-r * 0.1, -r * 0.2, 0, 0, 0, r);
                grad.addColorStop(0, "#fff");
                grad.addColorStop(0.25, p.color);
                grad.addColorStop(1, this.darken(p.color, 0.4));
                ctx.fillStyle = grad;
                ctx.fill();
                ctx.restore();
            }
        }
    }

    renderBorder(arenaRadius) {
        const ctx = this.ctx;
        const center = this.worldToScreen(WORLD_SIZE / 2, WORLD_SIZE / 2);
        const r = (arenaRadius || WORLD_SIZE / 2) * this.scale;
        ctx.beginPath();
        ctx.arc(center.x, center.y, r, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(255,71,87,0.4)";
        ctx.lineWidth = 3;
        ctx.stroke();
        // Glow
        ctx.strokeStyle = "rgba(255,71,87,0.1)";
        ctx.lineWidth = 8;
        ctx.stroke();
    }

    lighten(color, amount) {
        let r, g, b;
        if (color.startsWith("rgb")) {
            [r, g, b] = color.match(/\d+/g).map(Number);
        } else {
            r = parseInt(color.slice(1, 3), 16);
            g = parseInt(color.slice(3, 5), 16);
            b = parseInt(color.slice(5, 7), 16);
        }
        r = Math.min(255, r + Math.floor(255 * amount));
        g = Math.min(255, g + Math.floor(255 * amount));
        b = Math.min(255, b + Math.floor(255 * amount));
        return `rgb(${r},${g},${b})`;
    }

    darken(color, factor) {
        let r, g, b;
        if (color.startsWith("rgb")) {
            [r, g, b] = color.match(/\d+/g).map(Number);
        } else {
            r = parseInt(color.slice(1, 3), 16);
            g = parseInt(color.slice(3, 5), 16);
            b = parseInt(color.slice(5, 7), 16);
        }
        return `rgb(${Math.floor(r * factor)},${Math.floor(g * factor)},${Math.floor(b * factor)})`;
    }
}

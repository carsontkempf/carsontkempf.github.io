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
        const lerp = 1 - Math.pow(0.0001, dt);
        this.cameraX += (this.targetCamX - this.cameraX) * lerp;
        this.cameraY += (this.targetCamY - this.cameraY) * lerp;
        this.scale += (this.targetScale - this.scale) * lerp * 0.5;
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
        if (cs < 0.3) return;

        // If cells are too small for hex detail, use fast batch rects
        if (cs < 4) {
            for (const p of players) {
                ctx.fillStyle = p.territoryColor || p.color;
                ctx.globalAlpha = 0.45;
                ctx.beginPath();
                for (let gy = 0; gy < GRID_RES; gy++) {
                    for (let gx = 0; gx < GRID_RES; gx++) {
                        if (engine.grid[gy][gx] !== p.id) continue;
                        const sx = gx * cellWorld * this.scale - this.cameraX + this.screenW / 2;
                        const sy = gy * cellWorld * this.scale - this.cameraY + this.screenH / 2;
                        if (sx > this.screenW + cs || sx < -cs || sy > this.screenH + cs || sy < -cs) continue;
                        ctx.rect(sx, sy, cs + 0.5, cs + 0.5);
                    }
                }
                ctx.fill();
                ctx.globalAlpha = 1;
            }
            return;
        }

        // Detailed 3D hexagonal tiles when zoomed in
        const hexR = cs * 0.55;
        const hexH = hexR * 0.3;

        for (const p of players) {
            const baseColor = p.territoryColor || p.color;
            const topColor = baseColor;
            const sideColor = this.darken(baseColor, 0.55);
            const edgeColor = this.darken(baseColor, 0.4);

            for (let gy = 0; gy < GRID_RES; gy++) {
                for (let gx = 0; gx < GRID_RES; gx++) {
                    if (engine.grid[gy][gx] !== p.id) continue;
                    const sx = gx * cellWorld * this.scale - this.cameraX + this.screenW / 2;
                    const sy = gy * cellWorld * this.scale - this.cameraY + this.screenH / 2;
                    if (sx > this.screenW + cs || sx < -cs * 2 || sy > this.screenH + cs || sy < -cs * 2) continue;

                    // Side face (depth)
                    ctx.beginPath();
                    this._hexSide(ctx, sx, sy, hexR, hexH);
                    ctx.fillStyle = sideColor;
                    ctx.globalAlpha = 0.7;
                    ctx.fill();

                    // Top face (hex)
                    ctx.beginPath();
                    this._hexTop(ctx, sx, sy - hexH, hexR);
                    ctx.fillStyle = topColor;
                    ctx.globalAlpha = 0.55;
                    ctx.fill();
                    ctx.strokeStyle = edgeColor;
                    ctx.lineWidth = 0.4;
                    ctx.globalAlpha = 0.3;
                    ctx.stroke();
                    ctx.globalAlpha = 1;
                }
            }
        }
    }

    _hexTop(ctx, cx, cy, r) {
        for (var i = 0; i < 6; i++) {
            var angle = Math.PI / 6 + (Math.PI / 3) * i;
            var hx = cx + r * Math.cos(angle);
            var hy = cy + r * Math.sin(angle) * 0.5; // flatten for isometric
            if (i === 0) ctx.moveTo(hx, hy);
            else ctx.lineTo(hx, hy);
        }
        ctx.closePath();
    }

    _hexSide(ctx, cx, cy, r, h) {
        // Draw the front 3 sides of the hex (bottom half visible)
        var pts = [];
        for (var i = 0; i < 6; i++) {
            var angle = Math.PI / 6 + (Math.PI / 3) * i;
            pts.push({
                x: cx + r * Math.cos(angle),
                y: cy + r * Math.sin(angle) * 0.5
            });
        }
        // Front-facing sides (indices 2,3,4 for pointy-top)
        ctx.moveTo(pts[2].x, pts[2].y - h);
        ctx.lineTo(pts[2].x, pts[2].y);
        ctx.lineTo(pts[3].x, pts[3].y);
        ctx.lineTo(pts[3].x, pts[3].y - h);
        ctx.closePath();
        ctx.moveTo(pts[3].x, pts[3].y - h);
        ctx.lineTo(pts[3].x, pts[3].y);
        ctx.lineTo(pts[4].x, pts[4].y);
        ctx.lineTo(pts[4].x, pts[4].y - h);
        ctx.closePath();
    }

    /**
     * Render trails - single wide stroke per player (fast).
     */
    renderTrails(players) {
        const ctx = this.ctx;

        for (const p of players) {
            if (!p.alive || p.trail.length < 2) continue;

            const points = [...p.trail, { x: p.x, y: p.y }];
            const maxWidth = PLAYER_RADIUS * this.scale * 1.2;

            // Single trail stroke
            ctx.beginPath();
            ctx.strokeStyle = p.trailColor || p.color;
            ctx.lineWidth = maxWidth;
            ctx.lineCap = "round";
            ctx.lineJoin = "round";
            const first = this.worldToScreen(points[0].x, points[0].y);
            ctx.moveTo(first.x, first.y);
            for (let i = 1; i < points.length; i++) {
                const pt = this.worldToScreen(points[i].x, points[i].y);
                ctx.lineTo(pt.x, pt.y);
            }
            ctx.stroke();
        }
    }

    renderPlayers(players, skins3d) {
        const ctx = this.ctx;
        for (const p of players) {
            if (!p.alive) continue;
            const { x, y } = this.worldToScreen(p.x, p.y);
            const r = PLAYER_RADIUS * this.scale * 5.0;

            // Shadow
            ctx.beginPath();
            ctx.ellipse(x + 1, y + r * 0.3, r * 0.7, r * 0.25, 0, 0, Math.PI * 2);
            ctx.fillStyle = "rgba(0,0,0,0.25)";
            ctx.fill();

            // Draw skin (with fallback to simple circle)
            const skinId = p.shape || "droplet";
            try {
                if (skins3d && skinId !== "droplet") {
                    skins3d.draw(ctx, x, y, r, p.angle, skinId, p.color);
                } else {
                    this._drawSimplePlayer(ctx, x, y, r, p);
                }
            } catch (e) {
                this._drawSimplePlayer(ctx, x, y, r, p);
            }
        }
    }

    _drawSimplePlayer(ctx, x, y, r, p) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(p.angle);
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.6, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
        ctx.strokeStyle = "rgba(255,255,255,0.5)";
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();
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

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
     * Render territories with hex texture and 3D edge depth.
     */
    renderTerritories(engine, players) {
        const ctx = this.ctx;
        const cellWorld = CELL_SIZE;
        const cs = cellWorld * this.scale;
        if (cs < 0.3) return;

        const depth = Math.max(3, cs * 0.5);

        for (const p of players) {
            const baseColor = p.territoryColor || p.color;
            const sideColor = this.darken(baseColor, 0.4);

            // Pass 1: Side depth on outer bottom edge
            ctx.fillStyle = sideColor;
            ctx.beginPath();
            for (let gy = 0; gy < GRID_RES; gy++) {
                for (let gx = 0; gx < GRID_RES; gx++) {
                    if (engine.grid[gy][gx] !== p.id) continue;
                    if (gy + 1 < GRID_RES && engine.grid[gy + 1][gx] === p.id) continue;
                    const sx = gx * cellWorld * this.scale - this.cameraX + this.screenW / 2;
                    const sy = gy * cellWorld * this.scale - this.cameraY + this.screenH / 2;
                    if (sx > this.screenW + cs || sx < -cs || sy > this.screenH + cs * 2 || sy < -cs) continue;
                    ctx.rect(sx, sy + cs, cs + 0.5, depth);
                }
            }
            ctx.fill();

            // Pass 2: Solid top fill
            ctx.fillStyle = baseColor;
            ctx.globalAlpha = 0.65;
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

            // Pass 3: Hex grid lines
            if (cs >= 3) {
                ctx.strokeStyle = this.darken(baseColor, 0.5);
                ctx.lineWidth = Math.max(0.8, cs * 0.06);
                ctx.globalAlpha = 0.4;
                ctx.beginPath();
                for (let gy = 0; gy < GRID_RES; gy++) {
                    for (let gx = 0; gx < GRID_RES; gx++) {
                        if (engine.grid[gy][gx] !== p.id) continue;
                        const sx = gx * cellWorld * this.scale - this.cameraX + this.screenW / 2;
                        const sy = gy * cellWorld * this.scale - this.cameraY + this.screenH / 2;
                        if (sx > this.screenW + cs || sx < -cs || sy > this.screenH + cs || sy < -cs) continue;
                        this._hexTop(ctx, sx + cs * 0.5, sy + cs * 0.5, cs * 0.46);
                    }
                }
                ctx.stroke();
                ctx.globalAlpha = 1;
            }
        }
    }

    _hexTop(ctx, cx, cy, r) {
        for (var i = 0; i < 6; i++) {
            var angle = Math.PI / 6 + (Math.PI / 3) * i;
            var hx = cx + r * Math.cos(angle);
            var hy = cy + r * Math.sin(angle) * 0.6;
            if (i === 0) ctx.moveTo(hx, hy);
            else ctx.lineTo(hx, hy);
        }
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
            const r = PLAYER_RADIUS * this.scale * 20.0;

            // Shadow
            ctx.beginPath();
            ctx.ellipse(x + 1, y + r * 0.3, r * 0.3, r * 0.08, 0, 0, Math.PI * 2);
            ctx.fillStyle = "rgba(0,0,0,0.2)";
            ctx.fill();

            // Draw skin
            const skinId = p.shape || "droplet";
            try {
                if (skins3d && skins3d.draw) {
                    if (!skins3d.draw(ctx, x, y, r, p.angle, skinId)) {
                        this._drawSimplePlayer(ctx, x, y, r, p);
                    }
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

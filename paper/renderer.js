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
     * Render territories as tiled flat-top hexagons with 3D depth on bottom edges.
     * Hex grid is offset: odd rows shift right by half hex width.
     * Hexagons overlap to fill without gaps.
     */
    renderTerritories(engine, players) {
        const ctx = this.ctx;
        const cellWorld = CELL_SIZE;
        const cs = cellWorld * this.scale;
        if (cs < 0.3) return;

        // Hex geometry (flat-top)
        const hexW = cs * 1.05; // slightly wider than cell to overlap
        const hexH = hexW * 0.866; // sqrt(3)/2
        const rowH = hexH * 0.75; // vertical spacing (overlap 25%)
        const depth = Math.max(2, cs * 0.4);

        for (const p of players) {
            const baseColor = p.territoryColor || p.color;
            const sideColor = this.darken(baseColor, 0.4);
            const edgeColor = this.darken(baseColor, 0.6);

            // Pass 1: Side depth faces (only on cells with no owned neighbor below)
            ctx.fillStyle = sideColor;
            ctx.beginPath();
            for (let gy = 0; gy < GRID_RES; gy++) {
                for (let gx = 0; gx < GRID_RES; gx++) {
                    if (engine.grid[gy][gx] !== p.id) continue;
                    // Check if bottom edge is exposed
                    if (!this._hexHasNeighborBelow(engine, gx, gy, p.id)) {
                        const hc = this._hexCenter(gx, gy, cs, hexW, rowH);
                        if (hc.x > this.screenW + hexW || hc.x < -hexW || hc.y > this.screenH + hexH + depth || hc.y < -hexH) continue;
                        // Draw side trapezoid below bottom edge of hex
                        const hw = hexW * 0.5;
                        const hh = hexH * 0.5;
                        ctx.moveTo(hc.x - hw * 0.5, hc.y + hh);
                        ctx.lineTo(hc.x + hw * 0.5, hc.y + hh);
                        ctx.lineTo(hc.x + hw * 0.5, hc.y + hh + depth);
                        ctx.lineTo(hc.x - hw * 0.5, hc.y + hh + depth);
                        ctx.closePath();
                    }
                }
            }
            ctx.fill();

            // Pass 2: Hex top faces (filled, batched)
            ctx.fillStyle = baseColor;
            ctx.globalAlpha = 0.65;
            ctx.beginPath();
            for (let gy = 0; gy < GRID_RES; gy++) {
                for (let gx = 0; gx < GRID_RES; gx++) {
                    if (engine.grid[gy][gx] !== p.id) continue;
                    const hc = this._hexCenter(gx, gy, cs, hexW, rowH);
                    if (hc.x > this.screenW + hexW || hc.x < -hexW || hc.y > this.screenH + hexH || hc.y < -hexH) continue;
                    this._flatHex(ctx, hc.x, hc.y, hexW * 0.52, hexH * 0.52);
                }
            }
            ctx.fill();
            ctx.globalAlpha = 1;

            // Pass 3: Hex borders (subtle grid lines)
            if (cs >= 3) {
                ctx.strokeStyle = edgeColor;
                ctx.lineWidth = Math.max(0.5, cs * 0.04);
                ctx.globalAlpha = 0.3;
                ctx.beginPath();
                for (let gy = 0; gy < GRID_RES; gy++) {
                    for (let gx = 0; gx < GRID_RES; gx++) {
                        if (engine.grid[gy][gx] !== p.id) continue;
                        const hc = this._hexCenter(gx, gy, cs, hexW, rowH);
                        if (hc.x > this.screenW + hexW || hc.x < -hexW || hc.y > this.screenH + hexH || hc.y < -hexH) continue;
                        this._flatHex(ctx, hc.x, hc.y, hexW * 0.52, hexH * 0.52);
                    }
                }
                ctx.stroke();
                ctx.globalAlpha = 1;
            }
        }
    }

    /** Compute screen center of hex cell at grid position gx,gy */
    _hexCenter(gx, gy, cs, hexW, rowH) {
        // Map grid cell to screen, with hex offset for odd rows
        const offset = (gy % 2) * hexW * 0.5;
        const wx = gx * cs + offset;
        const wy = gy * cs; // keep same Y as square grid (don't use rowH for positioning)
        const sx = wx - this.cameraX + this.screenW / 2 + cs * 0.5;
        const sy = wy - this.cameraY + this.screenH / 2 + cs * 0.5;
        return { x: sx, y: sy };
    }

    /** Check if hex at (gx,gy) has an owned neighbor below (accounting for hex offset) */
    _hexHasNeighborBelow(engine, gx, gy, pid) {
        if (gy + 1 >= GRID_RES) return false;
        // Direct below
        if (engine.grid[gy + 1][gx] === pid) return true;
        // Offset neighbor (depends on odd/even row)
        const offsetCol = (gy % 2 === 0) ? gx - 1 : gx + 1;
        if (offsetCol >= 0 && offsetCol < GRID_RES && engine.grid[gy + 1][offsetCol] === pid) return true;
        return false;
    }

    /** Draw a flat-top hexagon path at center (cx, cy) with half-width hw and half-height hh */
    _flatHex(ctx, cx, cy, hw, hh) {
        // Flat-top hex: 6 vertices starting from top-right going clockwise
        ctx.moveTo(cx + hw * 0.5, cy - hh);
        ctx.lineTo(cx + hw, cy);
        ctx.lineTo(cx + hw * 0.5, cy + hh);
        ctx.lineTo(cx - hw * 0.5, cy + hh);
        ctx.lineTo(cx - hw, cy);
        ctx.lineTo(cx - hw * 0.5, cy - hh);
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

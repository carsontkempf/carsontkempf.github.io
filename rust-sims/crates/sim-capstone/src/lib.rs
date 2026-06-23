use wasm_bindgen::prelude::*;
use web_sys::{CanvasRenderingContext2d, HtmlCanvasElement, HtmlElement};

#[wasm_bindgen]
pub fn start(canvas: HtmlCanvasElement, controls: HtmlElement) {
    let ctx = canvas.get_context("2d").unwrap().unwrap().dyn_into::<CanvasRenderingContext2d>().unwrap();
    let w = canvas.width() as f64; let h = canvas.height() as f64;
    ctx.set_fill_style_str("#050810"); ctx.fill_rect(0.0, 0.0, w, h);
    // Draw CubeSat frame (3U = 3 cubes stacked)
    let cx = w/2.0; let cy = h/2.0; let unit = 60.0;
    // Isometric cube approximation
    for u in 0..3 {
        let oy = cy - 90.0 + u as f64 * unit;
        ctx.set_stroke_style_str("#4a5a6a"); ctx.set_line_width(1.5);
        ctx.stroke_rect(cx - unit/2.0, oy, unit, unit);
        // Subsystem label
        let labels = ["ADCS", "OBC+COMM", "EPS+Payload"];
        ctx.set_fill_style_str("#00b4dc"); ctx.set_font("10px monospace");
        ctx.fill_text(labels[u], cx - 25.0, oy + unit/2.0 + 4.0).ok();
    }
    // Wiring harness lines between units
    let harness_x = cx + unit/2.0 + 15.0;
    ctx.set_stroke_style_str("#ff9040"); ctx.set_line_width(2.0);
    ctx.begin_path(); ctx.move_to(harness_x, cy - 90.0); ctx.line_to(harness_x, cy + 90.0); ctx.stroke();
    ctx.set_fill_style_str("#ff9040"); ctx.set_font("9px monospace");
    ctx.fill_text("HARNESS", harness_x + 5.0, cy).ok();
    // Connectors
    for u in 0..3 {
        let oy = cy - 90.0 + u as f64 * unit + unit/2.0;
        ctx.set_fill_style_str("#ffaa00");
        ctx.begin_path(); ctx.arc(harness_x, oy, 5.0, 0.0, std::f64::consts::TAU).ok(); ctx.fill();
        ctx.set_fill_style_str("#aaa"); ctx.set_font("8px monospace");
        ctx.fill_text(&format!("J{}", u+1), harness_x + 8.0, oy + 3.0).ok();
    }
    // Solar panels
    ctx.set_fill_style_str("#1a2a5a"); ctx.fill_rect(cx - unit/2.0 - 50.0, cy - 80.0, 40.0, 160.0);
    ctx.fill_rect(cx + unit/2.0 + 10.0, cy - 80.0, 40.0, 160.0);
    ctx.set_fill_style_str("#3a5a8a"); ctx.set_font("9px monospace");
    ctx.fill_text("SOLAR", cx - unit/2.0 - 45.0, cy).ok();
    ctx.fill_text("SOLAR", cx + unit/2.0 + 15.0, cy).ok();
    // Info
    ctx.set_fill_style_str("#f0f5ff"); ctx.set_font("13px monospace");
    ctx.fill_text("3U CubeSat EWIS - Complete Wiring System", 15.0, 20.0).ok();
    ctx.set_fill_style_str("#c8d2dc"); ctx.set_font("10px monospace");
    ctx.fill_text("6 subsystems | 8 connectors | ~52 wires | Full analysis", 15.0, h - 15.0).ok();
    controls.set_inner_html(r#"<div style="color:#c8d2dc;font-family:monospace;font-size:11px;">Capstone: full CubeSat EWIS integrating all modules. Click subsystems (coming soon) to see pin-level detail.</div>"#);
}

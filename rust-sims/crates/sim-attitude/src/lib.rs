use wasm_bindgen::prelude::*;
use web_sys::{CanvasRenderingContext2d, HtmlCanvasElement, HtmlElement};

#[wasm_bindgen]
pub fn start(canvas: HtmlCanvasElement, controls: HtmlElement) {
    let ctx = canvas.get_context("2d").unwrap().unwrap().dyn_into::<CanvasRenderingContext2d>().unwrap();
    let w = canvas.width() as f64; let h = canvas.height() as f64;
    ctx.set_fill_style_str("#050810"); ctx.fill_rect(0.0, 0.0, w, h);
    let cx = w/2.0; let cy = h/2.0; let s = h*0.35;
    // Draw sphere outline
    ctx.set_stroke_style_str("#2a3a4a"); ctx.set_line_width(1.0);
    ctx.begin_path(); ctx.arc(cx, cy, s, 0.0, std::f64::consts::TAU).ok(); ctx.stroke();
    // Draw body axes (fixed initial orientation)
    let axes = [(1.0,0.0,0.0,"#ff4040","X"),(0.0,1.0,0.0,"#50dc64","Y"),(0.0,0.0,1.0,"#4090ff","Z (boresight)")];
    for &(x,y,z,col,label) in &axes {
        let px = cx + x * s * 0.8 + z * s * 0.3;
        let py = cy - y * s * 0.8 + z * s * 0.1;
        ctx.set_stroke_style_str(col); ctx.set_line_width(3.0);
        ctx.begin_path(); ctx.move_to(cx, cy); ctx.line_to(px, py); ctx.stroke();
        ctx.set_fill_style_str(col); ctx.set_font("11px monospace");
        ctx.fill_text(label, px + 5.0, py).ok();
    }
    // Keep-out cone
    ctx.set_stroke_style_str("#ff4040"); ctx.set_line_width(1.5);
    ctx.begin_path(); ctx.arc(cx, cy + s * 0.9, s * 0.15, 0.0, std::f64::consts::TAU).ok(); ctx.stroke();
    ctx.set_fill_style_str("#ff4040"); ctx.set_font("10px monospace");
    ctx.fill_text("KEEP-OUT CONE", cx - 40.0, cy + s * 0.9 + s * 0.2).ok();
    // Info
    ctx.set_fill_style_str("#f0f5ff"); ctx.set_font("12px monospace");
    ctx.fill_text("Spacecraft Attitude (quaternion dynamics)", 15.0, 20.0).ok();
    ctx.fill_text("Blue = boresight axis | Red circle = keep-out zone", 15.0, h - 15.0).ok();
    controls.set_inner_html(r#"<div style="color:#c8d2dc;font-family:monospace;font-size:11px;">Static view. See the desktop app (aerospace-systems) for interactive 3D attitude simulation.</div>"#);
}

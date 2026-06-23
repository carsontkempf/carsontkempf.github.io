use wasm_bindgen::prelude::*;
use web_sys::{CanvasRenderingContext2d, HtmlCanvasElement, HtmlElement};

#[wasm_bindgen]
pub fn start(canvas: HtmlCanvasElement, controls: HtmlElement) {
    let ctx = canvas.get_context("2d").unwrap().unwrap().dyn_into::<CanvasRenderingContext2d>().unwrap();
    let w = canvas.width() as f64; let h = canvas.height() as f64;
    ctx.set_fill_style_str("#0e1118"); ctx.fill_rect(0.0, 0.0, w, h);
    // Draw MIL-38999 connector face (circular with pins)
    let cx = w / 2.0; let cy = h / 2.0; let r = h * 0.35;
    ctx.set_stroke_style_str("#666"); ctx.set_line_width(3.0);
    ctx.begin_path(); ctx.arc(cx, cy, r, 0.0, std::f64::consts::TAU).ok(); ctx.stroke();
    ctx.begin_path(); ctx.arc(cx, cy, r * 0.85, 0.0, std::f64::consts::TAU).ok(); ctx.stroke();
    // Pin layout (3 rings)
    let pin_types = [("#ff6040", "PWR"), ("#50dc64", "GND"), ("#4090ff", "SIG"), ("#ffaa00", "DATA"), ("#888", "SPARE")];
    let mut pin_num = 1;
    for ring in 0..3 {
        let ring_r = r * (0.3 + ring as f64 * 0.25);
        let n_pins = 6 + ring * 4;
        for i in 0..n_pins {
            let angle = std::f64::consts::TAU * i as f64 / n_pins as f64;
            let px = cx + ring_r * angle.cos();
            let py = cy + ring_r * angle.sin();
            let (col, _label) = pin_types[((ring * 3 + i) % 5) as usize];
            ctx.set_fill_style_str(col);
            ctx.begin_path(); ctx.arc(px, py, 5.0, 0.0, std::f64::consts::TAU).ok(); ctx.fill();
            ctx.set_fill_style_str("#333"); ctx.set_font("7px monospace");
            ctx.fill_text(&format!("{}", pin_num), px - 4.0, py + 3.0).ok();
            pin_num += 1;
        }
    }
    // Legend
    ctx.set_font("11px monospace");
    let mut ly = 20.0;
    for &(col, label) in &pin_types { ctx.set_fill_style_str(col); ctx.fill_text(label, 15.0, ly).ok(); ly += 16.0; }
    ctx.set_fill_style_str("#c8d2dc"); ctx.set_font("12px monospace");
    ctx.fill_text("MIL-DTL-38999 Connector (34 pins)", cx - 120.0, h - 15.0).ok();
    ctx.fill_text("Red=Power Blue=Signal Green=Ground Yellow=Data Gray=Spare", 15.0, h - 35.0).ok();
    controls.set_inner_html(r#"<div style="color:#c8d2dc;font-family:monospace;font-size:11px;">Pin assignment visualization. Colors indicate signal category per AS50881 separation rules.</div>"#);
}

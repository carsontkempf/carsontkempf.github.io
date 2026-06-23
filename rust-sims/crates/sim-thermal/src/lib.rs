use wasm_bindgen::prelude::*;
use web_sys::{CanvasRenderingContext2d, HtmlCanvasElement, HtmlElement, Document};
use std::cell::RefCell; use std::rc::Rc;

struct State { n_wires: usize, current_each: f64, ambient: f64 }
impl State {
    fn bundle_derating(&self) -> f64 {
        match self.n_wires { 0..=3 => 1.0, 4..=7 => 0.8, 8..=19 => 0.7, 20..=39 => 0.5, _ => 0.4 }
    }
    fn center_temp(&self) -> f64 {
        let r_per_m = 0.033; // 20AWG
        let power_per_wire = self.current_each * self.current_each * r_per_m;
        let total_power = power_per_wire * self.n_wires as f64;
        self.ambient + total_power * 5.0 / self.bundle_derating()
    }
}

#[wasm_bindgen]
pub fn start(canvas: HtmlCanvasElement, controls: HtmlElement) {
    let ctx = canvas.get_context("2d").unwrap().unwrap().dyn_into::<CanvasRenderingContext2d>().unwrap();
    let w = canvas.width() as f64; let h = canvas.height() as f64;
    let state = Rc::new(RefCell::new(State { n_wires: 12, current_each: 3.0, ambient: 25.0 }));
    render(&ctx, &state.borrow(), w, h);
    let doc = web_sys::window().unwrap().document().unwrap();
    controls.set_inner_html(r#"<div style="display:flex;gap:12px;align-items:center;color:#c8d2dc;font-family:monospace;font-size:11px;flex-wrap:wrap;">
        <label>Wires: <input type="range" id="th-n" min="1" max="50" value="12" style="width:80px"><span id="th-nv">12</span></label>
        <label>I each(A): <input type="range" id="th-i" min="0.5" max="10" value="3" step="0.5" style="width:80px"><span id="th-iv">3</span></label>
        <label>Ambient(C): <input type="range" id="th-a" min="20" max="120" value="25" step="5" style="width:80px"><span id="th-av">25</span></label>
    </div>"#);
    let s = state.clone(); let c = ctx.clone();
    let update = Closure::wrap(Box::new(move || {
        let d = web_sys::window().unwrap().document().unwrap();
        let n = gv(&d,"th-n") as usize; let i = gv(&d,"th-i"); let a = gv(&d,"th-a");
        st(&d,"th-nv",&format!("{}",n)); st(&d,"th-iv",&format!("{:.1}",i)); st(&d,"th-av",&format!("{:.0}",a));
        let mut st2 = s.borrow_mut(); st2.n_wires = n; st2.current_each = i; st2.ambient = a;
        render(&c, &st2, w, h);
    }) as Box<dyn Fn()>);
    for id in &["th-n","th-i","th-a"] { if let Some(el) = doc.get_element_by_id(id) { el.add_event_listener_with_callback("input", update.as_ref().unchecked_ref()).ok(); } }
    update.forget();
}

fn render(ctx: &CanvasRenderingContext2d, s: &State, w: f64, h: f64) {
    ctx.set_fill_style_str("#0e1118"); ctx.fill_rect(0.0, 0.0, w, h);
    let cx = w / 2.0; let cy = h * 0.45;
    let temp = s.center_temp();
    let temp_frac = ((temp - 20.0) / 160.0).clamp(0.0, 1.0);
    // Draw bundle cross-section
    let bundle_r = (s.n_wires as f64).sqrt() * 12.0;
    // Gradient from center (hot) to edge (cool)
    for ring in (0..20).rev() {
        let r = bundle_r * (ring as f64 + 1.0) / 20.0;
        let t = temp_frac * (1.0 - ring as f64 / 25.0);
        let red = (t * 255.0) as u8;
        let blue = ((1.0 - t) * 100.0) as u8;
        ctx.set_fill_style_str(&format!("rgb({},40,{})", red, blue));
        ctx.begin_path(); ctx.arc(cx, cy, r, 0.0, std::f64::consts::TAU).ok(); ctx.fill();
    }
    // Draw individual wire circles
    let n = s.n_wires;
    for i in 0..n {
        let angle = std::f64::consts::TAU * i as f64 / n as f64;
        let r = if n <= 7 { bundle_r * 0.4 } else { bundle_r * 0.7 };
        let px = cx + r * angle.cos();
        let py = cy + r * angle.sin();
        ctx.set_stroke_style_str("#aaa"); ctx.set_line_width(1.0);
        ctx.begin_path(); ctx.arc(px, py, 4.0, 0.0, std::f64::consts::TAU).ok(); ctx.stroke();
    }
    // Info
    let pass = temp < 150.0;
    ctx.set_fill_style_str("#f0f5ff"); ctx.set_font("12px monospace");
    ctx.fill_text(&format!("Bundle: {} wires | Derating: {:.1}", n, s.bundle_derating()), 20.0, 20.0).ok();
    ctx.fill_text(&format!("Center temp: {:.0}C (limit: 150C)", temp), 20.0, 38.0).ok();
    let (label, col) = if pass { ("PASS", "#50dc64") } else { ("FAIL - OVERHEATING", "#ff4040") };
    ctx.set_fill_style_str(col); ctx.set_font("14px monospace");
    ctx.fill_text(label, 20.0, h - 20.0).ok();
}

fn gv(d:&Document,id:&str)->f64{d.get_element_by_id(id).and_then(|e|e.dyn_into::<web_sys::HtmlInputElement>().ok()).map(|i|i.value().parse().unwrap_or(0.0)).unwrap_or(0.0)}
fn st(d:&Document,id:&str,t:&str){if let Some(e)=d.get_element_by_id(id){e.set_text_content(Some(t));}}

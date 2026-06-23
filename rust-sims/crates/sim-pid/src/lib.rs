use wasm_bindgen::prelude::*;
use web_sys::{CanvasRenderingContext2d, HtmlCanvasElement, HtmlElement, Document};
use std::cell::RefCell;
use std::rc::Rc;

struct State { kp: f64, ki: f64, kd: f64, setpoint: f64, output: Vec<f64>, error: Vec<f64> }

impl State {
    fn simulate(&mut self) {
        let dt = 0.01;
        let steps = 800;
        self.output.clear(); self.error.clear();
        let mut y = 0.0;
        let mut dy = 0.0;
        let mut integral = 0.0;
        let mut prev_err = self.setpoint;
        // Second-order plant: m*ddx + b*dx + k*x = u (mass-spring-damper)
        let m = 1.0; let b = 0.5; let k = 1.0;
        for _ in 0..steps {
            let err = self.setpoint - y;
            integral += err * dt;
            let derivative = (err - prev_err) / dt;
            let u = self.kp * err + self.ki * integral + self.kd * derivative;
            let ddy = (u - b * dy - k * y) / m;
            dy += ddy * dt;
            y += dy * dt;
            prev_err = err;
            self.output.push(y);
            self.error.push(err);
        }
    }
}

#[wasm_bindgen]
pub fn start(canvas: HtmlCanvasElement, controls: HtmlElement) {
    let ctx = canvas.get_context("2d").unwrap().unwrap().dyn_into::<CanvasRenderingContext2d>().unwrap();
    let w = canvas.width() as f64; let h = canvas.height() as f64;
    let state = Rc::new(RefCell::new(State { kp: 10.0, ki: 2.0, kd: 5.0, setpoint: 1.0, output: Vec::new(), error: Vec::new() }));
    state.borrow_mut().simulate();
    render(&ctx, &state.borrow(), w, h);
    let doc = web_sys::window().unwrap().document().unwrap();
    setup(&doc, &controls, state, ctx, w, h);
}

fn render(ctx: &CanvasRenderingContext2d, s: &State, w: f64, h: f64) {
    ctx.set_fill_style_str("#0e1118"); ctx.fill_rect(0.0, 0.0, w, h);
    let n = s.output.len();
    if n == 0 { return; }
    // Setpoint line
    let plot_h = h - 50.0;
    let y_max = s.output.iter().fold(s.setpoint, |a, &b| a.max(b.abs())) * 1.3;
    let sp_y = 25.0 + plot_h * (1.0 - s.setpoint / y_max);
    ctx.set_stroke_style_str("#666"); ctx.set_line_width(1.0);
    ctx.begin_path(); ctx.move_to(20.0, sp_y); ctx.line_to(w - 20.0, sp_y); ctx.stroke();
    ctx.set_fill_style_str("#888"); ctx.set_font("10px monospace");
    ctx.fill_text("setpoint", w - 70.0, sp_y - 4.0).ok();
    // Output curve
    ctx.set_stroke_style_str("#50dc64"); ctx.set_line_width(2.0); ctx.begin_path();
    for (i, &v) in s.output.iter().enumerate() {
        let px = 20.0 + (i as f64 / n as f64) * (w - 40.0);
        let py = 25.0 + plot_h * (1.0 - v / y_max);
        if i == 0 { ctx.move_to(px, py); } else { ctx.line_to(px, py); }
    }
    ctx.stroke();
    // Info
    let overshoot = s.output.iter().fold(0.0_f64, |a, &b| a.max(b)) - s.setpoint;
    let os_pct = overshoot / s.setpoint * 100.0;
    // Settling: find last time output is outside 2% band
    let band = s.setpoint * 0.02;
    let settle_idx = s.output.iter().rposition(|&v| (v - s.setpoint).abs() > band).unwrap_or(0);
    let settle_time = settle_idx as f64 * 0.01;
    ctx.set_fill_style_str("#f0f5ff"); ctx.set_font("12px monospace");
    ctx.fill_text(&format!("Kp={:.1} Ki={:.1} Kd={:.1}", s.kp, s.ki, s.kd), 20.0, 16.0).ok();
    ctx.fill_text(&format!("Overshoot: {:.1}% | Settle(2%): {:.2}s", os_pct.max(0.0), settle_time), 20.0, h - 30.0).ok();
    // Stability indicator
    let stable = s.output.last().map(|&v| (v - s.setpoint).abs() < 0.1).unwrap_or(false);
    let label = if stable { "STABLE" } else { "UNSTABLE/OSCILLATING" };
    let col = if stable { "#50dc64" } else { "#ff4040" };
    ctx.set_fill_style_str(col); ctx.fill_text(label, 20.0, h - 12.0).ok();
}

fn setup(doc: &Document, controls: &HtmlElement, state: Rc<RefCell<State>>, ctx: CanvasRenderingContext2d, w: f64, h: f64) {
    controls.set_inner_html(r#"<div style="display:flex;gap:12px;align-items:center;color:#c8d2dc;font-family:monospace;font-size:11px;flex-wrap:wrap;">
        <label>Kp: <input type="range" id="pid-p" min="0" max="50" value="10" step="0.5" style="width:80px"><span id="pid-pv">10</span></label>
        <label>Ki: <input type="range" id="pid-i" min="0" max="20" value="2" step="0.5" style="width:80px"><span id="pid-iv">2</span></label>
        <label>Kd: <input type="range" id="pid-d" min="0" max="20" value="5" step="0.5" style="width:80px"><span id="pid-dv">5</span></label>
    </div>"#);
    let update = Closure::wrap(Box::new(move || {
        let d = web_sys::window().unwrap().document().unwrap();
        let p = gv(&d, "pid-p"); let i = gv(&d, "pid-i"); let dd = gv(&d, "pid-d");
        st(&d, "pid-pv", &format!("{:.1}", p)); st(&d, "pid-iv", &format!("{:.1}", i)); st(&d, "pid-dv", &format!("{:.1}", dd));
        let mut s = state.borrow_mut();
        s.kp = p; s.ki = i; s.kd = dd;
        s.simulate(); render(&ctx, &s, w, h);
    }) as Box<dyn Fn()>);
    for id in &["pid-p", "pid-i", "pid-d"] {
        if let Some(el) = doc.get_element_by_id(id) { el.add_event_listener_with_callback("input", update.as_ref().unchecked_ref()).ok(); }
    }
    update.forget();
}

fn gv(d: &Document, id: &str) -> f64 { d.get_element_by_id(id).and_then(|e| e.dyn_into::<web_sys::HtmlInputElement>().ok()).map(|i| i.value().parse().unwrap_or(0.0)).unwrap_or(0.0) }
fn st(d: &Document, id: &str, t: &str) { if let Some(e) = d.get_element_by_id(id) { e.set_text_content(Some(t)); } }

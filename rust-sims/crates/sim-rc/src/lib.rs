use wasm_bindgen::prelude::*;
use web_sys::{CanvasRenderingContext2d, HtmlCanvasElement, HtmlElement, Document};
use std::cell::RefCell;
use std::rc::Rc;

struct State { r: f64, c: f64, v_src: f64, time: Vec<f64>, voltage: Vec<f64>, current: Vec<f64> }

impl State {
    fn compute(&mut self) {
        let tau = self.r * self.c;
        let dt = 0.0001;
        let steps = 2000;
        self.time.clear(); self.voltage.clear(); self.current.clear();
        for i in 0..steps {
            let t = i as f64 * dt;
            let v = self.v_src * (1.0 - (-t / tau).exp());
            let i_c = (self.v_src / self.r) * (-t / tau).exp();
            self.time.push(t);
            self.voltage.push(v);
            self.current.push(i_c);
        }
    }
}

#[wasm_bindgen]
pub fn start(canvas: HtmlCanvasElement, controls: HtmlElement) {
    let ctx = canvas.get_context("2d").unwrap().unwrap().dyn_into::<CanvasRenderingContext2d>().unwrap();
    let w = canvas.width() as f64;
    let h = canvas.height() as f64;
    let state = Rc::new(RefCell::new(State { r: 1000.0, c: 0.00001, v_src: 5.0, time: Vec::new(), voltage: Vec::new(), current: Vec::new() }));
    state.borrow_mut().compute();
    render(&ctx, &state.borrow(), w, h);
    let doc = web_sys::window().unwrap().document().unwrap();
    setup(&doc, &controls, state, ctx, w, h);
}

fn render(ctx: &CanvasRenderingContext2d, s: &State, w: f64, h: f64) {
    ctx.set_fill_style_str("#0e1118");
    ctx.fill_rect(0.0, 0.0, w, h);
    let tau = s.r * s.c;
    let half = h / 2.0;
    // Top: voltage
    ctx.set_fill_style_str("#00b4dc");
    ctx.set_font("12px monospace");
    ctx.fill_text(&format!("Capacitor Voltage (tau = {:.4}s = {:.2}ms)", tau, tau*1000.0), 20.0, 20.0).ok();
    draw_curve(ctx, &s.time, &s.voltage, 0.0, s.v_src * 1.1, 20.0, 30.0, w - 40.0, half - 50.0, "#50dc64");
    // Tau markers
    let px_per_s = (w - 40.0) / s.time.last().copied().unwrap_or(1.0);
    for i in 1..=5 {
        let tx = 20.0 + tau * i as f64 * px_per_s;
        if tx < w - 20.0 {
            ctx.set_stroke_style_str("#444");
            ctx.begin_path(); ctx.move_to(tx, 30.0); ctx.line_to(tx, half - 20.0); ctx.stroke();
            ctx.set_fill_style_str("#888");
            ctx.fill_text(&format!("{}t", i), tx - 5.0, half - 8.0).ok();
        }
    }
    // 63.2% line
    let y63 = 30.0 + (half - 50.0) * (1.0 - 0.632);
    ctx.set_stroke_style_str("#ffaa00");
    ctx.begin_path(); ctx.move_to(20.0, y63); ctx.line_to(w - 20.0, y63); ctx.stroke();
    ctx.set_fill_style_str("#ffaa00");
    ctx.fill_text("63.2%", w - 60.0, y63 - 4.0).ok();
    // Bottom: current
    ctx.set_fill_style_str("#00b4dc");
    ctx.fill_text("Current (exponential decay)", 20.0, half + 20.0).ok();
    let i_max = s.v_src / s.r;
    draw_curve(ctx, &s.time, &s.current, 0.0, i_max * 1.1, 20.0, half + 30.0, w - 40.0, half - 60.0, "#ff6040");
}

fn draw_curve(ctx: &CanvasRenderingContext2d, t: &[f64], y: &[f64], y_min: f64, y_max: f64, ox: f64, oy: f64, pw: f64, ph: f64, color: &str) {
    if t.is_empty() { return; }
    let t_max = *t.last().unwrap();
    ctx.set_stroke_style_str(color);
    ctx.set_line_width(2.0);
    ctx.begin_path();
    for (i, (&ti, &yi)) in t.iter().zip(y.iter()).enumerate() {
        let px = ox + (ti / t_max) * pw;
        let py = oy + ph - ((yi - y_min) / (y_max - y_min)) * ph;
        if i == 0 { ctx.move_to(px, py); } else { ctx.line_to(px, py); }
    }
    ctx.stroke();
}

fn setup(doc: &Document, controls: &HtmlElement, state: Rc<RefCell<State>>, ctx: CanvasRenderingContext2d, w: f64, h: f64) {
    controls.set_inner_html(r#"<div style="display:flex;gap:14px;align-items:center;color:#c8d2dc;font-family:monospace;font-size:11px;flex-wrap:wrap;">
        <label>R(ohm): <input type="range" id="rc-r" min="100" max="10000" value="1000" step="100" style="width:80px"><span id="rc-rv">1k</span></label>
        <label>C(uF): <input type="range" id="rc-c" min="1" max="100" value="10" step="1" style="width:80px"><span id="rc-cv">10</span></label>
        <label>V: <input type="range" id="rc-v" min="1" max="28" value="5" style="width:80px"><span id="rc-vv">5V</span></label>
    </div>"#);
    let update = Closure::wrap(Box::new(move || {
        let d = web_sys::window().unwrap().document().unwrap();
        let r = gv(&d, "rc-r"); let c = gv(&d, "rc-c"); let v = gv(&d, "rc-v");
        st(&d, "rc-rv", &fmtr(r)); st(&d, "rc-cv", &format!("{:.0}uF", c)); st(&d, "rc-vv", &format!("{:.0}V", v));
        let mut s = state.borrow_mut();
        s.r = r; s.c = c * 1e-6; s.v_src = v;
        s.compute(); render(&ctx, &s, w, h);
    }) as Box<dyn Fn()>);
    for id in &["rc-r", "rc-c", "rc-v"] {
        if let Some(el) = doc.get_element_by_id(id) { el.add_event_listener_with_callback("input", update.as_ref().unchecked_ref()).ok(); }
    }
    update.forget();
}

fn gv(d: &Document, id: &str) -> f64 { d.get_element_by_id(id).and_then(|e| e.dyn_into::<web_sys::HtmlInputElement>().ok()).map(|i| i.value().parse().unwrap_or(0.0)).unwrap_or(0.0) }
fn st(d: &Document, id: &str, t: &str) { if let Some(e) = d.get_element_by_id(id) { e.set_text_content(Some(t)); } }
fn fmtr(r: f64) -> String { if r >= 1000.0 { format!("{:.1}k", r/1000.0) } else { format!("{:.0}", r) } }

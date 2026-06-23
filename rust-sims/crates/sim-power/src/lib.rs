use wasm_bindgen::prelude::*;
use web_sys::{CanvasRenderingContext2d, HtmlCanvasElement, HtmlElement, Document};
use std::cell::RefCell; use std::rc::Rc;

struct State { bus_v: f64, loads: Vec<f64>, fuse_blown: Vec<bool>, redundant: bool }
impl State {
    fn new() -> Self { Self { bus_v: 28.0, loads: vec![5.0,3.0,8.0,2.0,4.0,6.0], fuse_blown: vec![false;6], redundant: true } }
    fn total_current(&self) -> f64 { self.loads.iter().zip(self.fuse_blown.iter()).filter(|(_,&b)|!b).map(|(&l,_)|l/self.bus_v).sum() }
}

#[wasm_bindgen]
pub fn start(canvas: HtmlCanvasElement, controls: HtmlElement) {
    let ctx = canvas.get_context("2d").unwrap().unwrap().dyn_into::<CanvasRenderingContext2d>().unwrap();
    let w = canvas.width() as f64; let h = canvas.height() as f64;
    let state = Rc::new(RefCell::new(State::new()));
    render(&ctx, &state.borrow(), w, h);
    controls.set_inner_html(r#"<div style="display:flex;gap:8px;align-items:center;color:#c8d2dc;font-family:monospace;font-size:11px;">
        <button id="pw-f0">Blow Fuse 1</button><button id="pw-f1">Blow Fuse 2</button><button id="pw-f2">Blow Fuse 3</button>
        <button id="pw-rst">Reset All</button><label><input type="checkbox" id="pw-red" checked> Redundant Bus</label>
    </div>"#);
    let doc = web_sys::window().unwrap().document().unwrap();
    for i in 0..3 {
        let s = state.clone(); let c = ctx.clone();
        let cb = Closure::wrap(Box::new(move || { s.borrow_mut().fuse_blown[i] = true; render(&c, &s.borrow(), w, h); }) as Box<dyn Fn()>);
        if let Some(el) = doc.get_element_by_id(&format!("pw-f{}", i)) { el.add_event_listener_with_callback("click", cb.as_ref().unchecked_ref()).ok(); }
        cb.forget();
    }
    let s2 = state.clone(); let c2 = ctx.clone();
    let rst = Closure::wrap(Box::new(move || { *s2.borrow_mut() = State::new(); render(&c2, &s2.borrow(), w, h); }) as Box<dyn Fn()>);
    if let Some(el) = doc.get_element_by_id("pw-rst") { el.add_event_listener_with_callback("click", rst.as_ref().unchecked_ref()).ok(); }
    rst.forget();
}

fn render(ctx: &CanvasRenderingContext2d, s: &State, w: f64, h: f64) {
    ctx.set_fill_style_str("#0e1118"); ctx.fill_rect(0.0, 0.0, w, h);
    let cx = w / 2.0;
    // Bus bar
    ctx.set_stroke_style_str("#ff9040"); ctx.set_line_width(4.0);
    ctx.begin_path(); ctx.move_to(50.0, 60.0); ctx.line_to(w - 50.0, 60.0); ctx.stroke();
    ctx.set_fill_style_str("#ff9040"); ctx.set_font("12px monospace");
    ctx.fill_text(&format!("28V BUS (I_total = {:.2}A)", s.total_current()), 50.0, 45.0).ok();
    // Load branches
    let labels = ["OBC","COMM","ADCS","Payload","Thermal","EPS"];
    for (i, (&load, &blown)) in s.loads.iter().zip(s.fuse_blown.iter()).enumerate() {
        let x = 80.0 + i as f64 * (w - 160.0) / 5.0;
        let col = if blown { "#ff4040" } else { "#50dc64" };
        ctx.set_stroke_style_str(col); ctx.set_line_width(2.0);
        ctx.begin_path(); ctx.move_to(x, 60.0); ctx.line_to(x, 180.0); ctx.stroke();
        // Fuse symbol
        ctx.set_fill_style_str(if blown { "#ff4040" } else { "#ffaa00" });
        ctx.fill_rect(x - 8.0, 90.0, 16.0, 8.0);
        if blown { ctx.set_fill_style_str("#ff4040"); ctx.fill_text("X", x - 4.0, 88.0).ok(); }
        // Load box
        ctx.set_fill_style_str("#1a2030"); ctx.fill_rect(x - 25.0, 150.0, 50.0, 35.0);
        ctx.set_stroke_style_str(col); ctx.stroke_rect(x - 25.0, 150.0, 50.0, 35.0);
        ctx.set_fill_style_str("#c8d2dc"); ctx.set_font("9px monospace");
        ctx.fill_text(labels[i], x - 15.0, 167.0).ok();
        ctx.fill_text(&format!("{:.0}W", load), x - 12.0, 180.0).ok();
    }
    // Status
    let active = s.fuse_blown.iter().filter(|&&b| !b).count();
    ctx.set_fill_style_str("#c8d2dc"); ctx.set_font("11px monospace");
    ctx.fill_text(&format!("{}/6 loads active | Total power: {:.1}W", active, s.total_current() * s.bus_v), 20.0, h - 15.0).ok();
}

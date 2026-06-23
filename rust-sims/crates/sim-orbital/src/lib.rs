use wasm_bindgen::prelude::*;
use web_sys::{CanvasRenderingContext2d, HtmlCanvasElement, HtmlElement, Document};
use std::cell::RefCell;
use std::rc::Rc;

const MU: f64 = 3.986e14; // Earth gravitational parameter (m^3/s^2)
const R_EARTH: f64 = 6.371e6; // Earth radius (m)

struct OrbitalState { alt_km: f64, phase: f64, trail: Vec<(f64, f64)>, hohmann_target: f64, show_transfer: bool }

impl OrbitalState {
    fn radius(&self) -> f64 { R_EARTH + self.alt_km * 1000.0 }
    fn velocity(&self) -> f64 { (MU / self.radius()).sqrt() }
    fn period(&self) -> f64 { 2.0 * std::f64::consts::PI * (self.radius().powi(3) / MU).sqrt() }
    fn hohmann_dv(&self) -> (f64, f64) {
        let r1 = self.radius();
        let r2 = R_EARTH + self.hohmann_target * 1000.0;
        let v1 = (MU / r1).sqrt();
        let v_transfer_1 = (MU * (2.0/r1 - 2.0/(r1+r2))).sqrt();
        let v_transfer_2 = (MU * (2.0/r2 - 2.0/(r1+r2))).sqrt();
        let v2 = (MU / r2).sqrt();
        ((v_transfer_1 - v1).abs(), (v2 - v_transfer_2).abs())
    }
}

#[wasm_bindgen]
pub fn start(canvas: HtmlCanvasElement, controls: HtmlElement) {
    let ctx = canvas.get_context("2d").unwrap().unwrap().dyn_into::<CanvasRenderingContext2d>().unwrap();
    let w = canvas.width() as f64; let h = canvas.height() as f64;
    let state = Rc::new(RefCell::new(OrbitalState { alt_km: 400.0, phase: 0.0, trail: Vec::new(), hohmann_target: 35786.0, show_transfer: true }));
    render(&ctx, &state.borrow(), w, h);
    let doc = web_sys::window().unwrap().document().unwrap();
    setup(&doc, &controls, state, ctx, w, h);
    // Animation frame loop
    let ctx2 = canvas.get_context("2d").unwrap().unwrap().dyn_into::<CanvasRenderingContext2d>().unwrap();
}

fn render(ctx: &CanvasRenderingContext2d, s: &OrbitalState, w: f64, h: f64) {
    ctx.set_fill_style_str("#050810"); ctx.fill_rect(0.0, 0.0, w, h);
    let cx = w / 2.0; let cy = h / 2.0;
    let scale = (h * 0.4) / (R_EARTH + 40000.0 * 1000.0); // scale to fit GEO

    // Earth
    let er = R_EARTH * scale;
    ctx.set_fill_style_str("#1a4a2a");
    ctx.begin_path(); ctx.arc(cx, cy, er, 0.0, std::f64::consts::TAU).ok(); ctx.fill();
    ctx.set_stroke_style_str("#2a6a3a"); ctx.stroke();

    // Orbit circle
    let orbit_r = s.radius() * scale;
    ctx.set_stroke_style_str("#00b4dc"); ctx.set_line_width(1.5);
    ctx.begin_path(); ctx.arc(cx, cy, orbit_r, 0.0, std::f64::consts::TAU).ok(); ctx.stroke();

    // Satellite position
    let sat_x = cx + orbit_r * s.phase.cos();
    let sat_y = cy - orbit_r * s.phase.sin();
    ctx.set_fill_style_str("#ffffff");
    ctx.begin_path(); ctx.arc(sat_x, sat_y, 4.0, 0.0, std::f64::consts::TAU).ok(); ctx.fill();

    // Hohmann transfer orbit (if enabled)
    if s.show_transfer {
        let r2 = (R_EARTH + s.hohmann_target * 1000.0) * scale;
        // Target orbit
        ctx.set_stroke_style_str("#ff6040"); ctx.set_line_width(1.0);
        ctx.begin_path(); ctx.arc(cx, cy, r2, 0.0, std::f64::consts::TAU).ok(); ctx.stroke();
        // Transfer ellipse (approximate as half-ellipse)
        let a = (orbit_r + r2) / 2.0;
        let b = (orbit_r * r2).sqrt();
        ctx.set_stroke_style_str("#ffaa00"); ctx.set_line_width(1.5);
        ctx.begin_path();
        ctx.ellipse(cx + (r2 - orbit_r) / 2.0 * 0.0, cy, a, b.min(a), 0.0, std::f64::consts::PI, std::f64::consts::TAU).ok();
        ctx.stroke();
    }

    // Info panel
    ctx.set_fill_style_str("#f0f5ff"); ctx.set_font("11px monospace");
    let mut y = 20.0;
    ctx.fill_text(&format!("Altitude: {:.0} km", s.alt_km), 15.0, y).ok(); y += 16.0;
    ctx.fill_text(&format!("Radius: {:.0} km", s.radius()/1000.0), 15.0, y).ok(); y += 16.0;
    ctx.fill_text(&format!("Velocity: {:.2} km/s", s.velocity()/1000.0), 15.0, y).ok(); y += 16.0;
    ctx.fill_text(&format!("Period: {:.1} min", s.period()/60.0), 15.0, y).ok(); y += 16.0;
    if s.show_transfer {
        let (dv1, dv2) = s.hohmann_dv();
        y += 8.0;
        ctx.set_fill_style_str("#ffaa00");
        ctx.fill_text("Hohmann Transfer:", 15.0, y).ok(); y += 16.0;
        ctx.fill_text(&format!("  dv1: {:.1} m/s", dv1), 15.0, y).ok(); y += 16.0;
        ctx.fill_text(&format!("  dv2: {:.1} m/s", dv2), 15.0, y).ok(); y += 16.0;
        ctx.fill_text(&format!("  Total: {:.1} m/s", dv1+dv2), 15.0, y).ok();
    }
}

fn setup(doc: &Document, controls: &HtmlElement, state: Rc<RefCell<OrbitalState>>, ctx: CanvasRenderingContext2d, w: f64, h: f64) {
    controls.set_inner_html(r#"<div style="display:flex;gap:12px;align-items:center;color:#c8d2dc;font-family:monospace;font-size:11px;flex-wrap:wrap;">
        <label>Altitude(km): <input type="range" id="orb-alt" min="200" max="2000" value="400" step="50" style="width:100px"><span id="orb-av">400</span></label>
        <label>Target(km): <input type="range" id="orb-tgt" min="500" max="36000" value="35786" step="500" style="width:100px"><span id="orb-tv">35786</span></label>
        <label><input type="checkbox" id="orb-hoh" checked> Hohmann</label>
    </div>"#);
    let update = Closure::wrap(Box::new(move || {
        let d = web_sys::window().unwrap().document().unwrap();
        let alt = gv(&d, "orb-alt"); let tgt = gv(&d, "orb-tgt");
        st(&d, "orb-av", &format!("{:.0}", alt)); st(&d, "orb-tv", &format!("{:.0}", tgt));
        let checked = d.get_element_by_id("orb-hoh").and_then(|e| e.dyn_into::<web_sys::HtmlInputElement>().ok()).map(|i| i.checked()).unwrap_or(true);
        let mut s = state.borrow_mut();
        s.alt_km = alt; s.hohmann_target = tgt; s.show_transfer = checked;
        render(&ctx, &s, w, h);
    }) as Box<dyn Fn()>);
    for id in &["orb-alt", "orb-tgt", "orb-hoh"] {
        if let Some(el) = doc.get_element_by_id(id) { el.add_event_listener_with_callback("input", update.as_ref().unchecked_ref()).ok(); }
    }
    update.forget();
}

fn gv(d: &Document, id: &str) -> f64 { d.get_element_by_id(id).and_then(|e| e.dyn_into::<web_sys::HtmlInputElement>().ok()).map(|i| i.value().parse().unwrap_or(0.0)).unwrap_or(0.0) }
fn st(d: &Document, id: &str, t: &str) { if let Some(e) = d.get_element_by_id(id) { e.set_text_content(Some(t)); } }

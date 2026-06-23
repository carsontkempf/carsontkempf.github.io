use wasm_bindgen::prelude::*;
use web_sys::{CanvasRenderingContext2d, HtmlCanvasElement, HtmlElement, Document};
use std::cell::RefCell; use std::rc::Rc;

struct State { separation_cm: f64, frequency_mhz: f64, shielding_db: f64, wire_length_m: f64 }

impl State {
    fn crosstalk_db(&self) -> f64 {
        // Simplified capacitive crosstalk model
        let coupling = -20.0 * (self.separation_cm / 1.0).log10() - 10.0 * (self.wire_length_m).log10() + 20.0 * (self.frequency_mhz).log10();
        (coupling - self.shielding_db).min(0.0)
    }
    fn passes_mil_std(&self) -> bool { self.crosstalk_db() < -40.0 }
}

#[wasm_bindgen]
pub fn start(canvas: HtmlCanvasElement, controls: HtmlElement) {
    let ctx = canvas.get_context("2d").unwrap().unwrap().dyn_into::<CanvasRenderingContext2d>().unwrap();
    let w = canvas.width() as f64; let h = canvas.height() as f64;
    let state = Rc::new(RefCell::new(State { separation_cm: 2.0, frequency_mhz: 1.0, shielding_db: 0.0, wire_length_m: 1.0 }));
    render(&ctx, &state.borrow(), w, h);
    let doc = web_sys::window().unwrap().document().unwrap();
    setup(&doc, &controls, state, ctx, w, h);
}

fn render(ctx: &CanvasRenderingContext2d, s: &State, w: f64, h: f64) {
    ctx.set_fill_style_str("#0e1118"); ctx.fill_rect(0.0, 0.0, w, h);
    let cx = w / 2.0; let cy = h * 0.4;
    // Draw two parallel wires
    let sep_px = (s.separation_cm * 20.0).min(h * 0.3);
    // Source wire (red)
    ctx.set_stroke_style_str("#ff6040"); ctx.set_line_width(3.0);
    ctx.begin_path(); ctx.move_to(cx - 150.0, cy - sep_px/2.0); ctx.line_to(cx + 150.0, cy - sep_px/2.0); ctx.stroke();
    ctx.set_fill_style_str("#ff6040"); ctx.set_font("11px monospace");
    ctx.fill_text("SOURCE (noisy)", cx - 150.0, cy - sep_px/2.0 - 8.0).ok();
    // Victim wire (blue)
    ctx.set_stroke_style_str("#4090ff"); ctx.set_line_width(3.0);
    ctx.begin_path(); ctx.move_to(cx - 150.0, cy + sep_px/2.0); ctx.line_to(cx + 150.0, cy + sep_px/2.0); ctx.stroke();
    ctx.set_fill_style_str("#4090ff");
    ctx.fill_text("VICTIM (sensitive)", cx - 150.0, cy + sep_px/2.0 + 16.0).ok();
    // Coupling field lines
    let coupling_strength = ((-s.crosstalk_db() / 60.0).min(1.0) * 255.0) as u8;
    ctx.set_stroke_style_str(&format!("rgba(255,200,0,{})", (255 - coupling_strength) as f64 / 255.0));
    ctx.set_line_width(1.0);
    for i in 0..8 {
        let x = cx - 120.0 + i as f64 * 35.0;
        ctx.begin_path(); ctx.move_to(x, cy - sep_px/2.0 + 3.0); ctx.line_to(x, cy + sep_px/2.0 - 3.0); ctx.stroke();
    }
    // Shield (if any)
    if s.shielding_db > 0.0 {
        ctx.set_stroke_style_str("#888"); ctx.set_line_width(1.5);
        ctx.begin_path(); ctx.move_to(cx - 155.0, cy + sep_px/2.0 - 6.0); ctx.line_to(cx + 155.0, cy + sep_px/2.0 - 6.0); ctx.stroke();
        ctx.begin_path(); ctx.move_to(cx - 155.0, cy + sep_px/2.0 + 6.0); ctx.line_to(cx + 155.0, cy + sep_px/2.0 + 6.0); ctx.stroke();
        ctx.set_fill_style_str("#888"); ctx.fill_text(&format!("SHIELD ({:.0}dB)", s.shielding_db), cx + 160.0, cy + sep_px/2.0 + 4.0).ok();
    }
    // Results
    let crosstalk = s.crosstalk_db();
    let pass = s.passes_mil_std();
    ctx.set_font("13px monospace"); ctx.set_fill_style_str("#f0f5ff");
    ctx.fill_text(&format!("Crosstalk: {:.1} dB", crosstalk), 20.0, h - 60.0).ok();
    ctx.fill_text(&format!("Separation: {:.1} cm | Freq: {:.1} MHz | Length: {:.1} m", s.separation_cm, s.frequency_mhz, s.wire_length_m), 20.0, h - 40.0).ok();
    let (label, col) = if pass { ("PASS (< -40dB per MIL-STD-461)", "#50dc64") } else { ("FAIL (exceeds -40dB limit)", "#ff4040") };
    ctx.set_fill_style_str(col); ctx.fill_text(label, 20.0, h - 18.0).ok();
}

fn setup(doc: &Document, controls: &HtmlElement, state: Rc<RefCell<State>>, ctx: CanvasRenderingContext2d, w: f64, h: f64) {
    controls.set_inner_html(r#"<div style="display:flex;gap:10px;align-items:center;color:#c8d2dc;font-family:monospace;font-size:11px;flex-wrap:wrap;">
        <label>Sep(cm): <input type="range" id="emi-sep" min="0.5" max="10" value="2" step="0.5" style="width:70px"><span id="emi-sv">2</span></label>
        <label>Freq(MHz): <input type="range" id="emi-f" min="0.1" max="100" value="1" step="0.1" style="width:70px"><span id="emi-fv">1</span></label>
        <label>Shield(dB): <input type="range" id="emi-sh" min="0" max="80" value="0" step="5" style="width:70px"><span id="emi-shv">0</span></label>
        <label>Length(m): <input type="range" id="emi-l" min="0.1" max="10" value="1" step="0.1" style="width:70px"><span id="emi-lv">1</span></label>
    </div>"#);
    let update = Closure::wrap(Box::new(move || {
        let d = web_sys::window().unwrap().document().unwrap();
        let sep = gv(&d,"emi-sep"); let f = gv(&d,"emi-f"); let sh = gv(&d,"emi-sh"); let l = gv(&d,"emi-l");
        st(&d,"emi-sv",&format!("{:.1}",sep)); st(&d,"emi-fv",&format!("{:.1}",f)); st(&d,"emi-shv",&format!("{:.0}",sh)); st(&d,"emi-lv",&format!("{:.1}",l));
        let mut s = state.borrow_mut(); s.separation_cm=sep; s.frequency_mhz=f; s.shielding_db=sh; s.wire_length_m=l;
        render(&ctx, &s, w, h);
    }) as Box<dyn Fn()>);
    for id in &["emi-sep","emi-f","emi-sh","emi-l"] { if let Some(el) = doc.get_element_by_id(id) { el.add_event_listener_with_callback("input", update.as_ref().unchecked_ref()).ok(); } }
    update.forget();
}
fn gv(d:&Document,id:&str)->f64{d.get_element_by_id(id).and_then(|e|e.dyn_into::<web_sys::HtmlInputElement>().ok()).map(|i|i.value().parse().unwrap_or(0.0)).unwrap_or(0.0)}
fn st(d:&Document,id:&str,t:&str){if let Some(e)=d.get_element_by_id(id){e.set_text_content(Some(t));}}

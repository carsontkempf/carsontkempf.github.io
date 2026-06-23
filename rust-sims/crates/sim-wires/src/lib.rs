use wasm_bindgen::prelude::*;
use web_sys::{CanvasRenderingContext2d, HtmlCanvasElement, Document, HtmlElement};
use std::cell::RefCell;
use std::rc::Rc;

/// AWG data: (gauge, diameter_mm, resistance_ohm_per_m_at_20C, weight_g_per_m)
const AWG_TABLE: &[(u8, f64, f64, f64)] = &[
    (10, 2.588, 0.00328, 48.0),
    (12, 2.053, 0.00521, 30.0),
    (14, 1.628, 0.00828, 19.0),
    (16, 1.291, 0.01317, 12.0),
    (18, 1.024, 0.02093, 7.5),
    (20, 0.812, 0.03328, 4.7),
    (22, 0.644, 0.05291, 3.0),
    (24, 0.511, 0.08412, 1.9),
    (26, 0.405, 0.13368, 1.2),
    (28, 0.321, 0.21242, 0.75),
    (30, 0.255, 0.33768, 0.47),
];

struct WireState {
    current: f64,      // Amps
    length: f64,       // meters (one-way)
    ambient_temp: f64, // Celsius
    bus_voltage: f64,  // Volts
}

impl WireState {
    fn resistance_at_temp(&self, r_20c: f64) -> f64 {
        let alpha = 0.00393; // copper temp coefficient
        r_20c * (1.0 + alpha * (self.ambient_temp - 20.0))
    }

    fn voltage_drop(&self, r_per_m: f64) -> f64 {
        let r = self.resistance_at_temp(r_per_m) * self.length * 2.0; // round trip
        self.current * r
    }

    fn drop_percent(&self, r_per_m: f64) -> f64 {
        self.voltage_drop(r_per_m) / self.bus_voltage * 100.0
    }

    fn temp_rise(&self, r_per_m: f64) -> f64 {
        // Simplified: assume 10 C/W/m thermal resistance for insulated wire in air
        let power_per_m = self.current * self.current * self.resistance_at_temp(r_per_m);
        power_per_m * 10.0
    }

    fn wire_temp(&self, r_per_m: f64) -> f64 {
        self.ambient_temp + self.temp_rise(r_per_m)
    }

    fn passes(&self, r_per_m: f64) -> bool {
        self.drop_percent(r_per_m) <= 3.0 && self.wire_temp(r_per_m) < 150.0
    }
}

#[wasm_bindgen]
pub fn start(canvas: HtmlCanvasElement, controls: HtmlElement) {
    let ctx = canvas.get_context("2d").unwrap().unwrap()
        .dyn_into::<CanvasRenderingContext2d>().unwrap();
    let w = canvas.width() as f64;
    let h = canvas.height() as f64;

    let state = Rc::new(RefCell::new(WireState {
        current: 5.0, length: 10.0, ambient_temp: 25.0, bus_voltage: 28.0,
    }));

    render(&ctx, &state.borrow(), w, h);

    let doc = web_sys::window().unwrap().document().unwrap();
    setup_controls(&doc, &controls, state, ctx, w, h);
}

fn render(ctx: &CanvasRenderingContext2d, state: &WireState, w: f64, h: f64) {
    ctx.set_fill_style_str("#0e1118");
    ctx.fill_rect(0.0, 0.0, w, h);

    // Draw wire visualization (horizontal bar colored by temperature)
    let wire_y = 60.0;
    let wire_h = 30.0;
    let wire_x = 40.0;
    let wire_w = w - 80.0;

    // Recommended gauge (first that passes)
    let recommended = AWG_TABLE.iter().rev().find(|(_, _, r, _)| state.passes(*r));

    // Draw each gauge as a row in the comparison table
    ctx.set_font("11px monospace");
    let table_y = 120.0;
    let row_h = 28.0;

    // Header
    ctx.set_fill_style_str("#00b4dc");
    ctx.fill_text("AWG", 20.0, table_y).ok();
    ctx.fill_text("V_drop", 80.0, table_y).ok();
    ctx.fill_text("Drop%", 160.0, table_y).ok();
    ctx.fill_text("Temp", 240.0, table_y).ok();
    ctx.fill_text("Wt(g/m)", 320.0, table_y).ok();
    ctx.fill_text("Status", 410.0, table_y).ok();

    for (i, &(gauge, diam, r_per_m, weight)) in AWG_TABLE.iter().enumerate() {
        let y = table_y + (i as f64 + 1.5) * row_h;
        let drop = state.voltage_drop(r_per_m);
        let pct = state.drop_percent(r_per_m);
        let temp = state.wire_temp(r_per_m);
        let pass = state.passes(r_per_m);

        let is_recommended = recommended.map(|r| r.0 == gauge).unwrap_or(false);

        // Row background
        if is_recommended {
            ctx.set_fill_style_str("#1a2a1a");
            ctx.fill_rect(10.0, y - 12.0, w - 20.0, row_h - 4.0);
        }

        let text_col = if pass { "#c8d2dc" } else { "#ff4040" };
        ctx.set_fill_style_str(text_col);
        ctx.fill_text(&format!("{}", gauge), 20.0, y).ok();
        ctx.fill_text(&format!("{:.3}V", drop), 80.0, y).ok();
        ctx.fill_text(&format!("{:.1}%", pct), 160.0, y).ok();
        ctx.fill_text(&format!("{:.0}C", temp), 240.0, y).ok();
        ctx.fill_text(&format!("{:.1}", weight), 320.0, y).ok();

        let status = if is_recommended { "BEST" } else if pass { "PASS" } else { "FAIL" };
        let status_col = if is_recommended { "#50dc64" } else if pass { "#88aa88" } else { "#ff4040" };
        ctx.set_fill_style_str(status_col);
        ctx.fill_text(status, 410.0, y).ok();
    }

    // Draw wire visualization at top
    if let Some(&(gauge, diam, r_per_m, _)) = recommended {
        let temp = state.wire_temp(r_per_m);
        let temp_frac = ((temp - 20.0) / 130.0).min(1.0).max(0.0);
        let r = (temp_frac * 255.0) as u8;
        let b = ((1.0 - temp_frac) * 180.0) as u8;
        let col = format!("rgb({},{},{}", r, 80, b);
        ctx.set_fill_style_str(&col);
        let thickness = (diam * 8.0).max(4.0);
        ctx.fill_rect(wire_x, wire_y + (wire_h - thickness) / 2.0, wire_w, thickness);

        // Current flow arrows
        ctx.set_fill_style_str("#50dc64");
        let n_arrows = (state.current * 2.0).min(12.0) as usize;
        for i in 0..n_arrows {
            let ax = wire_x + (i as f64 + 0.5) * wire_w / n_arrows as f64;
            ctx.fill_text(">", ax, wire_y + wire_h / 2.0 + 4.0).ok();
        }

        ctx.set_fill_style_str("#f0f5ff");
        ctx.set_font("13px monospace");
        ctx.fill_text(&format!("Recommended: {}AWG | V_drop={:.3}V ({:.1}%) | T={:.0}C",
            gauge, state.voltage_drop(r_per_m), state.drop_percent(r_per_m), temp), 40.0, 45.0).ok();
    } else {
        ctx.set_fill_style_str("#ff4040");
        ctx.set_font("14px monospace");
        ctx.fill_text("NO WIRE IN TABLE MEETS REQUIREMENTS", 40.0, 45.0).ok();
    }

    // Parameters display
    ctx.set_fill_style_str("#888");
    ctx.set_font("10px monospace");
    let params = format!("Bus={}V | I={}A | L={}m ({}m round-trip) | Ambient={}C | Max drop=3% ({:.2}V)",
        state.bus_voltage, state.current, state.length, state.length*2.0, state.ambient_temp, state.bus_voltage*0.03);
    ctx.fill_text(&params, 20.0, h - 10.0).ok();
}

fn setup_controls(doc: &Document, controls: &HtmlElement, state: Rc<RefCell<WireState>>, ctx: CanvasRenderingContext2d, w: f64, h: f64) {
    controls.set_inner_html(r#"
        <div style="display:flex;gap:16px;align-items:center;color:#c8d2dc;font-family:monospace;font-size:11px;flex-wrap:wrap;">
            <label>Current(A): <input type="range" id="w-current" min="0.5" max="20" value="5" step="0.5" style="width:90px"><span id="w-i-val">5A</span></label>
            <label>Length(m): <input type="range" id="w-length" min="1" max="50" value="10" step="1" style="width:90px"><span id="w-l-val">10m</span></label>
            <label>Ambient(C): <input type="range" id="w-temp" min="20" max="120" value="25" step="5" style="width:90px"><span id="w-t-val">25C</span></label>
            <label>Bus(V): <input type="range" id="w-bus" min="5" max="48" value="28" step="1" style="width:90px"><span id="w-v-val">28V</span></label>
        </div>
    "#);

    let update = Closure::wrap(Box::new(move || {
        let doc = web_sys::window().unwrap().document().unwrap();
        let current = get_val(&doc, "w-current");
        let length = get_val(&doc, "w-length");
        let temp = get_val(&doc, "w-temp");
        let bus = get_val(&doc, "w-bus");
        set_txt(&doc, "w-i-val", &format!("{:.1}A", current));
        set_txt(&doc, "w-l-val", &format!("{:.0}m", length));
        set_txt(&doc, "w-t-val", &format!("{:.0}C", temp));
        set_txt(&doc, "w-v-val", &format!("{:.0}V", bus));
        let mut s = state.borrow_mut();
        s.current = current; s.length = length; s.ambient_temp = temp; s.bus_voltage = bus;
        render(&ctx, &s, w, h);
    }) as Box<dyn Fn()>);

    for id in &["w-current", "w-length", "w-temp", "w-bus"] {
        if let Some(el) = doc.get_element_by_id(id) {
            el.add_event_listener_with_callback("input", update.as_ref().unchecked_ref()).ok();
        }
    }
    update.forget();
}

fn get_val(doc: &Document, id: &str) -> f64 {
    doc.get_element_by_id(id)
        .and_then(|el| el.dyn_into::<web_sys::HtmlInputElement>().ok())
        .map(|i| i.value().parse::<f64>().unwrap_or(0.0)).unwrap_or(0.0)
}

fn set_txt(doc: &Document, id: &str, t: &str) {
    if let Some(el) = doc.get_element_by_id(id) { el.set_text_content(Some(t)); }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_voltage_drop_20awg() {
        let s = WireState { current: 5.0, length: 10.0, ambient_temp: 20.0, bus_voltage: 28.0 };
        // 20AWG: 0.03328 ohm/m at 20C, round trip = 20m
        // V_drop = 5 * 0.03328 * 20 = 3.328V
        let drop = s.voltage_drop(0.03328);
        assert!((drop - 3.328).abs() < 0.01);
    }

    #[test]
    fn test_voltage_drop_percent() {
        let s = WireState { current: 5.0, length: 10.0, ambient_temp: 20.0, bus_voltage: 28.0 };
        let pct = s.drop_percent(0.03328);
        // 3.328/28 * 100 = 11.9%
        assert!((pct - 11.886).abs() < 0.1);
    }

    #[test]
    fn test_temperature_derating() {
        let s = WireState { current: 5.0, length: 10.0, ambient_temp: 85.0, bus_voltage: 28.0 };
        let r_20 = 0.03328;
        let r_85 = s.resistance_at_temp(r_20);
        // R(85) = 0.03328 * (1 + 0.00393 * 65) = 0.03328 * 1.255 = 0.04177
        assert!((r_85 - 0.04177).abs() < 0.001);
    }

    #[test]
    fn test_pass_fail_logic() {
        // 28V, 2A, 5m, 20C -- should pass with 20AWG
        let s = WireState { current: 2.0, length: 5.0, ambient_temp: 20.0, bus_voltage: 28.0 };
        // 20AWG: drop = 2 * 0.03328 * 10 = 0.666V = 2.4% < 3% PASS
        assert!(s.passes(0.03328));
    }

    #[test]
    fn test_fail_high_current_thin_wire() {
        // 28V, 10A, 20m, 85C -- should fail with 24AWG
        let s = WireState { current: 10.0, length: 20.0, ambient_temp: 85.0, bus_voltage: 28.0 };
        // 24AWG: 0.08412 ohm/m, at 85C: ~0.1057, round trip 40m
        // drop = 10 * 0.1057 * 40 = 42.3V -- way over 3%!
        assert!(!s.passes(0.08412));
    }

    #[test]
    fn test_awg_table_ordering() {
        // Verify table is ordered: lower gauge = lower resistance
        for i in 1..AWG_TABLE.len() {
            assert!(AWG_TABLE[i].2 > AWG_TABLE[i-1].2, "AWG table not ordered by resistance");
        }
    }
}

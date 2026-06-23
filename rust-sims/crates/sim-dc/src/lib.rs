use wasm_bindgen::prelude::*;
use web_sys::{CanvasRenderingContext2d, HtmlCanvasElement, Document, HtmlElement};
use sim_core::Circuit;
use std::cell::RefCell;
use std::rc::Rc;

#[wasm_bindgen]
pub fn start(canvas: HtmlCanvasElement, controls: HtmlElement) {
    let ctx = canvas
        .get_context("2d")
        .unwrap()
        .unwrap()
        .dyn_into::<CanvasRenderingContext2d>()
        .unwrap();

    let w = canvas.width() as f64;
    let h = canvas.height() as f64;

    // Build a default voltage divider circuit
    let circuit = Rc::new(RefCell::new(create_default_circuit()));

    // Solve and render initial state
    circuit.borrow_mut().solve();
    render(&ctx, &circuit.borrow(), w, h);

    // Create controls
    let doc = web_sys::window().unwrap().document().unwrap();
    setup_controls(&doc, &controls, circuit.clone(), ctx, w, h);
}

fn create_default_circuit() -> Circuit {
    let mut c = Circuit::new();
    let gnd = c.add_node(50.0, 350.0);    // ground (bottom-left)
    let v_top = c.add_node(50.0, 50.0);   // source positive (top-left)
    let mid = c.add_node(350.0, 50.0);    // midpoint (top-right)
    let bot = c.add_node(350.0, 350.0);   // bottom-right (connects to ground)

    c.add_source(v_top, gnd, 28.0); // 28V aerospace bus
    c.add_resistor(v_top, mid, 1000.0);   // R1 = 1k
    c.add_resistor(mid, bot, 2000.0);     // R2 = 2k
    // Wire from bot back to ground (zero resistance = short)
    c.add_resistor(bot, gnd, 0.001);
    c
}

fn render(ctx: &CanvasRenderingContext2d, circuit: &Circuit, w: f64, h: f64) {
    // Clear
    ctx.set_fill_style_str("#0e1118");
    ctx.fill_rect(0.0, 0.0, w, h);

    // Draw wires (resistors as lines with labels)
    ctx.set_stroke_style_str("#4a90d9");
    ctx.set_line_width(2.0);
    ctx.set_font("12px monospace");
    ctx.set_fill_style_str("#c8d2dc");

    for (i, r) in circuit.resistors.iter().enumerate() {
        let na = &circuit.nodes[r.node_a];
        let nb = &circuit.nodes[r.node_b];

        // Draw wire
        ctx.begin_path();
        ctx.move_to(na.x, na.y);
        ctx.line_to(nb.x, nb.y);
        ctx.stroke();

        // Current through this resistor
        let current = circuit.resistor_current(i);
        let power = circuit.resistor_power(i);

        // Draw resistor symbol (zigzag or box)
        let mx = (na.x + nb.x) / 2.0;
        let my = (na.y + nb.y) / 2.0;
        ctx.set_fill_style_str("#1e2530");
        ctx.fill_rect(mx - 30.0, my - 10.0, 60.0, 20.0);
        ctx.set_stroke_style_str("#00b4dc");
        ctx.stroke_rect(mx - 30.0, my - 10.0, 60.0, 20.0);

        // Label
        ctx.set_fill_style_str("#f0f5ff");
        let label = if r.resistance > 0.01 {
            format!("{}R", format_resistance(r.resistance))
        } else {
            "wire".to_string()
        };
        ctx.fill_text(&label, mx - 20.0, my + 4.0).ok();

        // Current annotation
        ctx.set_fill_style_str("#50dc64");
        let i_label = format!("{:.1}mA", current * 1000.0);
        ctx.fill_text(&i_label, mx - 20.0, my + 20.0).ok();
    }

    // Draw nodes with voltage labels
    for node in &circuit.nodes {
        // Node dot
        ctx.begin_path();
        ctx.arc(node.x, node.y, 5.0, 0.0, std::f64::consts::TAU).ok();
        ctx.set_fill_style_str("#00b4dc");
        ctx.fill();

        // Voltage label
        ctx.set_fill_style_str("#f0f5ff");
        ctx.set_font("13px monospace");
        let v_label = format!("{:.2}V", node.voltage);
        ctx.fill_text(&v_label, node.x + 10.0, node.y - 5.0).ok();
    }

    // Draw source
    if let Some(src) = circuit.sources.first() {
        let np = &circuit.nodes[src.node_pos];
        let nn = &circuit.nodes[src.node_neg];
        ctx.set_stroke_style_str("#ff9040");
        ctx.set_line_width(3.0);
        ctx.begin_path();
        ctx.move_to(nn.x, nn.y);
        ctx.line_to(np.x, np.y);
        ctx.stroke();

        let mx = (np.x + nn.x) / 2.0;
        let my = (np.y + nn.y) / 2.0;
        ctx.set_fill_style_str("#ff9040");
        ctx.set_font("14px monospace");
        ctx.fill_text(&format!("{:.0}V src", src.voltage), mx + 10.0, my).ok();
    }

    // Info panel (top-right)
    ctx.set_fill_style_str("#c8d2dc");
    ctx.set_font("11px monospace");
    let mut y = 20.0;
    ctx.fill_text("DC Circuit Solver", w - 180.0, y).ok(); y += 18.0;
    ctx.fill_text("--------------------", w - 180.0, y).ok(); y += 18.0;
    for (i, r) in circuit.resistors.iter().enumerate() {
        if r.resistance > 0.01 {
            let current = circuit.resistor_current(i);
            let power = circuit.resistor_power(i);
            let va = circuit.nodes[r.node_a].voltage;
            let vb = circuit.nodes[r.node_b].voltage;
            ctx.fill_text(&format!("R{}: {}", i+1, format_resistance(r.resistance)), w - 180.0, y).ok(); y += 15.0;
            ctx.fill_text(&format!("  I={:.2}mA P={:.1}mW", current*1000.0, power*1000.0), w - 180.0, y).ok(); y += 15.0;
            ctx.fill_text(&format!("  Vdrop={:.2}V", (va-vb).abs()), w - 180.0, y).ok(); y += 18.0;
        }
    }
}

fn format_resistance(r: f64) -> String {
    if r >= 1_000_000.0 { format!("{:.1}M", r / 1_000_000.0) }
    else if r >= 1000.0 { format!("{:.1}k", r / 1000.0) }
    else { format!("{:.0}", r) }
}

fn setup_controls(
    doc: &Document,
    controls: &HtmlElement,
    circuit: Rc<RefCell<Circuit>>,
    ctx: CanvasRenderingContext2d,
    w: f64,
    h: f64,
) {
    controls.set_inner_html(r#"
        <div style="display:flex;gap:16px;align-items:center;color:#c8d2dc;font-family:monospace;font-size:12px;">
            <label>V_source: <input type="range" id="v-src" min="1" max="48" value="28" style="width:100px"><span id="v-val">28V</span></label>
            <label>R1: <input type="range" id="r1" min="100" max="10000" value="1000" step="100" style="width:100px"><span id="r1-val">1.0k</span></label>
            <label>R2: <input type="range" id="r2" min="100" max="10000" value="2000" step="100" style="width:100px"><span id="r2-val">2.0k</span></label>
        </div>
    "#);

    // Set up event listeners using closures
    let circuit_c = circuit.clone();
    let ctx_c = ctx.clone();
    let update = Closure::wrap(Box::new(move || {
        let doc = web_sys::window().unwrap().document().unwrap();
        let v_src: f64 = get_slider_val(&doc, "v-src");
        let r1: f64 = get_slider_val(&doc, "r1");
        let r2: f64 = get_slider_val(&doc, "r2");

        set_text(&doc, "v-val", &format!("{:.0}V", v_src));
        set_text(&doc, "r1-val", &format_resistance(r1));
        set_text(&doc, "r2-val", &format_resistance(r2));

        let mut c = circuit_c.borrow_mut();
        c.sources[0].voltage = v_src;
        c.resistors[0].resistance = r1;
        c.resistors[1].resistance = r2;
        c.solve();
        render(&ctx_c, &c, w, h);
    }) as Box<dyn Fn()>);

    // Attach to all sliders
    for id in &["v-src", "r1", "r2"] {
        if let Some(el) = doc.get_element_by_id(id) {
            el.add_event_listener_with_callback("input", update.as_ref().unchecked_ref()).ok();
        }
    }
    update.forget(); // leak closure (lives for page lifetime)
}

fn get_slider_val(doc: &Document, id: &str) -> f64 {
    doc.get_element_by_id(id)
        .and_then(|el| el.dyn_into::<web_sys::HtmlInputElement>().ok())
        .map(|input| input.value().parse::<f64>().unwrap_or(0.0))
        .unwrap_or(0.0)
}

fn set_text(doc: &Document, id: &str, text: &str) {
    if let Some(el) = doc.get_element_by_id(id) {
        el.set_text_content(Some(text));
    }
}

use wasm_bindgen::prelude::*;
use web_sys::{CanvasRenderingContext2d, HtmlCanvasElement, HtmlElement, Document};
use std::cell::RefCell; use std::rc::Rc;

struct Individual { routes: Vec<usize>, fitness: f64 }
struct State { pop: Vec<Individual>, gen: usize, best_fitness: Vec<f64>, nodes: Vec<(f64,f64)>, wires: Vec<(usize,usize)>, running: bool }

impl State {
    fn new() -> Self {
        // 8 nodes (subsystems), 12 wires between them
        let nodes = vec![(0.2,0.2),(0.8,0.2),(0.5,0.5),(0.2,0.8),(0.8,0.8),(0.5,0.15),(0.15,0.5),(0.85,0.5)];
        let wires = vec![(0,1),(0,2),(1,2),(2,3),(2,4),(3,4),(0,6),(1,7),(5,0),(5,1),(6,3),(7,4)];
        let pop = (0..50).map(|i| {
            let routes: Vec<usize> = wires.iter().map(|_| (i * 7 + 13) % 3).collect();
            Individual { routes, fitness: 0.0 }
        }).collect();
        let mut s = Self { pop, gen: 0, best_fitness: Vec::new(), nodes, wires, running: false };
        s.evaluate_all(); s
    }

    fn evaluate(&self, ind: &Individual) -> f64 {
        let mut total_length = 0.0;
        let mut conflicts = 0.0;
        for (i, &(a, b)) in self.wires.iter().enumerate() {
            let na = self.nodes[a]; let nb = self.nodes[b];
            let dx = na.0 - nb.0; let dy = na.1 - nb.1;
            let dist = (dx*dx + dy*dy).sqrt();
            total_length += dist;
            // Penalty for wires in same bundle that shouldn't be
            for j in (i+1)..self.wires.len() {
                if ind.routes[i] == ind.routes[j] {
                    let (wa, wb) = self.wires[j];
                    // If both are power wires near signal wires: conflict
                    if (a < 2 || b < 2) && (wa > 4 || wb > 4) { conflicts += 0.5; }
                }
            }
        }
        total_length + conflicts * 2.0
    }

    fn evaluate_all(&mut self) {
        let fitnesses: Vec<f64> = self.pop.iter().map(|ind| self.evaluate(ind)).collect();
        for (ind, f) in self.pop.iter_mut().zip(fitnesses.into_iter()) { ind.fitness = f; }
        self.pop.sort_by(|a,b| a.fitness.partial_cmp(&b.fitness).unwrap());
        self.best_fitness.push(self.pop[0].fitness);
    }

    fn step_generation(&mut self) {
        let mut new_pop: Vec<Individual> = Vec::new();
        // Elitism: keep top 5
        for i in 0..5 { new_pop.push(Individual { routes: self.pop[i].routes.clone(), fitness: 0.0 }); }
        // Breed rest
        while new_pop.len() < 50 {
            let p1 = &self.pop[self.gen % 10];
            let p2 = &self.pop[(self.gen * 3 + new_pop.len()) % 15];
            let mut child: Vec<usize> = p1.routes.iter().zip(p2.routes.iter()).enumerate()
                .map(|(i, (&a, &b))| if (self.gen + i) % 2 == 0 { a } else { b }).collect();
            // Mutation
            if (self.gen + new_pop.len()) % 4 == 0 {
                let idx = (self.gen * 7 + new_pop.len() * 3) % child.len();
                child[idx] = (child[idx] + 1) % 3;
            }
            new_pop.push(Individual { routes: child, fitness: 0.0 });
        }
        self.pop = new_pop;
        self.gen += 1;
        self.evaluate_all();
    }
}

#[wasm_bindgen]
pub fn start(canvas: HtmlCanvasElement, controls: HtmlElement) {
    let ctx = canvas.get_context("2d").unwrap().unwrap().dyn_into::<CanvasRenderingContext2d>().unwrap();
    let w = canvas.width() as f64; let h = canvas.height() as f64;
    let state = Rc::new(RefCell::new(State::new()));
    render(&ctx, &state.borrow(), w, h);
    let doc = web_sys::window().unwrap().document().unwrap();
    controls.set_inner_html(r#"<div style="display:flex;gap:12px;align-items:center;color:#c8d2dc;font-family:monospace;font-size:11px;">
        <button id="ev-step">Step 10 Generations</button><button id="ev-reset">Reset</button><span id="ev-info">Gen 0</span>
    </div>"#);
    let s1 = state.clone(); let ctx1 = ctx.clone();
    let step_cb = Closure::wrap(Box::new(move || {
        let mut s = s1.borrow_mut();
        for _ in 0..10 { s.step_generation(); }
        render(&ctx1, &s, w, h);
        let d = web_sys::window().unwrap().document().unwrap();
        st(&d, "ev-info", &format!("Gen {} | Best: {:.3}", s.gen, s.best_fitness.last().unwrap_or(&0.0)));
    }) as Box<dyn Fn()>);
    if let Some(el) = doc.get_element_by_id("ev-step") { el.add_event_listener_with_callback("click", step_cb.as_ref().unchecked_ref()).ok(); }
    step_cb.forget();
    let s2 = state.clone(); let ctx2 = ctx.clone();
    let reset_cb = Closure::wrap(Box::new(move || {
        *s2.borrow_mut() = State::new();
        render(&ctx2, &s2.borrow(), w, h);
        let d = web_sys::window().unwrap().document().unwrap();
        st(&d, "ev-info", "Gen 0");
    }) as Box<dyn Fn()>);
    if let Some(el) = doc.get_element_by_id("ev-reset") { el.add_event_listener_with_callback("click", reset_cb.as_ref().unchecked_ref()).ok(); }
    reset_cb.forget();
}

fn render(ctx: &CanvasRenderingContext2d, s: &State, w: f64, h: f64) {
    ctx.set_fill_style_str("#0e1118"); ctx.fill_rect(0.0, 0.0, w, h);
    let half_w = w / 2.0;
    // Left: network visualization
    let best = &s.pop[0];
    let colors = ["#ff6040", "#50dc64", "#4090ff"];
    // Draw wires colored by bundle assignment
    for (i, &(a, b)) in s.wires.iter().enumerate() {
        let na = s.nodes[a]; let nb = s.nodes[b];
        ctx.set_stroke_style_str(colors[best.routes[i] % 3]); ctx.set_line_width(2.0);
        ctx.begin_path(); ctx.move_to(na.0 * half_w * 0.8 + 30.0, na.1 * h * 0.7 + 30.0);
        ctx.line_to(nb.0 * half_w * 0.8 + 30.0, nb.1 * h * 0.7 + 30.0); ctx.stroke();
    }
    // Draw nodes
    for (i, &(x, y)) in s.nodes.iter().enumerate() {
        ctx.set_fill_style_str("#ffffff");
        ctx.begin_path(); ctx.arc(x * half_w * 0.8 + 30.0, y * h * 0.7 + 30.0, 6.0, 0.0, std::f64::consts::TAU).ok(); ctx.fill();
        ctx.set_fill_style_str("#aaa"); ctx.set_font("9px monospace");
        ctx.fill_text(&format!("S{}", i), x * half_w * 0.8 + 20.0, y * h * 0.7 + 20.0).ok();
    }
    ctx.set_fill_style_str("#c8d2dc"); ctx.set_font("10px monospace");
    ctx.fill_text("Wire colors = bundle assignment", 10.0, h - 10.0).ok();
    // Right: fitness over generations
    if !s.best_fitness.is_empty() {
        let n = s.best_fitness.len();
        let f_max = s.best_fitness[0] * 1.1;
        let f_min = s.best_fitness.last().unwrap() * 0.9;
        ctx.set_stroke_style_str("#ffaa00"); ctx.set_line_width(2.0); ctx.begin_path();
        for (i, &f) in s.best_fitness.iter().enumerate() {
            let px = half_w + 20.0 + (i as f64 / n.max(1) as f64) * (half_w - 40.0);
            let py = 30.0 + (h - 80.0) * ((f - f_min) / (f_max - f_min).max(0.01));
            if i == 0 { ctx.move_to(px, py); } else { ctx.line_to(px, py); }
        }
        ctx.stroke();
        ctx.set_fill_style_str("#ffaa00"); ctx.set_font("11px monospace");
        ctx.fill_text("Fitness (lower = better)", half_w + 20.0, 20.0).ok();
        ctx.fill_text(&format!("Gen: {} | Best: {:.3}", s.gen, s.best_fitness.last().unwrap_or(&0.0)), half_w + 20.0, h - 10.0).ok();
    }
}

fn st(d:&Document,id:&str,t:&str){if let Some(e)=d.get_element_by_id(id){e.set_text_content(Some(t));}}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_initial_population_size() {
        let s = State::new();
        assert_eq!(s.pop.len(), 50);
    }

    #[test]
    fn test_initial_fitness_computed() {
        let s = State::new();
        assert!(s.pop[0].fitness > 0.0);
        assert!(s.best_fitness.len() == 1);
    }

    #[test]
    fn test_population_sorted() {
        let s = State::new();
        for i in 1..s.pop.len() {
            assert!(s.pop[i].fitness >= s.pop[i-1].fitness);
        }
    }

    #[test]
    fn test_generation_step_improves_or_maintains() {
        let mut s = State::new();
        let initial_best = s.best_fitness[0];
        for _ in 0..50 { s.step_generation(); }
        let final_best = *s.best_fitness.last().unwrap();
        // GA should not get WORSE (elitism preserves best)
        assert!(final_best <= initial_best + 0.001);
    }

    #[test]
    fn test_routes_valid_range() {
        let s = State::new();
        for ind in &s.pop {
            for &route in &ind.routes {
                assert!(route < 3, "Route assignment out of range");
            }
        }
    }

    #[test]
    fn test_generation_counter() {
        let mut s = State::new();
        assert_eq!(s.gen, 0);
        s.step_generation();
        assert_eq!(s.gen, 1);
        s.step_generation();
        assert_eq!(s.gen, 2);
    }
}

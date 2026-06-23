/// A node in the circuit (junction point)
#[derive(Clone, Debug)]
pub struct Node {
    pub id: usize,
    pub voltage: f64,
    pub x: f64,
    pub y: f64,
}

/// A resistor connecting two nodes
#[derive(Clone, Debug)]
pub struct Resistor {
    pub node_a: usize,
    pub node_b: usize,
    pub resistance: f64,
}

/// A voltage source connecting two nodes
#[derive(Clone, Debug)]
pub struct VoltageSource {
    pub node_pos: usize,
    pub node_neg: usize,
    pub voltage: f64,
}

/// A simple DC circuit
#[derive(Clone, Debug)]
pub struct Circuit {
    pub nodes: Vec<Node>,
    pub resistors: Vec<Resistor>,
    pub sources: Vec<VoltageSource>,
}

impl Circuit {
    pub fn new() -> Self {
        Self { nodes: Vec::new(), resistors: Vec::new(), sources: Vec::new() }
    }

    pub fn add_node(&mut self, x: f64, y: f64) -> usize {
        let id = self.nodes.len();
        self.nodes.push(Node { id, voltage: 0.0, x, y });
        id
    }

    pub fn add_resistor(&mut self, a: usize, b: usize, r: f64) {
        self.resistors.push(Resistor { node_a: a, node_b: b, resistance: r });
    }

    pub fn add_source(&mut self, pos: usize, neg: usize, v: f64) {
        self.sources.push(VoltageSource { node_pos: pos, node_neg: neg, voltage: v });
    }

    /// Solve using nodal analysis (Modified Nodal Analysis simplified for DC)
    /// Sets node voltages. Ground node = node 0 (voltage fixed at 0).
    pub fn solve(&mut self) {
        let n = self.nodes.len();
        if n < 2 { return; }

        // Build conductance matrix G and current vector I
        // Using MNA: ground is node 0
        let size = n - 1; // exclude ground node
        let mut g = vec![vec![0.0; size]; size];
        let mut i_vec = vec![0.0; size];

        // Conductances from resistors
        for r in &self.resistors {
            let conductance = 1.0 / r.resistance;
            let a = r.node_a;
            let b = r.node_b;
            // Stamp into matrix (skip ground node = 0)
            if a > 0 && a <= size { g[a-1][a-1] += conductance; }
            if b > 0 && b <= size { g[b-1][b-1] += conductance; }
            if a > 0 && b > 0 && a <= size && b <= size {
                g[a-1][b-1] -= conductance;
                g[b-1][a-1] -= conductance;
            }
        }

        // Voltage sources: treat as ideal (supernode / direct assignment)
        // Simplified: if source connects to ground, just set that node's voltage
        for src in &self.sources {
            if src.node_neg == 0 && src.node_pos > 0 && src.node_pos <= size {
                // Force node_pos voltage = src.voltage using large conductance method
                let idx = src.node_pos - 1;
                let big_g = 1e10;
                g[idx][idx] += big_g;
                i_vec[idx] += big_g * src.voltage;
            } else if src.node_pos == 0 && src.node_neg > 0 && src.node_neg <= size {
                let idx = src.node_neg - 1;
                let big_g = 1e10;
                g[idx][idx] += big_g;
                i_vec[idx] += big_g * (-src.voltage);
            }
        }

        // Solve Gv = i using Gaussian elimination
        let voltages = gauss_solve(&g, &i_vec);

        // Assign voltages
        self.nodes[0].voltage = 0.0; // ground
        for i in 0..size {
            if i + 1 < self.nodes.len() {
                self.nodes[i + 1].voltage = voltages.get(i).copied().unwrap_or(0.0);
            }
        }
    }

    /// Get current through a resistor (from node_a to node_b)
    pub fn resistor_current(&self, idx: usize) -> f64 {
        let r = &self.resistors[idx];
        let va = self.nodes[r.node_a].voltage;
        let vb = self.nodes[r.node_b].voltage;
        (va - vb) / r.resistance
    }

    /// Get power dissipated by a resistor
    pub fn resistor_power(&self, idx: usize) -> f64 {
        let i = self.resistor_current(idx);
        let r = &self.resistors[idx];
        i * i * r.resistance
    }
}

fn gauss_solve(a: &[Vec<f64>], b: &[f64]) -> Vec<f64> {
    let n = b.len();
    let mut aug: Vec<Vec<f64>> = a.iter().enumerate().map(|(i, row)| {
        let mut r = row.clone();
        r.push(b[i]);
        r
    }).collect();

    // Forward elimination
    for col in 0..n {
        // Partial pivoting
        let mut max_row = col;
        for row in (col + 1)..n {
            if aug[row][col].abs() > aug[max_row][col].abs() { max_row = row; }
        }
        aug.swap(col, max_row);

        let pivot = aug[col][col];
        if pivot.abs() < 1e-15 { continue; }

        for row in (col + 1)..n {
            let factor = aug[row][col] / pivot;
            for j in col..=n {
                aug[row][j] -= factor * aug[col][j];
            }
        }
    }

    // Back substitution
    let mut x = vec![0.0; n];
    for i in (0..n).rev() {
        let mut sum = aug[i][n];
        for j in (i + 1)..n {
            sum -= aug[i][j] * x[j];
        }
        if aug[i][i].abs() > 1e-15 {
            x[i] = sum / aug[i][i];
        }
    }
    x
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_simple_series() {
        // 10V source, 2 resistors in series: 100ohm + 200ohm
        // Expected: I = 10/300 = 0.0333A, V_mid = 10 - 0.0333*100 = 6.667V
        let mut c = Circuit::new();
        let gnd = c.add_node(0.0, 0.0);   // node 0 = ground
        let n1 = c.add_node(1.0, 0.0);    // node 1 = source positive
        let n2 = c.add_node(2.0, 0.0);    // node 2 = midpoint
        c.add_source(n1, gnd, 10.0);
        c.add_resistor(n1, n2, 100.0);
        c.add_resistor(n2, gnd, 200.0);
        c.solve();
        assert!((c.nodes[1].voltage - 10.0).abs() < 0.01);
        assert!((c.nodes[2].voltage - 6.667).abs() < 0.01);
    }

    #[test]
    fn test_parallel() {
        // 10V source, 2 resistors in parallel: 100ohm each
        // Equivalent: 50ohm, I_total = 0.2A, I_each = 0.1A
        let mut c = Circuit::new();
        let gnd = c.add_node(0.0, 0.0);
        let n1 = c.add_node(1.0, 0.0);
        c.add_source(n1, gnd, 10.0);
        c.add_resistor(n1, gnd, 100.0);
        c.add_resistor(n1, gnd, 100.0);
        c.solve();
        let i0 = c.resistor_current(0);
        let i1 = c.resistor_current(1);
        assert!((i0 - 0.1).abs() < 0.001);
        assert!((i1 - 0.1).abs() < 0.001);
    }

    #[test]
    fn test_voltage_divider() {
        // Classic voltage divider: Vout = Vin * R2/(R1+R2)
        // 12V, R1=1k, R2=2k -> Vout = 12 * 2000/3000 = 8V
        let mut c = Circuit::new();
        let gnd = c.add_node(0.0, 0.0);
        let vin = c.add_node(1.0, 0.0);
        let vout = c.add_node(2.0, 0.0);
        c.add_source(vin, gnd, 12.0);
        c.add_resistor(vin, vout, 1000.0);
        c.add_resistor(vout, gnd, 2000.0);
        c.solve();
        assert!((c.nodes[2].voltage - 8.0).abs() < 0.01);
    }
}

    #[test]
    fn test_three_resistors_series() {
        let mut c = Circuit::new();
        let gnd = c.add_node(0.0, 0.0);
        let n1 = c.add_node(1.0, 0.0);
        let n2 = c.add_node(2.0, 0.0);
        let n3 = c.add_node(3.0, 0.0);
        c.add_source(n1, gnd, 9.0);
        c.add_resistor(n1, n2, 100.0);
        c.add_resistor(n2, n3, 200.0);
        c.add_resistor(n3, gnd, 300.0);
        c.solve();
        // Total R = 600, I = 9/600 = 0.015A
        // V_n2 = 9 - 0.015*100 = 7.5
        // V_n3 = 7.5 - 0.015*200 = 4.5
        assert!((c.nodes[2].voltage - 7.5).abs() < 0.01);
        assert!((c.nodes[3].voltage - 4.5).abs() < 0.01);
        assert!((c.resistor_current(0) - 0.015).abs() < 0.001);
    }

    #[test]
    fn test_power_dissipation() {
        let mut c = Circuit::new();
        let gnd = c.add_node(0.0, 0.0);
        let n1 = c.add_node(1.0, 0.0);
        c.add_source(n1, gnd, 10.0);
        c.add_resistor(n1, gnd, 100.0);
        c.solve();
        // P = V^2/R = 100/100 = 1W
        assert!((c.resistor_power(0) - 1.0).abs() < 0.01);
    }

    #[test]
    fn test_wheatstone_bridge() {
        // Classic Wheatstone bridge: balanced when R1/R2 = R3/R4
        let mut c = Circuit::new();
        let gnd = c.add_node(0.0, 0.0);  // 0
        let vtop = c.add_node(0.0, 1.0); // 1 (source +)
        let left = c.add_node(-1.0, 0.5); // 2
        let right = c.add_node(1.0, 0.5); // 3
        c.add_source(vtop, gnd, 10.0);
        c.add_resistor(vtop, left, 100.0);  // R1
        c.add_resistor(left, gnd, 200.0);   // R2
        c.add_resistor(vtop, right, 100.0); // R3
        c.add_resistor(right, gnd, 200.0);  // R4
        c.solve();
        // Balanced: V_left = V_right = 10 * 200/300 = 6.667V
        assert!((c.nodes[2].voltage - c.nodes[3].voltage).abs() < 0.01);
        assert!((c.nodes[2].voltage - 6.667).abs() < 0.01);
    }

    #[test]
    fn test_current_divider() {
        // Two parallel resistors: I splits inversely proportional to R
        let mut c = Circuit::new();
        let gnd = c.add_node(0.0, 0.0);
        let n1 = c.add_node(1.0, 0.0);
        c.add_source(n1, gnd, 12.0);
        c.add_resistor(n1, gnd, 100.0);  // R1: should get I = 12/100 = 0.12A
        c.add_resistor(n1, gnd, 300.0);  // R2: should get I = 12/300 = 0.04A
        c.solve();
        assert!((c.resistor_current(0) - 0.12).abs() < 0.001);
        assert!((c.resistor_current(1) - 0.04).abs() < 0.001);
    }

    #[test]
    fn test_aerospace_28v_bus() {
        // Real scenario: 28V bus, 5A load through 10m of 20AWG (0.033 ohm/m)
        // Round trip = 20m, R_wire = 0.66 ohm, R_load = 28/5 = 5.6 ohm
        let mut c = Circuit::new();
        let gnd = c.add_node(0.0, 0.0);
        let bus = c.add_node(1.0, 0.0);
        let load_node = c.add_node(2.0, 0.0);
        c.add_source(bus, gnd, 28.0);
        c.add_resistor(bus, load_node, 0.66);    // wire resistance (round trip)
        c.add_resistor(load_node, gnd, 5.6);     // load
        c.solve();
        let v_drop = 28.0 - c.nodes[2].voltage;
        let drop_pct = v_drop / 28.0 * 100.0;
        // V_load = 28 * 5.6 / (5.6 + 0.66) = 25.05V, drop = 2.95V = 10.5%
        assert!((c.nodes[2].voltage - 25.05).abs() < 0.1);
        assert!(drop_pct > 3.0); // This would FAIL AS50881 (>3%)!
    }

    #[test]
    fn test_large_circuit() {
        // 10 resistors in series: total R = 1000, I = 10/1000 = 0.01A
        let mut c = Circuit::new();
        let gnd = c.add_node(0.0, 0.0);
        let mut prev = c.add_node(1.0, 0.0);
        c.add_source(prev, gnd, 10.0);
        for i in 0..10 {
            let next = c.add_node((i + 2) as f64, 0.0);
            c.add_resistor(prev, next, 100.0);
            prev = next;
        }
        c.add_resistor(prev, gnd, 0.001); // close the loop
        c.solve();
        // Current through first resistor ~ 10/1000 = 0.01A
        assert!((c.resistor_current(0) - 0.01).abs() < 0.001);
    }

---
title: Frontends and Backends
date: 2025-03-07
tags:
  - architecture
  - simulation
  - backends
---

RHDL has one frontend (the Ruby DSL) and multiple backends for simulation, synthesis, and export. This page provides an overview of each backend and when to use it.

## Frontend: Ruby DSL

All hardware descriptions enter through the Ruby DSL. The DSL modules (Behavior, Sequential, Structure, Memory, StateMachine, Vec, Bundle) produce an in-memory RTL model that feeds all backends.

## Simulation Backends

RHDL provides four simulation backends at two abstraction levels:

| Backend | Level | Language | Relative Speed | Use Case |
|---------|-------|----------|---------------|----------|
| Ruby behavioral | RTL | Ruby | 1x (baseline) | Rapid prototyping, debugging |
| Ruby gate-level | Gate | Ruby | ~2x | Verification against netlist |
| SIMD gate-level | Gate | Ruby | ~5–10x | Batch testing (64 vectors) |
| Rust native | RTL/Gate | Rust | ~50–100x | Performance-critical simulation |
| WASM | RTL | Rust→WASM | ~10–20x | Browser-based demos |

### Ruby Behavioral

The default backend. Components propagate signals through Ruby method calls:

```ruby
component = MyDesign.new('test')
component.set_input(:a, 42)
component.propagate
result = component.get_output(:y)
```

Best for: development, debugging, interactive exploration with IRB.

### Ruby Gate-Level

Evaluates the gate-level netlist using a CPU interpreter:

```ruby
sim = RHDL::Codegen.gate_level([component], backend: :interpreter)
sim.poke('a', 42)
sim.evaluate
result = sim.peek('y')
```

Best for: verifying behavioral model matches gate-level implementation.

### SIMD Gate-Level

Evaluates 64 test vectors simultaneously using bit-parallel operations:

```ruby
sim = RHDL::Codegen.gate_level([component], backend: :gpu, lanes: 64)
sim.poke('a', 0xFFFFFFFFFFFFFFFF)  # All 1s across 64 lanes
sim.evaluate
result = sim.peek('y')
```

Each net is a 64-bit integer where bit `i` = value in lane `i`. Gate operations (AND, OR, XOR, NOT) operate on full 64-bit words in a single instruction.

Best for: exhaustive testing of small components, batch verification.

### Rust Native

Compiled simulation for maximum performance:

```ruby
sim = RHDL::Codegen.gate_level([component], backend: :native_interpreter)
# or JIT-compiled
sim = RHDL::Codegen.gate_level([component], backend: :jit)
```

Best for: long-running simulations, CPU emulation, performance benchmarks.

### WASM (Browser)

The Rust backend can target WebAssembly for browser-based simulation. See [Browser Simulation](../simulation/browser-simulation) for details.

## Export Backends

| Backend | Output | Command |
|---------|--------|---------|
| Verilog | `.v` files | `rhdl export --all` |
| Gate JSON | `.json` netlists | `rhdl gates --export` |
| FIRRTL | FIRRTL text | `MyComponent.to_firrtl` |
| Diagrams | SVG/PNG/DOT | `rhdl diagram --all` |

### Verilog Export

Generates synthesizable Verilog from the RTL model. Supports full component hierarchies.

```bash
rhdl export --all --scope lib
```

See [Verilog Export](../synthesis/verilog-export) for details.

### Gate-Level JSON

Exports the gate-level netlist as machine-readable JSON for external tools:

```bash
rhdl gates --export
rhdl gates --stats
```

See [Gate Synthesis](../synthesis/gate-synthesis) for details.

### Circuit Diagrams

Generates visual diagrams at three levels of detail:

| Mode | Description |
|------|-------------|
| `component` | Block diagram with inputs/outputs |
| `hierarchical` | Internal sub-components and connections |
| `gate` | Primitive gate-level netlist |

```bash
rhdl diagram --all --mode component   # Simple block diagrams
rhdl diagram --all --mode gate        # Gate-level schematics
rhdl diagram RHDL::HDL::ALU --level hierarchy --depth all
```

## Backend Selection Guide

| Scenario | Recommended Backend |
|----------|-------------------|
| Writing and debugging a new component | Ruby behavioral |
| Running RSpec test suite | Ruby behavioral |
| Verifying gate-level correctness | Ruby gate-level interpreter |
| Exhaustive testing (all input combinations) | SIMD gate-level (64 lanes) |
| Long simulation (>1M cycles) | Rust native |
| Interactive web demo | WASM |
| FPGA/ASIC implementation | Verilog export |
| Estimating chip area | Gate-level stats |
| Documentation | Diagram export |

## Next Steps

- [RTL Simulation](../simulation/rtl-simulation) — behavioral simulation details
- [Gate-Level Simulation](../simulation/gate-level-simulation) — gate-level backends
- [Performance Tuning](../simulation/performance-tuning) — benchmarks and optimization

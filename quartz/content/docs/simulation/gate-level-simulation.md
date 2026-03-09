---
title: Gate-Level Simulation
date: 2025-03-12
tags:
  - simulation
  - gate-level
  - verification
---

RHDL can simulate designs at the gate level — evaluating AND, OR, NOT, MUX, and DFF primitives directly. This enables structural verification against behavioral models and provides hardware-accurate simulation.

## Gate-Level Backends

| Backend | Description | Speed |
|---------|-------------|-------|
| CPU Interpreter | Evaluates gates in topological order | ~2x behavioral |
| SIMD (64-lane) | Evaluates 64 test vectors in parallel | ~5–10x behavioral |
| Rust Native | Compiled native code | ~50–100x behavioral |

## CPU Interpreter

The interpreter evaluates each gate in topologically sorted order:

```ruby
# Lower component to gate-level IR
component = RHDL::HDL::ALU.new('alu', width: 8)
sim = RHDL::Codegen.gate_level([component], backend: :interpreter)

# Set inputs
sim.poke('a', 0x42)
sim.poke('b', 0x13)
sim.poke('op', 0)  # ADD

# Evaluate
sim.evaluate

# Read outputs
result = sim.peek('result')
```

### Evaluation Algorithm

1. Topologically sort gates by dependencies
2. For each gate in sorted order:
   - Read input net values
   - Compute gate output
   - Write to output net
3. For DFFs on clock edge:
   - Sample D inputs
   - Update Q outputs

## SIMD Gate-Level Simulator

The SIMD simulator evaluates 64 test vectors simultaneously using bit-parallel operations:

```ruby
sim = RHDL::Codegen.gate_level([component], backend: :gpu, lanes: 64)

# Set inputs — each bit position represents one test vector
sim.poke('a', 0xFFFFFFFFFFFFFFFF)  # All 1s in all 64 lanes
sim.poke('b', 0x0000000000000001)  # Only lane 0 has b=1

# Evaluate all 64 lanes in one pass
sim.evaluate

# Read results (bitmask across all lanes)
result = sim.peek('result')
```

### How SIMD Works

Each net is represented as a 64-bit integer where bit `i` = the value of that net in lane `i`:

- **AND**: `output = input_a & input_b` (single CPU instruction)
- **OR**: `output = input_a | input_b`
- **XOR**: `output = input_a ^ input_b`
- **NOT**: `output = ~input_a`
- **MUX**: `output = (~sel & false_val) | (sel & true_val)`

This means 64 independent simulations run in the time of one, making it ideal for exhaustive testing of small components.

## Rust Native Backend

For maximum performance, compile to native code:

```ruby
# Native interpreter (Rust implementation of the gate evaluator)
sim = RHDL::Codegen.gate_level([component], backend: :native_interpreter)

# JIT-compiled simulation
sim = RHDL::Codegen.gate_level([component], backend: :jit)
```

Build the native extensions:

```bash
rake native:build
```

## Verification Flow

Use gate-level simulation to verify behavioral models:

```ruby
# Behavioral simulation
component = RHDL::HDL::ALU.new('alu', width: 8)
component.set_input(:a, 10)
component.set_input(:b, 5)
component.set_input(:op, 0)
component.propagate
expected = component.get_output(:result)

# Gate-level simulation
sim = RHDL::Codegen.gate_level([component], backend: :interpreter)
sim.poke('a', 10)
sim.poke('b', 5)
sim.poke('op', 0)
sim.evaluate
actual = sim.peek('result')

# Verify
raise "Mismatch!" unless expected == actual
```

### Exhaustive Verification with SIMD

Test all 256 input combinations of an 8-bit operation in just 4 evaluations:

```ruby
sim = RHDL::Codegen.gate_level([component], backend: :gpu, lanes: 64)

# Pack 64 test vectors per evaluation
(0..255).each_slice(64) do |batch|
  packed_a = batch.each_with_index.sum { |v, i| v << i }
  sim.poke('a', packed_a)
  sim.evaluate
  # Unpack and verify each lane...
end
```

## Icarus Verilog Integration

When Icarus Verilog is installed, gate-level equivalence tests can run generated Verilog:

```ruby
if HdlToolchain.iverilog_available?
  it "matches behavioral simulation" do
    # Generate Verilog, create testbench
    # Compile with iverilog, run and compare
  end
end
```

Install Icarus Verilog:

```bash
apt-get install iverilog    # Ubuntu/Debian
brew install icarus-verilog  # macOS
```

## Limitations

- **Memories**: RAM/ROM not yet supported at gate level (use behavioral)
- **Clock domains**: Only single clock domain
- **Tristate**: Tristate buffers lower to simple gates (not true high-Z)
- **Timing**: No propagation delay modeling (functional only)

## Next Steps

- [RTL Simulation](../simulation/rtl-simulation) — behavioral simulation and debugging
- [Browser Simulation](../simulation/browser-simulation) — WASM-based web simulator
- [Performance Tuning](../simulation/performance-tuning) — backend benchmarks

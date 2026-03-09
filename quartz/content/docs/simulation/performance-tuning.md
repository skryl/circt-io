---
title: Performance Tuning
date: 2025-03-16
tags:
  - simulation
  - performance
  - benchmarks
---

RHDL offers six simulation backends spanning three orders of magnitude in performance. This guide covers benchmarks, backend selection, and profiling.

## Backend Performance Summary

| Backend | Speed | Startup | Best For |
|---------|-------|---------|----------|
| Ruby Behavioral | Baseline | Instant | Development, debugging |
| IR Interpreter | ~60K cycles/s | Fast | Quick gate-level verification |
| IR JIT | ~200–600K cycles/s | Moderate | Medium-length simulations |
| IR Compiler (AOT) | ~1–2M cycles/s | 5–8s | Long batch simulations |
| Verilator | ~5–6M cycles/s | Compile time | Maximum throughput |
| CIRCT/MLIR (Arcilator) | Native RTL parity | Compile time | RTL benchmarking |

## Benchmark Commands

### MOS 6502 CPU

```bash
rake bench[mos6502]   # Default: 5 million cycles
```

Sample results:
- Interpreter: ~60K cycles/s
- JIT: ~230K cycles/s
- Compiler: ~1.58M cycles/s (6.8x over JIT)

### Apple II Full System

```bash
rake bench[apple2]    # CPU + memory + I/O
```

### Game Boy

```bash
rake bench[gameboy]   # Frame-based execution
```

Sample results:
- IR Compiler: ~1.27 MHz (~30% of real-time)
- Verilator: exceeds real hardware speed

## Backend Selection Guide

| Simulation Length | Recommended Backend |
|------------------|-------------------|
| < 100K cycles | Interpreter or JIT |
| 100K – 1M cycles | JIT |
| 1M – 10M cycles | Compiler (AOT) |
| > 10M cycles | Verilator or CIRCT/MLIR |

| Use Case | Recommended Backend |
|----------|-------------------|
| Development and debugging | Ruby Behavioral |
| RSpec test suite | Ruby Behavioral |
| Gate-level verification | IR Interpreter |
| Extended batch testing | IR Compiler |
| Maximum performance | Verilator |
| Native RTL benchmarking | CIRCT/MLIR (Arcilator) |

## Using Each Backend

### Ruby Behavioral (Default)

```ruby
component = MyDesign.new('test')
component.set_input(:a, 42)
component.propagate
```

### IR Interpreter

```ruby
sim = RHDL::Codegen.gate_level([component], backend: :interpreter)
sim.poke('a', 42)
sim.evaluate
result = sim.peek('y')
```

### IR JIT

```ruby
sim = RHDL::Codegen.gate_level([component], backend: :jit)
```

### IR Compiler (AOT)

```ruby
sim = RHDL::Codegen.gate_level([component], backend: :compiler)
```

### Verilator

```bash
# Requires Verilator installed
rhdl export --lang verilog MyComponent
verilator --cc my_component.v --exe testbench.cpp
make -C obj_dir
```

### CIRCT/MLIR

```bash
# Requires firtool and arcilator
rhdl export --lang firrtl MyComponent
firtool my_component.fir --lowering-options=emitVerilog
arcilator my_component.mlir -o sim
```

## Profiling Tips

### Ruby Profiling

```ruby
require 'benchmark'

time = Benchmark.measure do
  1000.times do
    component.propagate
  end
end
puts "1000 propagations: #{time.real}s"
```

### Gate Count as Complexity Metric

```bash
rhdl gates --stats
```

Gate count correlates with simulation time — a component with 400 gates will simulate roughly 8x slower than one with 50 gates at the gate level.

### SIMD Lane Count

For gate-level simulation, increase SIMD lanes for batch throughput:

```bash
RHDL_BENCH_LANES=64 rake bench[mos6502]
```

Default is 64 lanes. Increasing beyond 64 requires wider SIMD operations.

### Cycle Count

Control benchmark duration:

```bash
RHDL_BENCH_CYCLES=1000000 rake bench[mos6502]
```

## Optimization Strategies

1. **Start with behavioral** — get correctness first
2. **Switch to JIT for CI** — fast enough for test suites, catches gate-level bugs
3. **Use AOT Compiler for regression** — best throughput for long test runs
4. **Profile hot components** — gate count reveals complexity bottlenecks
5. **Parallelize with SIMD** — 64 test vectors for free

## Next Steps

- [RTL Simulation](../simulation/rtl-simulation) — behavioral simulation details
- [Gate-Level Simulation](../simulation/gate-level-simulation) — gate-level backends
- [Frontends and Backends](../architecture/frontends-and-backends) — architecture overview

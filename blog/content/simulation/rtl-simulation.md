---
title: RTL Simulation
date: 2025-03-10
tags:
  - simulation
  - rtl
---

RTL simulation verifies your design at the register-transfer level — the same abstraction you write in. It is the fastest feedback loop during development.

## Running RTL Simulation

```bash
rhdl simulate lib/counter.rb --level rtl
```

Or programmatically in Ruby:

```ruby
dut = Counter.new
dut.reset!
dut.enable = 1

10.times do |cycle|
  dut.tick!
  puts "Cycle #{cycle}: count = #{dut.count}"
end
```

## Simulation Backends

RTL simulation can use different backends:

- **Ruby interpreter** — slowest, but easiest to debug with `binding.pry`
- **Rust native** — compiled to native code for fast execution
- **WASM** — compiled to WebAssembly for browser-based simulation

## Waveform Output

Capture signal traces in VCD format for viewing in GTKWave or other waveform viewers:

```ruby
dut.trace_to("output.vcd") do
  1000.times { dut.tick! }
end
```

## Comparison with Gate-Level

RTL simulation is faster because it operates on higher-level abstractions. Use it for functional verification. Switch to [gate-level simulation](gate-level-simulation) when you need to verify timing and synthesis correctness.

---
title: Gate-Level Simulation
date: 2025-03-12
tags:
  - simulation
  - gate-level
---

Gate-level simulation runs your design after synthesis — verifying that the gate-level netlist behaves identically to the RTL description.

## Why Gate-Level Simulation?

After gate synthesis, your design is decomposed into primitive gates (AND, OR, XOR, NOT, MUX, DFF). Gate-level simulation verifies that:

- Synthesis did not introduce functional errors
- Timing constraints are met (with delay annotation)
- Reset sequences initialize all state correctly

## Running Gate-Level Simulation

```bash
rhdl simulate lib/counter.rb --level gate
```

## Primitive Gates

The gate-level netlist consists of:

| Gate | Inputs | Description |
|------|--------|-------------|
| AND | 2+ | Logical AND |
| OR | 2+ | Logical OR |
| XOR | 2 | Exclusive OR |
| NOT | 1 | Inversion |
| MUX | 3 | 2:1 multiplexer |
| DFF | 2 | D flip-flop with clock |

## Performance Considerations

Gate-level simulation is slower than RTL — typically 10-100x depending on design size. Use it selectively:

- Run RTL simulation during development
- Run gate-level simulation before tapeout or FPGA deployment
- Use the Rust/WASM backend for gate-level speed optimization

## Comparing Results

RHDL can automatically compare RTL and gate-level simulation results to flag any discrepancies introduced during synthesis.

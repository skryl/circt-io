---
title: Dialects and Passes
date: 2025-03-03
tags:
  - architecture
  - dialects
  - passes
---

CIRCT organizes hardware concepts into dialects — modular IR components that each handle a specific abstraction level. Passes transform IR between and within dialects.

## Core Dialects

### HW — Hardware Core
The foundational dialect defining modules, ports, wires, and instances. Every hardware design passes through HW.

### Comb — Combinational
Pure combinational operations: add, subtract, and, or, xor, mux, shifts, comparisons. No side effects, no state.

### Seq — Sequential
Stateful elements: registers (flip-flops), clock domains, and reset logic. Bridges the gap between combinational dataflow and clocked hardware.

### SV — SystemVerilog
Constructs specific to SystemVerilog output: always blocks, assign statements, wire declarations. Used during Verilog export.

### FIRRTL
Compatibility with the Chisel/FIRRTL ecosystem. Allows importing FIRRTL designs and lowering them through the CIRCT pipeline.

### Arc
Simulation-oriented representation. Optimized for fast cycle-accurate simulation with LLVM-based code generation.

## Passes

Passes are transformations applied to the IR:

| Pass | Description |
|------|-------------|
| **Lowering** | Convert high-level constructs to lower-level ones |
| **Canonicalization** | Simplify and normalize IR patterns |
| **CSE** | Common subexpression elimination |
| **DCE** | Dead code elimination |
| **Legalization** | Ensure IR conforms to backend requirements |

Passes compose — you can build custom pipelines by chaining passes in any order.

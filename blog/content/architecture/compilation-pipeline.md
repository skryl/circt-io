---
title: Compilation Pipeline
date: 2025-03-05
tags:
  - architecture
  - compilation
---

The CIRCT compilation pipeline transforms high-level hardware descriptions through multiple stages, each producing a well-defined intermediate representation.

## Pipeline Stages

```
Ruby DSL
  │
  ▼
RTL Model (Ruby objects)
  │
  ▼
Gate-Level Netlist
  │
  ▼
CIRCT IR (HW + Comb + Seq)
  │
  ├──▶ SV Dialect ──▶ Verilog text
  ├──▶ Arc Dialect ──▶ Simulation binary
  └──▶ Gate Netlist ──▶ Synthesis output
```

## Stage 1: Ruby to RTL Model

The RHDL frontend parses Ruby component definitions and builds an in-memory RTL model — a graph of modules, ports, and operations that mirrors the source structure.

## Stage 2: RTL to Gate Netlist

The RTL model is lowered to a gate-level netlist. Complex operations (like addition) are decomposed into primitive gates. This stage performs technology-independent optimization.

## Stage 3: Gate Netlist to CIRCT IR

The gate netlist is serialized into CIRCT IR using the HW, Comb, and Seq dialects. At this point, the design is fully represented in MLIR and can be processed by any CIRCT pass.

## Stage 4: Backend Emission

The final stage lowers to a backend-specific dialect and emits output:

- **SV dialect → Verilog** — synthesizable RTL text
- **Arc dialect → simulator** — native or WASM binary
- **Verilator flow** — normalized Verilog for Verilator consumption

## Inspecting the Pipeline

Use `--verbose` to see timing and pass information at each stage:

```bash
rhdl compile lib/design.rb --verbose
```

---
title: Frontends and Backends
date: 2025-03-07
tags:
  - architecture
  - frontend
  - backend
---

CIRCT's hub-and-spoke architecture separates frontends (input languages) from backends (output targets). Each connects to the shared IR independently.

## Frontends

### RHDL (Ruby DSL)
The primary frontend. Ruby hardware descriptions are lowered through an RTL model and gate-level netlist into CIRCT IR.

### Verilog/VHDL Import
Existing HDL designs can be imported into CIRCT IR for simulation, analysis, or integration with RHDL components. This enables incremental adoption without rewriting legacy IP.

### FIRRTL Import
Chisel designs compiled to FIRRTL can be ingested by CIRCT, enabling interoperability with the Chisel ecosystem.

## Backends

### Verilog Export
Generates synthesizable SystemVerilog output suitable for FPGA synthesis tools (Vivado, Quartus, Yosys) and ASIC flows. The output is clean, readable, and inference-friendly.

### Verilator
Produces normalized Verilog optimized for Verilator — the open-source cycle-accurate simulator. Useful for large designs where simulation speed matters.

### Arcilator
CIRCT's native simulation backend. Compiles hardware directly to machine code via LLVM for maximum simulation throughput.

### Rust Compiler
Compiles designs to Rust code that can be further compiled to native binaries or WASM. The WASM target enables browser-based interactive simulation and visualization.

## Mixing Frontends

A single project can combine RHDL components with imported Verilog modules. The CIRCT IR provides a common ground where both are represented uniformly and can be simulated or synthesized together.

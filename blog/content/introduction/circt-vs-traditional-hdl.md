---
title: CIRCT vs Traditional HDLs
date: 2025-01-25
tags:
  - introduction
  - comparison
---

How does designing hardware with CIRCT and RHDL compare to traditional Verilog and VHDL workflows? This article breaks down the key differences.

## Language Expressiveness

| Feature | Verilog/VHDL | RHDL + CIRCT |
|---------|-------------|--------------|
| Parameterization | Generate statements | Ruby metaprogramming |
| Type system | Basic wire/reg | Rich Ruby types |
| Testing | Custom testbenches | RSpec integration |
| Package management | IP-XACT, vendor tools | RubyGems |
| Code reuse | Copy-paste, includes | Modules, mixins, gems |

## Compilation Model

Traditional HDL tools compile monolithically — a single tool transforms your source into a netlist with limited visibility into intermediate steps. CIRCT uses a pass-based compilation model where each transformation is explicit and inspectable:

1. **Ruby DSL** → RTL model
2. **RTL model** → Gate-level netlist
3. **Gate-level netlist** → CIRCT IR (MLIR-based)
4. **CIRCT IR** → Backend output (Verilog, simulation binary, etc.)

Each stage produces a well-defined intermediate representation that can be inspected, tested, and optimized independently.

## Simulation

CIRCT offers multiple simulation backends — Verilator integration for cycle-accurate simulation, Arcilator for LLVM-based native execution, and a Rust compiler that can target WASM for browser-based simulation. Traditional tools typically lock you into a single simulation environment.

## When to Use Traditional HDLs

CIRCT does not replace Verilog and VHDL everywhere. For FPGA vendor-specific primitives, legacy IP integration, and projects with strict tool certification requirements, traditional HDLs remain the right choice. CIRCT's Verilog import/export capabilities let you mix both approaches in the same project.

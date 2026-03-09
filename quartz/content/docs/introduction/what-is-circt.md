---
title: What is CIRCT
date: 2025-01-20
tags:
  - introduction
  - circt
---

CIRCT — the Comprehensive IR Compiler for Hardware — is an open-source compiler infrastructure for hardware design. Built on MLIR, it provides a modular, extensible framework for representing and transforming hardware descriptions at multiple levels of abstraction.

## A Hub-and-Spoke Architecture

At the core of CIRCT is a set of intermediate representations (IRs) organized as dialects. Each dialect captures a specific level of hardware abstraction — from high-level RTL constructs down to primitive gates. This hub-and-spoke model allows frontends (like the RHDL Ruby DSL) and backends (like Verilog export or simulation) to connect through a shared, well-defined IR.

## Why CIRCT Matters

Traditional hardware design tools operate as monolithic black boxes. CIRCT takes a different approach — a composable compiler infrastructure where each transformation is an explicit, testable pass. This brings software engineering best practices to hardware design:

- **Reproducible builds** — deterministic compilation from source to netlist
- **Incremental compilation** — only reprocess what changed
- **Extensibility** — add new frontends, backends, or optimization passes without modifying the core
- **Interoperability** — mix and match tools across the ecosystem

## Key Dialects

| Dialect | Purpose |
|---------|---------|
| **HW** | Core hardware types — modules, ports, wires |
| **Comb** | Combinational operations — arithmetic, logic, muxes |
| **Seq** | Sequential elements — registers, clock domains |
| **SV** | SystemVerilog constructs for export |
| **FIRRTL** | Chisel/FIRRTL compatibility |
| **Arc** | Simulation-oriented representation |

## Getting Started

If you are new to CIRCT, start with the [Installation guide](../installation/getting-started) to set up your environment, then explore the [Ruby DSL Fundamentals](../basics/ruby-dsl-fundamentals) to write your first hardware description.

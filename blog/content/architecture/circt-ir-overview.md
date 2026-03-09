---
title: CIRCT IR Overview
date: 2025-03-01
tags:
  - architecture
  - ir
  - mlir
---

The CIRCT Intermediate Representation is the core of the compiler — a multi-level IR built on MLIR that represents hardware at different levels of abstraction.

## What is MLIR?

MLIR (Multi-Level Intermediate Representation) is a compiler infrastructure from the LLVM project designed for building domain-specific compilers. CIRCT uses MLIR to define hardware-specific dialects — each capturing a particular level of abstraction.

## The Hub-and-Spoke Model

CIRCT IR sits at the center of the toolchain:

```
   Ruby DSL ──┐
              ├──▶ CIRCT IR ──┬──▶ Verilog Export
   Verilog ───┘     (hub)     ├──▶ Simulation
                              ├──▶ Gate Synthesis
                              └──▶ Visualization
```

Multiple frontends lower into the same IR, and multiple backends consume it. This decouples the input language from the output target.

## IR Structure

A CIRCT IR module contains:

- **Modules** — hardware modules with ports (inputs/outputs)
- **Operations** — combinational and sequential operations within modules
- **Types** — integer types, clock types, memory types
- **Attributes** — metadata like names, locations, and annotations

## Inspection

You can dump the IR at any stage of compilation to inspect what the compiler is doing:

```bash
rhdl compile lib/counter.rb --emit-ir --stage=after-lowering
```

This transparency is a key advantage over black-box HDL tools — you can see exactly how your design is transformed at each compilation stage.

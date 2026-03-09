---
title: Gate Synthesis
date: 2025-03-20
tags:
  - synthesis
  - gates
---

Gate synthesis lowers your RTL design to a netlist of primitive gates — the first step toward real hardware.

## Primitive Gate Library

CIRCT synthesizes to six primitive gates:

| Gate | Symbol | Description |
|------|--------|-------------|
| AND | `&` | N-input logical AND |
| OR | `\|` | N-input logical OR |
| XOR | `^` | 2-input exclusive OR |
| NOT | `~` | Inverter |
| MUX | `?:` | 2:1 multiplexer |
| DFF | `□` | D flip-flop with clock |

## Running Synthesis

```bash
rhdl synthesize lib/counter.rb -o output/counter_gates.json
```

## Synthesis Report

The synthesis report shows gate counts and critical path depth:

```
Module: Counter
  AND gates:  12
  OR gates:    8
  XOR gates:   4
  NOT gates:   6
  MUX gates:   3
  DFF gates:   4
  ---
  Total gates: 37
  Critical path depth: 6
```

## Optimization

The compiler applies technology-independent optimizations:

- **Logic minimization** — reduce gate count
- **Retiming** — move registers to balance pipeline stages
- **Sharing** — reuse hardware for mutually exclusive operations

## Inspecting the Netlist

Export the gate-level netlist as a circuit diagram:

```bash
rhdl diagram lib/counter.rb --level gate --format svg
```

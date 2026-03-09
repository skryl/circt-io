---
title: Building a 6502 Processor
date: 2025-04-01
tags:
  - showcase
  - 6502
  - processor
---

A complete MOS 6502 processor implemented in RHDL — 56 instructions, 151 opcodes, and 13 addressing modes, all described in Ruby.

## Overview

The 6502 is an 8-bit processor that powered the Apple II, Commodore 64, and NES. Its relatively simple architecture makes it an excellent first processor project, while still being complex enough to exercise every part of the CIRCT toolchain.

## Architecture

| Component | Description |
|-----------|-------------|
| **ALU** | 8-bit arithmetic with BCD mode |
| **Register File** | A, X, Y registers + stack pointer |
| **Control Unit** | 26-state FSM for instruction decode |
| **Address Bus** | 16-bit addressing with 13 modes |
| **Status Register** | N, V, B, D, I, Z, C flags |

## Implementation Highlights

The control unit is the heart of the design — a 26-state FSM that sequences fetch, decode, and execute phases:

```ruby
state_machine(clk: :posedge, reset: :sync) do
  state :FETCH do
    addr_bus <= pc
    pc <= pc + 1
    transition_to :DECODE
  end

  state :DECODE do
    # ... 151 opcodes decoded here
  end

  # ... 24 more states
end
```

## Results

- **56 instructions** fully implemented
- **151 opcodes** including all addressing modes
- **BCD arithmetic** — decimal mode for financial calculations
- Runs in the browser via WASM at interactive speed

## Try It

The [CIRCT showcase](https://circt.io/showcase/6502.html) includes a live browser simulation where you can load 6502 programs and watch them execute cycle by cycle.

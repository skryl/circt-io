---
title: Gate-Level IR
date: 2025-03-01
tags:
  - architecture
  - ir
  - gate-level
---

RHDL's gate-level backend converts high-level HDL components into netlists composed of seven primitive gate types plus D flip-flops. This intermediate representation (IR) is the foundation for gate-level simulation, synthesis statistics, and verification.

## Architecture

```
HDL Component (Ruby DSL)
        │
        ▼
┌───────────────────┐
│   Netlist Lower   │  lib/rhdl/codegen/structure/lower.rb
└───────────────────┘
        │
        ▼
┌───────────────────┐
│  Structure IR     │  Gate-level intermediate representation
└───────────────────┘
        │
        ├──────────────┬──────────────┬──────────────┐
        ▼              ▼              ▼              ▼
┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│  JSON Export│ │ CPU Sim     │ │ SIMD Sim    │ │ Verilog Gen │
└─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘
```

## Primitive Gates

The IR uses seven combinational primitives plus a sequential element:

| Gate | Inputs | Function |
|------|--------|----------|
| `AND` | 2+ | Bitwise AND (N-ary reduced to binary tree) |
| `OR` | 2+ | Bitwise OR (N-ary reduced to binary tree) |
| `XOR` | 2 | Exclusive OR |
| `NOT` | 1 | Inverter |
| `MUX` | 3 | 2-to-1 multiplexer (select, when_true, when_false) |
| `BUF` | 1 | Buffer/identity (used for fan-out) |
| `CONST` | 0 | Constant 0 or 1 |

| Element | Inputs | Function |
|---------|--------|----------|
| `DFF` | d, clk, rst, en | D flip-flop with optional reset and enable |

## IR Data Structures

The Structure IR (`RHDL::Codegen::Structure::IR`) represents a complete gate-level design:

```ruby
ir = RHDL::Codegen::Structure::IR.new(
  name: "component_name",
  net_count: 42,
  gates: [...],
  dffs: [...],
  inputs: { "a" => [0, 1, 2, 3, 4, 5, 6, 7] },
  outputs: { "y" => [32, 33, 34, 35, 36, 37, 38, 39] }
)
```

### Gate Struct

```ruby
Gate = Struct.new(:type, :inputs, :output, :value)
# type:   :AND, :OR, :XOR, :NOT, :MUX, :BUF, :CONST
# inputs: Array of net indices feeding this gate
# output: Net index for gate output
# value:  Constant value (for CONST gates only)
```

### DFF Struct

```ruby
DFF = Struct.new(:d, :q, :rst, :en, :async_reset, :reset_value)
# d:           D input net index
# q:           Q output net index
# rst:         Reset signal net index (optional)
# en:          Enable signal net index (optional)
# async_reset: Boolean for asynchronous reset behavior
# reset_value: Value on reset (0 or 1)
```

### Net Mapping

Every signal in the design is bit-blasted — multi-bit buses become arrays of individual net indices. Input and output ports map to arrays of net IDs:

```json
{
  "inputs": {
    "a": [0, 1, 2, 3, 4, 5, 6, 7],
    "b": [8, 9, 10, 11, 12, 13, 14, 15]
  },
  "outputs": {
    "result": [100, 101, 102, 103, 104, 105, 106, 107]
  }
}
```

## Gate Count Examples

Typical gate counts for common components:

| Component | Width | Gates | DFFs | Nets |
|-----------|-------|-------|------|------|
| AndGate | 1 | 1 | 0 | 3 |
| RippleCarryAdder | 8 | 48 | 0 | 67 |
| Register | 8 | 0 | 8 | 24 |
| Counter | 8 | ~60 | 8 | ~80 |
| ALU | 8 | ~400 | 0 | ~500 |
| Multiplier | 8 | ~800 | 0 | ~1000 |
| SynthDatapath (CPU) | — | ~505 | 24 | ~600 |

## Supported Components

The backend supports 53 HDL components across all categories:

| Category | Count | Examples |
|----------|-------|---------|
| Gates | 13 | AND, OR, XOR, NOT, NAND, NOR, Bitwise ops |
| Sequential | 12 | DFF, Register, ShiftRegister, Counter, PC |
| Arithmetic | 10 | Adders, Subtractor, ALU, Multiplier, Divider |
| Combinational | 16 | Mux2–MuxN, Decoders, Encoders, BarrelShifter |
| CPU | 2 | InstructionDecoder, SynthDatapath |

## File Locations

```
lib/rhdl/codegen/structure/
├── ir.rb           # Gate-level IR data structures
├── lower.rb        # HDL to gate-level lowering
├── primitives.rb   # Gate primitive definitions
├── toposort.rb     # Topological sorting
├── sim_cpu.rb      # CPU-based interpreter
└── sim_gpu.rb      # SIMD-style simulator
```

## Next Steps

- [Lowering Algorithms](../architecture/dialects-and-passes) — how high-level constructs map to gates
- [Compilation Pipeline](../architecture/compilation-pipeline) — from Ruby to Verilog
- [Gate Synthesis](../synthesis/gate-synthesis) — using the gate-level backend

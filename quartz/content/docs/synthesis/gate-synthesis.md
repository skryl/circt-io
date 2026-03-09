---
title: Gate Synthesis
date: 2025-03-20
tags:
  - synthesis
  - gate-level
---

RHDL's gate-level synthesis backend lowers HDL components to primitive gate netlists — AND, OR, XOR, NOT, MUX, BUF, CONST, and DFF. This provides gate count metrics, structural verification, and a path to hardware implementation.

## Quick Start

### CLI

```bash
# Synthesize all components to gate-level JSON
rhdl gates --export

# Show gate count statistics
rhdl gates --stats

# Synthesize CPU datapath components
rhdl gates --simcpu

# Clean output
rhdl gates --clean
```

### Programmatic

```ruby
# Lower a component to gate-level IR
component = RHDL::HDL::ALU.new('alu', width: 8)
ir = RHDL::Codegen::Structure::Lower.from_components([component], name: 'alu')

puts "Gates: #{ir.gates.length}"
puts "DFFs:  #{ir.dffs.length}"
puts "Nets:  #{ir.net_count}"

# Export to JSON
File.write('alu.json', ir.to_json)
```

## Statistics Output

```
RHDL Gate-Level Synthesis Statistics
==================================================

Components by Gate Count:
--------------------------------------------------
  cpu/synth_datapath: 505 gates, 24 DFFs, 892 nets
  arithmetic/alu: 312 gates, 0 DFFs, 456 nets
  arithmetic/multiplier: 256 gates, 0 DFFs, 384 nets
  ...

==================================================
Total Components: 53
Total Gates: 2847
Total DFFs: 156
```

## Primitive Gate Types

| Gate | Function | Notes |
|------|----------|-------|
| `AND` | `a & b` | N-ary reduced to binary tree |
| `OR` | `a \| b` | N-ary reduced to binary tree |
| `XOR` | `a ^ b` | Binary only |
| `NOT` | `~a` | Inverter |
| `MUX` | `sel ? t : f` | 2-to-1 multiplexer |
| `BUF` | `a` | Buffer (fan-out) |
| `CONST` | `0` or `1` | Constant value |
| `DFF` | D flip-flop | With optional reset and enable |

## Supported Components (53 total)

| Category | Count | Examples |
|----------|-------|---------|
| Gates | 13 | AND, OR, XOR, NOT, NAND, NOR, Bitwise ops |
| Sequential | 12 | DFF, Register, ShiftRegister, Counter, PC, SP |
| Arithmetic | 10 | Adders, Subtractor, ALU, Multiplier, Divider |
| Combinational | 16 | Mux2–MuxN, Decoders, Encoders, BarrelShifter |
| CPU | 2 | InstructionDecoder, SynthDatapath |

## Gate Count Reference

| Component | Width | Gates | DFFs | Nets |
|-----------|-------|-------|------|------|
| AndGate | 1 | 1 | 0 | 3 |
| FullAdder | 1 | 5 | 0 | 9 |
| RippleCarryAdder | 8 | 48 | 0 | 67 |
| Register | 8 | 0 | 8 | 24 |
| Counter | 8 | ~60 | 8 | ~80 |
| ALU | 8 | ~400 | 0 | ~500 |
| Multiplier | 8 | ~800 | 0 | ~1000 |
| SynthDatapath (CPU) | — | ~505 | 24 | ~600 |

## Output Format

Each component generates two files:

```
export/gates/
├── arithmetic/
│   ├── alu.json          # Machine-readable netlist
│   ├── alu.txt           # Human-readable statistics
│   └── ...
├── sequential/
│   ├── counter.json
│   ├── counter.txt
│   └── ...
└── cpu/
    ├── synth_datapath.json
    └── synth_datapath.txt
```

### JSON Netlist Format

```json
{
  "name": "alu",
  "net_count": 1234,
  "inputs": {
    "a": [0, 1, 2, 3, 4, 5, 6, 7],
    "b": [8, 9, 10, 11, 12, 13, 14, 15]
  },
  "outputs": {
    "result": [100, 101, 102, 103, 104, 105, 106, 107]
  },
  "gates": [
    {"type": "AND", "inputs": [0, 8], "output": 50},
    {"type": "XOR", "inputs": [0, 8], "output": 51}
  ],
  "dffs": []
}
```

## Limitations

- **Memories**: RAM/ROM not supported at gate level
- **Clock domains**: Single clock domain only
- **Tristate**: Lowers to simple gates (not true high-Z)
- **Large designs**: Gate counts grow quadratically for multipliers/dividers
- **Timing**: Functional only, no propagation delay modeling

## Next Steps

- [Verilog Export](../synthesis/verilog-export) — RTL-level Verilog generation
- [FPGA Workflows](../synthesis/fpga-workflows) — verification with Icarus Verilog
- [Gate-Level IR](../architecture/circt-ir-overview) — IR data structures

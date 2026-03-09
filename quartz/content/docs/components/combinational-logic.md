---
title: Combinational Logic
date: 2025-02-20
tags:
  - components
  - gates
  - combinational
---

RHDL provides a complete library of combinational components — from basic logic gates through multiplexers, decoders, encoders, and arithmetic units.

## Logic Gates

### Basic Gates

All gates support configurable input counts:

```ruby
gate = RHDL::HDL::AndGate.new(nil, inputs: 3)  # 3-input AND
gate.set_input(:a0, 1)
gate.set_input(:a1, 1)
gate.set_input(:a2, 1)
gate.propagate
gate.get_output(:y)  # => 1
```

| Component | Function | Ports |
|-----------|----------|-------|
| `NotGate` | Inversion | `a` → `y` |
| `Buffer` | Non-inverting driver | `a` → `y` |
| `AndGate` | AND | `a0..aN` → `y` |
| `OrGate` | OR | `a0..aN` → `y` |
| `XorGate` | XOR | `a0..aN` → `y` |
| `NandGate` | NAND | `a0..aN` → `y` |
| `NorGate` | NOR | `a0..aN` → `y` |
| `XnorGate` | XNOR | `a0..aN` → `y` |
| `TristateBuffer` | Tri-state driver | `a`, `en` → `y` |

### Bitwise Operations

Multi-bit logic operations on buses:

```ruby
and_op = RHDL::HDL::BitwiseAnd.new(nil, width: 8)
and_op.set_input(:a, 0b11110000)
and_op.set_input(:b, 0b10101010)
and_op.propagate
and_op.get_output(:y)  # => 0b10100000
```

| Component | Function |
|-----------|----------|
| `BitwiseAnd` | N-bit AND |
| `BitwiseOr` | N-bit OR |
| `BitwiseXor` | N-bit XOR |
| `BitwiseNot` | N-bit inversion |

## Multiplexers

Select one of several inputs based on a selector signal:

```ruby
mux = RHDL::HDL::Mux4.new(nil, width: 8)
mux.set_input(:a, 10)
mux.set_input(:b, 20)
mux.set_input(:c, 30)
mux.set_input(:d, 40)
mux.set_input(:sel, 2)
mux.propagate
mux.get_output(:y)  # => 30
```

| Component | Inputs | Selector Width |
|-----------|--------|---------------|
| `Mux2` | 2 | 1 |
| `Mux4` | 4 | 2 |
| `Mux8` | 8 | 3 |
| `MuxN` | N (parameterized) | log2(N) |

### Demultiplexers

Route one input to one of several outputs:

| Component | Outputs |
|-----------|---------|
| `Demux2` | 2 |
| `Demux4` | 4 |

## Decoders

Binary to one-hot conversion:

```ruby
dec = RHDL::HDL::Decoder3to8.new
dec.set_input(:a, 5)
dec.set_input(:en, 1)
dec.propagate
dec.get_output(:y5)  # => 1
dec.get_output(:y0)  # => 0
```

| Component | Input Width | Output Width |
|-----------|------------|-------------|
| `Decoder2to4` | 2 | 4 |
| `Decoder3to8` | 3 | 8 |
| `DecoderN` | N (parameterized) | 2^N |

## Encoders

Priority encoders — find the highest-priority active input:

| Component | Input Width | Output Width |
|-----------|------------|-------------|
| `Encoder4to2` | 4 | 2 |
| `Encoder8to3` | 8 | 3 |

## Arithmetic Components

### Adders

```ruby
adder = RHDL::HDL::RippleCarryAdder.new(nil, width: 8)
adder.set_input(:a, 100)
adder.set_input(:b, 50)
adder.set_input(:cin, 0)
adder.propagate
adder.get_output(:sum)   # => 150
adder.get_output(:cout)  # => 0
```

| Component | Description | Ports |
|-----------|-------------|-------|
| `HalfAdder` | 1-bit, no carry in | `a`, `b` → `sum`, `cout` |
| `FullAdder` | 1-bit with carry | `a`, `b`, `cin` → `sum`, `cout` |
| `RippleCarryAdder` | N-bit adder | `a`, `b`, `cin` → `sum`, `cout`, `overflow` |
| `Subtractor` | N-bit subtractor | `a`, `b`, `bin` → `diff`, `bout`, `overflow` |
| `AddSub` | Add or subtract | `a`, `b`, `sub` → `result`, `cout` |

### Comparators

```ruby
cmp = RHDL::HDL::Comparator.new(nil, width: 8)
cmp.set_input(:a, 50)
cmp.set_input(:b, 30)
cmp.set_input(:signed, 0)
cmp.propagate
cmp.get_output(:gt)  # => 1
```

| Port | Description |
|------|-------------|
| `eq` | Equal |
| `gt` | Greater than |
| `lt` | Less than |
| `gte` | Greater or equal |
| `lte` | Less or equal |

### Multiplier and Divider

| Component | Ports |
|-----------|-------|
| `Multiplier` | `a`, `b` → `product` (2N bits) |
| `Divider` | `dividend`, `divisor` → `quotient`, `remainder`, `div_by_zero` |
| `IncDec` | Increment or decrement |

### ALU

Full arithmetic logic unit with 16 operations:

```ruby
alu = RHDL::HDL::ALU.new(nil, width: 8)
alu.set_input(:a, 10)
alu.set_input(:b, 5)
alu.set_input(:op, RHDL::HDL::ALU::OP_ADD)
alu.set_input(:cin, 0)
alu.propagate
alu.get_output(:result)  # => 15
```

| Op | Code | Operation |
|----|------|-----------|
| `OP_ADD` | 0 | Add |
| `OP_SUB` | 1 | Subtract |
| `OP_AND` | 2 | Bitwise AND |
| `OP_OR` | 3 | Bitwise OR |
| `OP_XOR` | 4 | Bitwise XOR |
| `OP_NOT` | 5 | Bitwise NOT (of A) |
| `OP_SHL` | 6 | Shift left |
| `OP_SHR` | 7 | Shift right logical |
| `OP_SAR` | 8 | Shift right arithmetic |
| `OP_ROL` | 9 | Rotate left |
| `OP_ROR` | 10 | Rotate right |
| `OP_MUL` | 11 | Multiply (low byte) |
| `OP_DIV` | 12 | Divide |
| `OP_MOD` | 13 | Modulo |
| `OP_INC` | 14 | Increment A |
| `OP_DEC` | 15 | Decrement A |

**ALU flags:** `cout` (carry), `zero`, `negative`, `overflow`

## Shifters and Bit Operations

### Barrel Shifter

Fast multi-bit shifter supporting shift, arithmetic shift, and rotate:

| Port | Description |
|------|-------------|
| `a` | Input value |
| `shift` | Shift amount (log2(N) bits) |
| `dir` | Direction (0=left, 1=right) |
| `arith` | Arithmetic shift |
| `rotate` | Rotate instead of shift |
| `y` | Result |

### Bit Utilities

| Component | Function |
|-----------|----------|
| `SignExtend` | Sign-extend to wider width |
| `ZeroExtend` | Zero-extend to wider width |
| `ZeroDetect` | Output 1 if input is all zeros |
| `BitReverse` | Reverse bit order |
| `PopCount` | Count number of 1 bits |
| `LZCount` | Count leading zeros |

## Next Steps

- [Sequential Logic](../components/sequential-logic) — flip-flops, registers, counters
- [Memory Components](../components/memory-components) — RAM, ROM, register files
- [State Machines](../components/state-machines) — finite state machine DSL

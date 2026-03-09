---
title: Building a 6502 Processor
date: 2025-04-01
tags:
  - showcase
  - cpu
  - 6502
---

RHDL includes a complete, cycle-accurate implementation of the MOS 6502 microprocessor — all 56 official instructions, 13 addressing modes, BCD arithmetic, and multiple simulation backends.

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                    MOS6502::CPU                      │
├─────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────┐    │
│  │              Registers                       │    │
│  │  A (8b)  X (8b)  Y (8b)  PC (16b)  SP (8b) │    │
│  │  Status: N V - B D I Z C                     │    │
│  └─────────────────────────────────────────────┘    │
│  ┌──────────────┐  ┌──────────────────────────┐    │
│  │   ALU (14    │  │   Control Unit (26-state  │    │
│  │  operations) │  │   FSM)                    │    │
│  └──────────────┘  └──────────────────────────┘    │
│  ┌──────────────┐  ┌──────────────────────────┐    │
│  │   Address    │  │   Instruction Decoder     │    │
│  │  Generator   │  │   (151 valid opcodes)     │    │
│  └──────────────┘  └──────────────────────────┘    │
└─────────────────────────────────────────────────────┘
                          │
                    ┌─────┴─────┐
                    │  64KB RAM │
                    └───────────┘
```

## Components

### ALU — 14 Operations

| Code | Operation | Flags |
|------|-----------|-------|
| ADC | Add with carry | N, V, Z, C |
| SBC | Subtract with borrow | N, V, Z, C |
| AND | Bitwise AND | N, Z |
| ORA | Bitwise OR | N, Z |
| EOR | Bitwise XOR | N, Z |
| ASL | Arithmetic shift left | N, Z, C |
| LSR | Logical shift right | N, Z, C |
| ROL | Rotate left | N, Z, C |
| ROR | Rotate right | N, Z, C |
| INC | Increment | N, Z |
| DEC | Decrement | N, Z |
| CMP | Compare | N, Z, C |
| BIT | Bit test | N, V, Z |
| TST | Pass through | N, Z |

Full BCD (decimal) mode support for ADC and SBC, matching real hardware behavior.

### Control Unit — 26-State FSM

The control unit sequences instruction execution through states including RESET, FETCH, DECODE, EXECUTE, WRITE_MEM, PUSH, PULL, BRANCH, and interrupt handling (JSR/RTS/RTI/BRK).

### 13 Addressing Modes

| Mode | Example | Cycles |
|------|---------|--------|
| Implied | `CLC` | 2 |
| Accumulator | `ASL A` | 2 |
| Immediate | `LDA #$42` | 2 |
| Zero Page | `LDA $00` | 3 |
| Zero Page,X | `LDA $00,X` | 4 |
| Zero Page,Y | `LDX $00,Y` | 4 |
| Absolute | `LDA $1234` | 4 |
| Absolute,X | `LDA $1234,X` | 4+ |
| Absolute,Y | `LDA $1234,Y` | 4+ |
| Indirect | `JMP ($1234)` | 5 |
| Indexed Indirect | `LDA ($00,X)` | 6 |
| Indirect Indexed | `LDA ($00),Y` | 5+ |
| Relative | `BNE label` | 2+ |

Modes marked "+" take an extra cycle when crossing page boundaries.

### Memory Map

| Range | Description |
|-------|-------------|
| $0000–$00FF | Zero Page |
| $0100–$01FF | Stack |
| $0200–$7FFF | RAM |
| $8000–$FFFF | ROM (program space) |
| $FFFA–$FFFB | NMI Vector |
| $FFFC–$FFFD | Reset Vector |
| $FFFE–$FFFF | IRQ/BRK Vector |

## Built-In Assembler

RHDL includes a two-pass 6502 assembler:

```asm
        *= $8000
COUNT   = $10

START:  LDA #0
        STA COUNT
LOOP:   INC COUNT
        LDA COUNT
        CMP #10
        BNE LOOP
        BRK
```

```ruby
cpu = MOS6502::CPU.new
cpu.assemble_and_load(source, 0x8000)
cpu.reset
cpu.run
puts cpu.status_string
# A:0A X:00 Y:00 SP:FD PC:800B P:33 [nv-BdIZC]
```

## Simulation Backends

| Backend | Speed | Use Case |
|---------|-------|----------|
| HDL Simulation | ~50K IPS | Development, debugging |
| Ruby ISA Simulator | ~500K IPS | Test suites |
| Native Rust ISA | ~3.5M IPS | Performance benchmarks |
| IR JIT | ~230K cycles/s | Gate-level verification |
| IR Compiler | ~1.58M cycles/s | Long simulations |

## Testing

189+ tests covering all instructions, addressing modes, BCD arithmetic, and algorithms (bubble sort, Fibonacci, multiplication, division):

```bash
bundle exec rake spec_6502
```

## Next Steps

- [Apple II System](../showcase/apple-ii-system) — full Apple II built on this 6502
- [8-bit CPU Tutorial](../showcase/8bit-cpu) — simpler CPU to start with
- [RTL Simulation](../simulation/rtl-simulation) — debugging tools

---
title: 8-bit CPU Tutorial
date: 2025-04-20
tags:
  - showcase
  - cpu
  - tutorial
---

This tutorial walks through building a simple 8-bit CPU in RHDL — a great starting point before tackling more complex designs like the [MOS 6502](../showcase/building-a-6502) or [RISC-V](../showcase/risc-v-rv32i).

## Architecture

The CPU features:
- 8-bit data bus and 16-bit address space (64KB addressable memory)
- Accumulator register (A)
- ALU with arithmetic and logic operations
- Stack pointer initialized to $FF
- Single-cycle execution model

## Instruction Set

### Single-Byte Instructions

| Opcode | Mnemonic | Description |
|--------|----------|-------------|
| $00 | NOP | No operation |
| $01 | HLT | Halt CPU |
| $02 | PHA | Push A to stack |
| $03 | PLA | Pull A from stack |
| $04 | NOT | Bitwise NOT of A |
| $05 | NEG | Negate A (two's complement) |
| $06 | INC | Increment A |
| $07 | DEC | Decrement A |

### Two-Byte Instructions

| Opcode | Mnemonic | Description |
|--------|----------|-------------|
| $10 | LDI val | Load immediate into A |
| $11 | ADD val | Add immediate to A |
| $12 | SUB val | Subtract immediate from A |
| $13 | AND val | Bitwise AND with immediate |
| $14 | OR val | Bitwise OR with immediate |
| $15 | XOR val | Bitwise XOR with immediate |
| $16 | MUL val | Multiply A by immediate |
| $17 | CMP val | Compare A with immediate |

### Three-Byte Instructions (16-bit address)

| Opcode | Mnemonic | Description |
|--------|----------|-------------|
| $20 | JMP addr | Unconditional jump |
| $21 | JZ addr | Jump if zero flag set |
| $22 | JNZ addr | Jump if zero flag clear |
| $23 | JC addr | Jump if carry set |
| $24 | CALL addr | Call subroutine |
| $25 | RET | Return from subroutine |
| $26 | LDA addr | Load from memory address |
| $27 | STA addr | Store to memory address |

## Building the CPU

### Step 1: Define the ALU

```ruby
class SimpleALU < RHDL::Sim::Component
  input :a, width: 8
  input :b, width: 8
  input :op, width: 4
  output :result, width: 8
  output :zero, :carry

  OP_ADD = 0; OP_SUB = 1; OP_AND = 2; OP_OR = 3
  OP_XOR = 4; OP_NOT = 5; OP_INC = 6; OP_DEC = 7

  behavior do
    add_full = local(:add_full, a + b, width: 9)
    sub_full = local(:sub_full, a - b, width: 9)

    result <= case_select(op, {
      OP_ADD => add_full[7..0],
      OP_SUB => sub_full[7..0],
      OP_AND => a & b,
      OP_OR  => a | b,
      OP_XOR => a ^ b,
      OP_NOT => ~a,
      OP_INC => (a + lit(1, width: 8))[7..0],
      OP_DEC => (a - lit(1, width: 8))[7..0]
    }, default: a)

    carry <= case_select(op, {
      OP_ADD => add_full[8],
      OP_SUB => sub_full[8]
    }, default: lit(0, width: 1))

    zero <= mux(result == lit(0, width: 8),
                lit(1, width: 1), lit(0, width: 1))
  end
end
```

### Step 2: Build the Datapath

```ruby
class SimpleCPU < RHDL::Sim::Component
  input :clk, :rst
  input :mem_data_in, width: 8
  output :mem_addr, width: 16
  output :mem_data_out, width: 8
  output :mem_write_en
  output :halted

  # Sub-components
  instance :alu, SimpleALU
  instance :acc, Register, width: 8         # Accumulator
  instance :pc, ProgramCounter, width: 16   # Program counter
  instance :sp, StackPointer                # Stack pointer

  # Clock distribution
  port :clk => [[:acc, :clk], [:pc, :clk], [:sp, :clk]]
  port :rst => [[:acc, :rst], [:pc, :rst], [:sp, :rst]]

  # ALU connections
  port [:acc, :q] => [:alu, :a]
  port [:alu, :result] => [:acc, :d]
end
```

### Step 3: Implement the Decoder

The decoder interprets each opcode and generates control signals for the datapath — which register to load, what ALU operation to perform, and whether to read or write memory.

## Memory Layout

| Range | Description |
|-------|-------------|
| $0000–$00FF | Variables (zero page) |
| $0100–$07FF | General purpose |
| $0800–$0FFF | Display memory |
| $1000+ | Program memory |

## Example Program

A simple counter that stores values to display memory:

```ruby
cpu = SimpleCPU.new('cpu')

program = [
  0x10, 0x00,               # LDI #0      ; A = 0
  0x27, 0x08, 0x00,         # STA $0800   ; Store to display
  0x06,                     # INC         ; A++
  0x17, 0x10,               # CMP #16    ; Compare with 16
  0x22, 0x02, 0x00,         # JNZ $0002  ; Loop if not zero
  0x01                      # HLT        ; Stop
]

cpu.load_program(program, 0x1000)
cpu.reset
cpu.run
```

## Testing

```ruby
RSpec.describe SimpleCPU do
  let(:cpu) { SimpleCPU.new('test') }

  def clock!
    cpu.set_input(:clk, 0); cpu.propagate
    cpu.set_input(:clk, 1); cpu.propagate
  end

  it "executes LDI instruction" do
    cpu.load_program([0x10, 0x42, 0x01])  # LDI #$42; HLT
    cpu.reset
    2.times { clock! }  # Fetch + execute LDI
    expect(cpu.accumulator).to eq(0x42)
  end

  it "generates valid Verilog" do
    verilog = SimpleCPU.to_verilog_hierarchy
    expect(verilog).to include('module simple_cpu')
    expect(verilog).to include('module simple_alu')
  end
end
```

## Extending the Design

Once the basic CPU works, try adding:
- **More registers** — X and Y index registers
- **More addressing modes** — indirect, indexed
- **Interrupts** — IRQ and NMI vectors
- **Wider data path** — 16-bit operations

## Next Steps

- [Building a 6502](../showcase/building-a-6502) — a real-world 8-bit CPU with 13 addressing modes
- [RISC-V RV32](../showcase/risc-v-rv32i) — modern 32-bit ISA with Linux boot
- [Ruby DSL Fundamentals](../basics/ruby-dsl-fundamentals) — complete DSL reference

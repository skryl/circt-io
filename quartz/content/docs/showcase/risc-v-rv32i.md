---
title: RISC-V RV32I
date: 2025-04-15
tags:
  - showcase
  - risc-v
  - processor
---

A RISC-V RV32I processor in RHDL — both single-cycle and 5-stage pipelined implementations demonstrating modern CPU design techniques.

## RV32I Base Integer ISA

The RV32I instruction set includes 47 instructions across 6 formats:

| Type | Instructions | Description |
|------|-------------|-------------|
| **R** | ADD, SUB, AND, OR, XOR, SLL, SRL, SRA, SLT, SLTU | Register-register operations |
| **I** | ADDI, ANDI, ORI, XORI, SLTI, SLTIU, LB, LH, LW, JALR | Immediate and loads |
| **S** | SB, SH, SW | Store operations |
| **B** | BEQ, BNE, BLT, BGE, BLTU, BGEU | Conditional branches |
| **U** | LUI, AUIPC | Upper immediate |
| **J** | JAL | Jump and link |

## Single-Cycle Implementation

The single-cycle version executes each instruction in one clock cycle:

```ruby
class RV32I_SingleCycle < RHDL::Component
  # Fetch
  instruction <= imem[pc]

  # Decode
  rs1_data <= regs[rs1]
  rs2_data <= regs[rs2]

  # Execute
  alu_result <= alu.compute(rs1_data, rs2_data, alu_op)

  # Memory
  mem_data <= dmem[alu_result] if mem_read

  # Writeback
  regs[rd] <= writeback_data if reg_write
end
```

## 5-Stage Pipeline

The pipelined version adds pipeline registers between stages:

- **IF** — Instruction Fetch
- **ID** — Instruction Decode / Register Read
- **EX** — Execute / ALU
- **MEM** — Memory Access
- **WB** — Write Back

### Hazard Handling

- **Data hazards** — forwarding unit bypasses ALU results
- **Control hazards** — branch prediction with flush on mispredict
- **Load-use hazard** — pipeline stall for one cycle

## Performance

The pipelined implementation achieves higher throughput at the cost of added complexity. Both versions compile to WASM for browser-based simulation where you can step through instructions and inspect register state.

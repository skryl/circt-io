---
title: RISC-V RV32 Processor
date: 2025-04-15
tags:
  - showcase
  - riscv
  - cpu
---

RHDL includes a RISC-V RV32 implementation featuring two core variants (single-cycle and 5-stage pipeline), a full privilege model, MMIO devices, and the ability to boot both xv6 and Linux.

## Quick Start

```bash
# Build native backends
bundle exec rake native:build

# Run a raw RISC-V binary
rhdl examples riscv path/to/program.bin

# Boot xv6
rhdl examples riscv --xv6

# Boot Linux
rhdl examples riscv --linux

# Native RTL via Verilator
rhdl examples riscv --mode verilog --xv6

# Native RTL via CIRCT/MLIR (Arcilator)
rhdl examples riscv --mode circt --xv6
```

## Core Variants

### Single-Cycle Core

```
PC → IFetch → Decode → RegFile → ALU → Mem/MMIO → Writeback
```

Focused on determinism and debuggability. Default for all modes.

### 5-Stage Pipeline

| Stage | Function |
|-------|----------|
| IF | Instruction fetch + next-PC |
| ID | Decode + register read + immediate generation |
| EX | ALU / branch target / compare |
| MEM | Load/store + MMIO access |
| WB | Register writeback |

Features forwarding for RAW dependencies, stalls for load-use hazards, and flush for taken branches.

```bash
rhdl examples riscv --core pipeline --xv6
```

## ISA Support

### Base + Extensions

| Extension | Instructions |
|-----------|-------------|
| **RV32I** | Full base integer set (add, sub, loads, stores, branches, jumps) |
| **M** | Multiply/divide (mul, div, rem families) |
| **A** + Zacas | Atomic operations (lr.w, sc.w, AMO ops, amocas.w) |
| **C** subset | Compressed instructions |
| **F** subset | Float load/store, move (flw, fsw, fmv) |
| **V** subset | Vector (vsetvli, vmv, vadd) |
| **Zicsr** | CSR read/write operations |
| **Zifencei** | Instruction fence |
| **Zba** | Address generation (sh1add, sh2add, sh3add) |
| **Zbb** | Basic bit manipulation (andn, orn, min, max) |
| **Zbc** | Carry-less multiply (clmul, clmulh, clmulr) |

### Privilege Model

- Machine and supervisor privilege modes
- Trap delegation via CSR configuration
- Sv32 virtual memory with `satp` and `sfence.vma`
- Timer and external interrupts (CLINT + PLIC)

## Platform / MMIO

The cores run with a `virt`-style MMIO layout:

| Device | Description |
|--------|-------------|
| CLINT | Timer and software interrupt source |
| PLIC | External interrupt routing |
| UART | 16550-compatible console I/O |
| virtio-blk | MMIO disk for filesystem boot |

## Booting xv6

```bash
# Build xv6 artifacts
./examples/riscv/software/build_xv6.sh

# Boot
rhdl examples riscv --xv6
```

Milestones: `init: starting sh` ~19.3M cycles, shell prompt ~22.5M cycles.

## Booting Linux

```bash
# Build Linux kernel + BusyBox rootfs
./examples/riscv/software/build_linux.sh

# Boot
rhdl examples riscv --linux
```

The Linux build produces kernel, DTB, and initramfs artifacts. The runner loads them into memory, patches the DTB initrd bounds, and hands off to the kernel entry point.

## Simulation Modes

| Mode | Backend | Description |
|------|---------|-------------|
| `ruby` | Ruby HDL | Full signal visibility |
| `ir` | Interpreter/JIT/Compiler | Default, best balance |
| `verilog` | Verilator | Native RTL, fastest |
| `circt` | Arcilator | CIRCT/MLIR native RTL |

```bash
rhdl examples riscv --mode ir --sim compile --xv6
rhdl examples riscv --mode verilog --linux
```

## HDL Structure

| Block | Description |
|-------|-------------|
| `cpu.rb` | Single-cycle CPU top |
| `pipeline/cpu.rb` | 5-stage pipeline top |
| `decoder.rb` | Instruction decode + control |
| `alu.rb` | Integer ALU (+ extension ops) |
| `imm_gen.rb` | Immediate generation (I/S/B/U/J) |
| `register_file.rb` | x0–x31 registers |
| `csr_file.rb` | CSR / privilege state |
| `memory.rb` | Instruction/data memory |
| `clint.rb`, `plic.rb` | Interrupt controllers |
| `uart.rb` | Console I/O |
| `virtio_blk.rb` | Block device |

## Testing

```bash
# All RISC-V tests
bundle exec rake spec[riscv]

# Extension-specific
bundle exec rspec spec/examples/riscv/rv32c_extension_spec.rb
bundle exec rspec spec/examples/riscv/rv32f_extension_spec.rb

# Linux boot milestones
bundle exec rspec spec/examples/riscv/linux_boot_milestones_spec.rb

# xv6 boot
bundle exec rspec spec/examples/riscv/xv6_readiness_spec.rb
```

## Next Steps

- [8-bit CPU Tutorial](../showcase/8bit-cpu) — start with something simpler
- [Building a 6502](../showcase/building-a-6502) — classic 8-bit CPU
- [Performance Tuning](../simulation/performance-tuning) — optimizing long simulations

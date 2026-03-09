---
title: Game Boy Implementation
date: 2025-04-10
tags:
  - showcase
  - gameboy
  - emulation
---

RHDL includes a cycle-accurate Game Boy emulation system — a complete implementation of the original DMG hardware with Game Boy Color support, featuring the SM83 CPU, pixel processing unit (PPU), audio processing unit (APU), and multiple memory bank controllers.

## Running the Emulator

```bash
# Load a ROM
rhdl examples gameboy --rom game.gb

# Demo mode
rhdl examples gameboy --demo

# Force Game Boy Color mode
rhdl examples gameboy --rom game.gbc --gbc

# Enable audio
rhdl examples gameboy --rom game.gb --audio
```

## System Architecture

| Component | Description |
|-----------|-------------|
| **SM83 CPU** | Z80-variant processor at 4.194 MHz |
| **PPU** | Pixel Processing Unit, 160x144 display |
| **APU** | Audio Processing Unit, 4 sound channels |
| **Memory** | 64KB address space with bank switching |
| **Cartridge** | MBC1–MBC5 mapper support |
| **Timer** | Configurable timer with interrupt |
| **Serial** | Serial link interface |
| **Joypad** | Button input interface |

## Display

### DMG Mode
- 160x144 pixels
- 4 shades of gray
- 8x8 pixel tiles
- Background, window, and sprite layers
- 40 sprites total, 10 per scanline

### GBC Mode
- 160x144 pixels
- 32,768 colors (15-bit RGB)
- Separate palettes for BG and sprites
- Double-speed CPU mode (8.388 MHz)

## Audio System

The APU produces sound through 4 channels:

| Channel | Type | Features |
|---------|------|----------|
| CH1 | Square wave | Frequency sweep, envelope |
| CH2 | Square wave | Envelope (no sweep) |
| CH3 | Programmable wave | 32 samples, 4-bit |
| CH4 | Noise | LFSR-based, envelope |

All channels are configurable through memory-mapped registers.

## Memory Map

| Address | Description |
|---------|-------------|
| $0000–$3FFF | ROM Bank 0 (16KB) |
| $4000–$7FFF | ROM Bank N (switchable) |
| $8000–$9FFF | Video RAM (8KB) |
| $A000–$BFFF | External RAM (cartridge) |
| $C000–$DFFF | Work RAM (8KB) |
| $FE00–$FE9F | Sprite Attribute Table (OAM) |
| $FF00–$FF7F | I/O Registers |
| $FF80–$FFFE | High RAM (127B) |
| $FFFF | Interrupt Enable Register |

## Cartridge Mappers

| Mapper | Features |
|--------|----------|
| No MBC | 32KB ROM only |
| MBC1 | Up to 2MB ROM, 32KB RAM |
| MBC2 | Up to 256KB ROM, built-in RAM |
| MBC3 | RTC, up to 2MB ROM, 32KB RAM |
| MBC5 | Up to 8MB ROM, 128KB RAM |

## Simulation Backends

Multiple backends available for different performance needs:

```bash
# HDL simulation (most accurate)
rhdl examples gameboy --mode ruby --rom game.gb

# IR-level (faster)
rhdl examples gameboy --mode ir --sim compile --rom game.gb

# Verilator (fastest)
rhdl examples gameboy --mode verilog --rom game.gb
```

### Performance

| Backend | Speed | Notes |
|---------|-------|-------|
| IR Compiler | ~1.27 MHz | ~30% of real-time |
| Verilator | >4.19 MHz | Exceeds real hardware speed |

## HDL Components

```
examples/gameboy/hdl/
├── gameboy.rb           # Top-level system
├── cpu/                 # SM83 CPU
│   ├── cpu.rb           # CPU core
│   ├── decoder.rb       # Instruction decode
│   ├── alu.rb           # ALU
│   └── registers.rb     # Register file
├── ppu/                 # Pixel Processing Unit
│   ├── ppu.rb           # PPU core
│   ├── fetcher.rb       # Tile/sprite fetcher
│   └── fifo.rb          # Pixel FIFO
├── apu/                 # Audio Processing Unit
│   ├── apu.rb           # APU core
│   ├── square.rb        # Square wave channels
│   ├── wave.rb          # Programmable wave
│   └── noise.rb         # Noise generator
├── memory/              # Memory subsystem
│   ├── mmu.rb           # Memory management
│   └── dma.rb           # DMA controller
└── cartridge/           # Cartridge mappers
    ├── mbc1.rb
    ├── mbc3.rb
    └── mbc5.rb
```

## Next Steps

- [RISC-V RV32](../showcase/risc-v-rv32i) — a modern ISA implementation
- [Building a 6502](../showcase/building-a-6502) — another classic CPU
- [Performance Tuning](../simulation/performance-tuning) — optimizing simulation speed

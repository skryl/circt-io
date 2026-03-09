---
title: Apple II System Design
date: 2025-04-05
tags:
  - showcase
  - apple-ii
  - emulation
---

RHDL includes a comprehensive Apple II emulation system — a complete computer built from HDL components, featuring the MOS 6502 CPU, video generator, keyboard, speaker, Disk II controller, and an interactive terminal interface.

## System Architecture

```
┌──────────────────────────────────────────────────────────┐
│                     Apple II System                       │
├──────────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌────────────────────────┐ │
│  │ MOS 6502 │  │ Timing   │  │   Video Generator      │ │
│  │   CPU    │◄─│ Generator│─▶│  Text (40x24)          │ │
│  │  1 MHz   │  │  14 MHz  │  │  Lo-res (40x48)        │ │
│  └────┬─────┘  └──────────┘  │  Hi-res (280x192)      │ │
│       │                       └────────────────────────┘ │
│  ┌────┴──────────────────────────────────────────────┐   │
│  │              Address / Data Bus                     │   │
│  └────┬─────────┬──────────┬──────────┬──────────────┘   │
│  ┌────┴────┐┌───┴────┐┌───┴────┐┌────┴─────┐            │
│  │  48KB   ││  12KB  ││  I/O   ││ Disk II  │            │
│  │  RAM    ││  ROM   ││ $C000  ││ Slot 6   │            │
│  └─────────┘└────────┘└────────┘└──────────┘            │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐                 │
│  │ Keyboard │ │ Speaker  │ │ Gameport │                 │
│  └──────────┘ └──────────┘ └──────────┘                 │
└──────────────────────────────────────────────────────────┘
```

## Running the Emulator

```bash
# Full Apple II with ROM
rhdl apple2 --appleiigo

# Demo mode (no ROM required)
rhdl apple2 --demo

# Karateka with hi-res graphics
rhdl apple2 --karateka --hires --color

# Load a disk image
rhdl apple2 --appleiigo --disk game.dsk

# Fast simulation
rhdl apple2 --karateka --sim compile --sub-cycles 2
```

## Memory Map

| Address | Size | Description |
|---------|------|-------------|
| $0000–$00FF | 256B | Zero Page |
| $0100–$01FF | 256B | Stack |
| $0400–$07FF | 1KB | Text Page 1 (40x24) |
| $2000–$3FFF | 8KB | Hi-Res Page 1 (280x192) |
| $4000–$5FFF | 8KB | Hi-Res Page 2 |
| $C000–$C0FF | 256B | I/O Page (soft switches) |
| $D000–$FFFF | 12KB | ROM |

## I/O Soft Switches

### Keyboard

| Address | Function |
|---------|----------|
| $C000 | Read key data (bit 7 = strobe) |
| $C010 | Clear keyboard strobe |

### Video Modes

| Address | Effect |
|---------|--------|
| $C050 | Graphics mode |
| $C051 | Text mode |
| $C052 | Full screen |
| $C053 | Mixed mode (4 lines text) |
| $C054 | Display page 1 |
| $C055 | Display page 2 |
| $C056 | Lo-res graphics |
| $C057 | Hi-res graphics |

### Speaker

| Address | Effect |
|---------|--------|
| $C030 | Toggle speaker click |

## Video Modes

### Text Mode (40x24)
Standard 40-column display. Character encoding: inverse ($00–$3F), flashing ($40–$7F), normal ($80–$FF).

### Lo-Res Graphics (40x48)
16-color graphics. Each byte encodes two vertically stacked pixels (low nibble = top, high nibble = bottom).

### Hi-Res Graphics (280x192)
High-resolution monochrome/color. 7 pixels per byte with 1 color palette bit. Non-linear memory layout.

## Disk II Controller

Full emulation of the Disk II floppy drive controller in slot 6. Supports DOS 3.3 `.dsk` disk images (143,360 bytes = 35 tracks x 16 sectors x 256 bytes).

## HDL Components

| Component | Description |
|-----------|-------------|
| `Apple2` | Top-level system integration |
| `CPU6502` | MOS 6502 with bus interface |
| `VideoGenerator` | Text, lo-res, hi-res output |
| `TimingGenerator` | 14.318 MHz timing and sync |
| `Keyboard` | PS/2 keyboard interface |
| `DiskII` | Disk controller |
| `CharacterROM` | Character generator |
| `RAM` | 48KB main memory |
| `AudioPWM` | PWM audio output |

## Simulation Backends

```bash
# Ruby HDL (most accurate)
rhdl apple2 --mode ruby --appleiigo

# IR with JIT (fast)
rhdl apple2 --mode ir --sim jit --appleiigo

# Verilator (fastest)
rhdl apple2 --mode verilog --appleiigo

# CIRCT/MLIR
rhdl apple2 --mode circt --appleiigo
```

## Display Renderers

The terminal emulator supports multiple rendering modes:
- **ASCII** — basic text output
- **ANSI color** — 16-color terminal rendering
- **Braille** — Unicode Braille characters for hi-res display

```bash
rhdl apple2 --karateka --hires --color --hires-width 280
```

## Next Steps

- [Building a 6502](../showcase/building-a-6502) — the CPU at the heart of the Apple II
- [Game Boy Implementation](../showcase/game-boy-implementation) — another full system emulation
- [Browser Simulation](../simulation/browser-simulation) — run Apple II in the browser

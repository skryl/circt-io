---
title: Game Boy Implementation
date: 2025-04-10
tags:
  - showcase
  - game-boy
  - processor
---

A Nintendo Game Boy implemented in RHDL — SM83 CPU, PPU with sprites, timer, and 4-channel audio processing unit.

## System Overview

| Component | Specification |
|-----------|--------------|
| **CPU** | SM83 (modified Z80) at 4.19 MHz |
| **PPU** | 160x144 LCD, 4 shades, sprites + background + window |
| **Timer** | Configurable divider with interrupt |
| **APU** | 4 channels: 2 pulse, 1 wave, 1 noise |
| **Memory** | 8KB VRAM, 8KB WRAM, OAM, I/O registers |

## CPU — SM83

The SM83 is a hybrid between Intel 8080 and Zilog Z80 instruction sets. Key features:

- 8-bit data bus, 16-bit address bus
- 7 registers: A, B, C, D, E, H, L + flags
- 16-bit register pairs: BC, DE, HL, SP
- CB-prefixed extended instructions for bit manipulation

## Pixel Processing Unit

The PPU is the most complex subsystem, implementing the Game Boy's tile-based rendering pipeline:

- **Background** — 32x32 tile map, scrollable
- **Window** — overlay layer, fixed position
- **Sprites** — 40 objects, 8x8 or 8x16 pixels, priority and flip
- **Scanline rendering** — mode transitions (OAM search, pixel transfer, HBlank, VBlank)

## Audio Processing Unit

Four independent sound channels with mixing:

- **Channel 1** — square wave with sweep and envelope
- **Channel 2** — square wave with envelope
- **Channel 3** — programmable waveform (32 samples)
- **Channel 4** — LFSR noise with envelope

## Running in the Browser

The Game Boy implementation compiles to WASM and runs in the browser with real-time LCD output and audio synthesis.

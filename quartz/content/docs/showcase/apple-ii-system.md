---
title: Apple II System Design
date: 2025-04-05
tags:
  - showcase
  - apple-ii
  - system
---

A full Apple II system implemented in RHDL — 6502 CPU, 48KB RAM, video output, Disk II controller, keyboard, and speaker.

## System Architecture

The Apple II system integrates multiple components into a complete working computer:

- **6502 CPU** — the processor core (see [Building a 6502](building-a-6502))
- **48KB RAM** — main memory with language card support
- **Text/Graphics Video** — 40-column text and lo-res/hi-res graphics modes
- **Disk II Controller** — floppy disk interface with Woz Machine state machine
- **Keyboard** — ASCII keyboard encoder with strobe
- **Speaker** — 1-bit audio toggle

## Memory Map

```
$0000-$BFFF  48KB RAM
$C000-$C0FF  I/O space (keyboard, speaker, switches)
$C100-$CFFF  Peripheral card ROM
$D000-$FFFF  Monitor ROM / Language Card RAM
```

## Video System

The video generator implements Apple II's unique memory-interleaved display:

- **Text mode** — 40x24 characters, normal and inverse
- **Lo-res graphics** — 40x48 color blocks (16 colors)
- **Hi-res graphics** — 280x192 pixels (6 colors)

## Browser Simulation

The complete system runs in the browser via WASM. Load disk images, type on the keyboard, and watch the video output — all simulated at the gate level in real time.

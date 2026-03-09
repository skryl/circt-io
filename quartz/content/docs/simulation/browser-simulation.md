---
title: Browser-Based Simulation
date: 2025-03-14
tags:
  - simulation
  - wasm
  - web
---

RHDL includes a browser-based simulator that compiles the IR simulation backends to WebAssembly and renders live VCD waveforms using p5.js visualization.

## Overview

The web simulator lets you run RHDL designs directly in the browser — no installation required. It supports multiple execution backends, preconfigured runner presets, and interactive debugging tools.

## Features

- **Multiple backends** — interpreter, JIT, and compiler execution modes
- **Live waveforms** — VCD signal visualization rendered with p5.js
- **Preconfigured presets** — ready-made runners for Generic, CPU, MOS 6502, Apple II, and Game Boy architectures
- **Debugging tools** — value breakpoints and memory inspection
- **Interactive schematic** — component visualization using ELK.js layout and WebGL 2.0

## Architecture

The build process has two stages:

1. **Ruby-side artifact generation** — produces WASM binaries and metadata from RHDL IR
2. **Bun bundling** — packages JavaScript, LitElement components, and runtime assets into `web/dist/`

The application uses:
- **LitElement** components for the UI
- **Redux** for state management
- **ELK.js** for schematic layout
- **WebGL 2.0** for interactive rendering
- **SharedArrayBuffer** for multi-threaded WASM execution

## User Interface

The workspace is organized into tabbed panels:

| Panel | Purpose |
|-------|---------|
| **I/O** | Set inputs, read outputs, control simulation |
| **VCD** | Signal analysis with waveform viewer |
| **Memory** | Browse and inspect memory contents |
| **Components** | Component tree with drill-down |
| **Schematic** | Interactive circuit visualization |

## Running the Simulator

### Prerequisites

- Rust toolchain with `wasm-pack`
- Bun (JavaScript bundler)

### Build

```bash
# Build WASM artifacts
rake web:build

# Bundle and serve
cd web && bun run dev
```

### CORS Requirements

The simulator requires specific HTTP headers for SharedArrayBuffer:

```
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Embedder-Policy: require-corp
```

These are automatically configured for local development. For deployment, the build includes a service worker fallback.

## Presets

The simulator ships with preconfigured presets for demonstration:

| Preset | Description | Components |
|--------|-------------|------------|
| Generic | Basic component testing | Any single component |
| CPU | 8-bit CPU datapath | ALU, registers, PC, decoder |
| MOS 6502 | Full 6502 processor | CPU, memory, I/O |
| Apple II | Apple II system | 6502, video, keyboard, memory |
| Game Boy | Game Boy system | SM83 CPU, PPU, APU, memory |

## Deployment

GitHub Actions workflows automate deployment to GitHub Pages:

```bash
# Build for production
rake web:dist

# Deploy (via CI)
gh workflow run deploy-web
```

## Next Steps

- [RTL Simulation](../simulation/rtl-simulation) — Ruby behavioral simulation
- [Performance Tuning](../simulation/performance-tuning) — backend comparison
- [Building a 6502](../showcase/building-a-6502) — try the MOS 6502 preset

---
title: Browser-Based Simulation
date: 2025-03-14
tags:
  - simulation
  - wasm
  - browser
---

CIRCT can compile hardware designs to WebAssembly, enabling interactive simulation directly in the browser — no installation required.

## How It Works

The Rust compilation backend produces a native binary that can also target `wasm32-unknown-unknown`. The WASM module is loaded in the browser and driven by JavaScript:

```
RHDL → CIRCT IR → Rust → WASM → Browser
```

## Use Cases

- **Interactive demos** — let users experiment with designs without installing tools
- **Education** — teach digital logic with instant visual feedback
- **Documentation** — embed live simulations alongside explanatory text
- **Sharing** — send a URL instead of a toolchain

## Performance

WASM simulation runs at near-native speed in modern browsers. The CIRCT showcase demonstrates complete processor designs (6502, RISC-V) running in the browser at real-time interactive rates.

## Visualization

The browser runtime includes circuit diagram rendering and signal visualization. Watch registers change, memory update, and control signals propagate as the simulation runs.

## Building for WASM

```bash
rhdl compile lib/design.rb --target wasm -o output/design.wasm
```

The output includes the WASM binary and a JavaScript harness for embedding in web pages.

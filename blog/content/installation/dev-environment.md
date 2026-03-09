---
title: Development Environment Setup
date: 2025-02-03
tags:
  - installation
  - tooling
---

A well-configured development environment makes hardware design more productive. This guide covers editor setup, linting, and useful development tools.

## Editor Support

RHDL works with any Ruby-capable editor. Recommended setups:

- **VS Code** — Ruby LSP extension for autocompletion and diagnostics
- **Vim/Neovim** — Solargraph for Ruby language server support
- **RubyMine** — full IDE with built-in Ruby support

## Project Structure

A typical RHDL project follows Ruby conventions:

```
my_design/
├── Gemfile
├── lib/
│   ├── components/
│   │   ├── alu.rb
│   │   └── counter.rb
│   └── my_design.rb
├── spec/
│   ├── alu_spec.rb
│   └── counter_spec.rb
└── output/
    ├── verilog/
    └── diagrams/
```

## Development Tools

- **RSpec** — test framework for hardware verification
- **Guard** — file watcher for automatic recompilation
- **Bundler** — dependency management
- **IRB/Pry** — interactive exploration of designs

## Simulation Setup

For simulation, you will need one of the supported backends:

- **Rust compiler** — included with RHDL, supports WASM output
- **Verilator** — install separately for cycle-accurate Verilog simulation
- **Arcilator** — LLVM-based simulator for native execution speed

---
title: Development Environment Setup
date: 2025-02-03
tags:
  - installation
  - tooling
---

A well-configured development environment makes hardware design more productive. This guide covers editor setup, project structure, and the RHDL toolchain.

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
│   │   ├── counter.rb
│   │   └── decoder.rb
│   └── my_design.rb
├── spec/
│   ├── alu_spec.rb
│   └── counter_spec.rb
├── export/
│   ├── verilog/          # Generated Verilog files
│   ├── gates/            # Gate-level JSON netlists
│   └── roms/             # Assembled ROM binaries
└── diagrams/             # Generated circuit diagrams
```

## RHDL CLI Toolchain

The `rhdl` command provides a unified interface for all design tasks:

### Interactive Debugging

```bash
# Launch TUI debugger with a counter
rhdl tui sequential/counter

# Debug an ALU with specific signals in hex
rhdl tui arithmetic/alu_8bit --signals a,b,result --format hex
```

### Circuit Diagrams

```bash
# Generate all component diagrams
rhdl diagram --all

# Single component, specific format
rhdl diagram RHDL::HDL::ALU --level component --format svg
```

### Verilog Export

```bash
# Export all components
rhdl export --all

# Export a single component
rhdl export --lang verilog --out ./output RHDL::HDL::Counter
```

### Gate-Level Synthesis

```bash
# Synthesize all components to gate-level JSON
rhdl gates --export

# Show synthesis statistics
rhdl gates --stats
```

## Development Tools

| Tool | Purpose |
|------|---------|
| **RSpec** | Test framework for hardware verification |
| **Guard** | File watcher for automatic re-simulation |
| **Bundler** | Dependency management |
| **IRB / Pry** | Interactive exploration of designs |
| **Graphviz** | Required for PNG diagram output (`brew install graphviz` or `apt install graphviz`) |

## Simulation Backends

RHDL supports multiple simulation backends. The Ruby behavioral backend works out of the box. For better performance:

| Backend | Setup | Speed |
|---------|-------|-------|
| Ruby behavioral | Built-in | Baseline |
| Ruby gate-level | Built-in | ~2x |
| Rust native | `cargo build` in RHDL directory | ~50–100x |
| WASM (browser) | Rust toolchain + `wasm-pack` | ~10–20x |

## Environment Variables

| Variable | Description |
|----------|-------------|
| `RHDL_BENCH_LANES` | Number of SIMD lanes for gate-level benchmarks (default: 64) |
| `RHDL_BENCH_CYCLES` | Number of cycles for benchmarks (default: 100,000) |

## Next Steps

- [Your First Circuit](../installation/first-circuit) — build a working design from scratch
- [Ruby DSL Fundamentals](../basics/ruby-dsl-fundamentals) — learn the full DSL

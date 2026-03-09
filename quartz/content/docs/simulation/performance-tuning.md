---
title: Performance Tuning
date: 2025-03-16
tags:
  - simulation
  - performance
---

Tips for getting the most simulation throughput from CIRCT — backend selection, compilation strategies, and design patterns that simulate efficiently.

## Choosing a Backend

| Backend | Speed | Use Case |
|---------|-------|----------|
| Ruby interpreter | Slowest | Debugging, small designs |
| Verilator | Fast | Large designs, standard flow |
| Arcilator | Fastest | Maximum throughput, LLVM-optimized |
| Rust native | Fast | Standalone binaries |
| WASM | Near-native | Browser deployment |

## Compilation Optimization

Enable optimization passes during compilation:

```bash
rhdl compile lib/design.rb --optimize
```

Key optimizations:
- **Common subexpression elimination** — share duplicate logic
- **Dead code elimination** — remove unused signals
- **Constant folding** — evaluate compile-time constants
- **Register merging** — combine equivalent registers

## Design Patterns for Speed

- **Minimize memory depth** — smaller memories simulate faster
- **Avoid unnecessary hierarchy** — flat designs have less overhead
- **Use enable signals** — skip computation when modules are idle
- **Partition clock domains** — simulate independent domains separately

## Profiling

Identify simulation bottlenecks:

```bash
rhdl simulate lib/design.rb --profile
```

This reports time spent in each module, helping you focus optimization effort where it matters.

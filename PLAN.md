# Plan: Migrate rhdl docs to circt.io/docs

## Source (github.com/skryl/rhdl/docs/)

17 markdown files covering the RHDL framework:

| Source File | Content |
|---|---|
| `overview.md` | Architecture, key concepts, signal values, wires, components, simulation flow |
| `dsl.md` | Complete DSL reference: ports, parameters, behavior, sequential, structure, memory, state machines, vec, bundle, codegen |
| `components.md` | Full component library reference: gates, sequential, arithmetic, combinational, memory |
| `cli.md` | CLI tools: tui, diagram, export, gates, apple2 commands |
| `simulation.md` | Simulation backends: Ruby behavioral, gate-level, Rust native, IR-level, performance comparison |
| `export.md` | Verilog export and gate-level synthesis |
| `debugging.md` | Signal probing, waveforms, breakpoints, watchpoints, TUI debugger |
| `diagrams.md` | Circuit diagram generation (component, hierarchy, gate-level) |
| `gate_level_backend.md` | Gate-level synthesis: primitives, IR structure, lowering algorithms, simulation |
| `performance.md` | Backend benchmarks, selection guide, profiling tips |
| `web_simulator.md` | Browser-based WASM simulator |
| `chisel_feature_gap_analysis.md` | Feature comparison with Chisel HDL |
| `mos6502_cpu.md` | MOS 6502 CPU implementation |
| `apple2.md` | Apple II emulation system |
| `gameboy.md` | Game Boy emulation |
| `8bit_cpu.md` | Simple 8-bit CPU tutorial |
| `riscv.md` | RISC-V RV32 implementation |

## Target (quartz/content/docs/)

Current structure has 8 sections with placeholder content. The new structure will replace placeholders with real content from the rhdl repo, reorganized to fit the website's categories.

### Mapping: Source → Target

**introduction/** (keep existing structure, update content from `overview.md`)
- `what-is-circt.md` ← overview.md (architecture, key concepts)
- `why-ruby-for-hardware.md` ← keep/enhance existing + chisel_feature_gap_analysis.md highlights
- `circt-vs-traditional-hdl.md` ← chisel_feature_gap_analysis.md (reframed)

**installation/** (keep existing structure, update from `cli.md` + `overview.md`)
- `getting-started.md` ← cli.md (installation, basic commands)
- `dev-environment.md` ← cli.md + overview.md (building native extensions, toolchain setup)
- `first-circuit.md` ← overview.md (simple circuit example, simulation flow)

**basics/** (replace with real DSL content from `dsl.md`)
- `ruby-dsl-fundamentals.md` ← dsl.md (ports, parameters, behavior blocks, operators)
- `signals-and-types.md` ← dsl.md (signal values, wires, literals, bit selection, concatenation) + overview.md
- `ports-and-interfaces.md` ← dsl.md (vec, bundle, structure DSL)
- `testing-with-rspec.md` ← overview.md (simulation flow, testing patterns) + chisel gap analysis testing section

**components/** (replace with real content from `components.md` + `dsl.md`)
- `combinational-logic.md` ← components.md (gates, bitwise, mux, decoders, encoders) + dsl.md (behavior block)
- `sequential-logic.md` ← components.md (flip-flops, registers, counters) + dsl.md (sequential DSL)
- `memory-components.md` ← components.md (RAM, ROM, register file, stack, FIFO) + dsl.md (memory DSL)
- `state-machines.md` ← dsl.md (state machine DSL, traffic light example)

**architecture/** (replace with real content from multiple sources)
- `circt-ir-overview.md` ← gate_level_backend.md (IR structure, primitives, netlist format)
- `dialects-and-passes.md` ← gate_level_backend.md (lowering algorithms) + export.md (codegen)
- `compilation-pipeline.md` ← export.md (Verilog export) + gate_level_backend.md (synthesis flow)
- `frontends-and-backends.md` ← simulation.md (backend overview table) + export.md

**simulation/** (replace with real content from `simulation.md` + `debugging.md`)
- `rtl-simulation.md` ← simulation.md (Ruby behavioral, sequential semantics, simulator class)
- `gate-level-simulation.md` ← simulation.md (gate-level IR, SIMD lanes, Ruby/Rust backends)
- `browser-simulation.md` ← web_simulator.md (WASM simulator, web interface)
- `performance-tuning.md` ← performance.md + simulation.md (benchmarks, backend selection, profiling)

**synthesis/** (replace with real content from `export.md` + `gate_level_backend.md`)
- `gate-synthesis.md` ← gate_level_backend.md (primitives, lowering, gate counts)
- `verilog-export.md` ← export.md (Verilog generation, module naming, CLI)
- `fpga-workflows.md` ← export.md + gate_level_backend.md (verification flow, iverilog integration)
- `legacy-ip-integration.md` ← chisel_feature_gap_analysis.md (BlackBox section, external Verilog)

**showcase/** (replace with real content from showcase docs)
- `building-a-6502.md` ← mos6502_cpu.md (architecture, components, instruction set)
- `apple-ii-system.md` ← apple2.md (full system emulation, memory map, video)
- `game-boy-implementation.md` ← gameboy.md (SM83 CPU, PPU, APU, memory)
- `risc-v-rv32i.md` ← riscv.md (architecture, pipeline, ISA) — **renamed from 8bit CPU**

**New file:**
- `showcase/8bit-cpu.md` ← 8bit_cpu.md (simple 8-bit CPU tutorial) — add to showcase section and docs index

### Additional updates needed:
- `docs/index.md` — add 8bit CPU link to showcase section, verify all links work
- `blog/index.md` — no changes needed

## Approach

1. Fetch each source doc's raw content from GitHub
2. For each target file, combine relevant source material:
   - Add Quartz frontmatter (title, date, tags)
   - Preserve code examples and tables verbatim
   - Adapt headings/structure to fit the target section's scope
   - Use internal links between docs pages (e.g., `../basics/signals-and-types`)
3. Keep the same file names and directory structure (no renames except adding 8bit-cpu)
4. Update docs/index.md to include the new showcase entry
5. Build quartz to verify, commit, and push

## Execution order

1. introduction/ (3 files)
2. installation/ (3 files)
3. basics/ (4 files)
4. components/ (4 files)
5. architecture/ (4 files)
6. simulation/ (4 files)
7. synthesis/ (4 files)
8. showcase/ (5 files — 4 existing + 1 new)
9. Update docs/index.md
10. Build & verify
11. Commit & push

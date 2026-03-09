---
title: RHDL vs Traditional HDLs
date: 2025-01-25
tags:
  - introduction
  - comparison
---

How does designing hardware with RHDL compare to traditional Verilog/VHDL workflows and modern alternatives like Chisel? This article breaks down the key differences.

## Language Expressiveness

| Feature | Verilog/VHDL | Chisel (Scala) | RHDL (Ruby) |
|---------|-------------|----------------|-------------|
| Parameterization | Generate statements | Scala generics | Ruby metaprogramming |
| Type system | Basic wire/reg | Rich Scala types | Dynamic Ruby types |
| Aggregate types | Structs (SV) | Bundle, Vec | Bundle, Vec |
| Testing | Custom testbenches | ChiselTest | RSpec integration |
| Package management | IP-XACT, vendor tools | sbt / Maven | RubyGems |
| Code reuse | Copy-paste, includes | Scala traits, objects | Modules, mixins, gems |
| State machines | Manual encoding | ChiselEnum + switch | Declarative DSL |
| Memory abstractions | Vendor primitives | Mem / SyncReadMem | Memory DSL |

## What RHDL Shares with Chisel

Both RHDL and Chisel are hardware construction languages embedded in general-purpose programming languages. The core ideas are similar:

- **Aggregate types** — Both support `Bundle` (structured interfaces) and `Vec` (hardware arrays) with direction flipping
- **Parameterized generators** — Both use their host language for elaboration-time hardware generation
- **Sequential logic** — Both provide register primitives with reset and enable semantics
- **Hierarchical composition** — Both support instantiating sub-components and connecting ports

```ruby
# RHDL Bundle — similar concept to Chisel Bundle
class ValidBundle < RHDL::Sim::Bundle
  field :data, width: 8, direction: :output
  field :valid, width: 1, direction: :output
  field :ready, width: 1, direction: :input
end

# Vec — hardware arrays with hardware-indexed access
class MyMux < RHDL::Sim::Component
  input_vec :data_in, count: 4, width: 8
  input :sel, width: 2
  output :result, width: 8

  behavior do
    result <= data_in[sel]  # Generates mux tree for synthesis
  end
end
```

## Where RHDL Differs

### Declarative State Machines

RHDL provides a first-class state machine DSL that eliminates boilerplate state encoding:

```ruby
state_machine clock: :clk, reset: :rst do
  state :RED, value: 0 do
    output red: 1, yellow: 0, green: 0
    transition to: :GREEN, when_cond: :sensor
  end

  state :GREEN, value: 2 do
    output red: 0, yellow: 0, green: 1
    transition to: :YELLOW, after: 10
  end

  state :YELLOW, value: 1 do
    output red: 0, yellow: 1, green: 0
    transition to: :RED, after: 3
  end

  initial_state :RED
  output_state :state
end
```

### Memory DSL

Memories are declared and accessed with dedicated syntax:

```ruby
class RAM256x8 < RHDL::Sim::Component
  include RHDL::DSL::Memory

  input :clk, :we
  input :addr, width: 8
  input :din, width: 8
  output :dout, width: 8

  memory :mem, depth: 256, width: 8

  sync_write :mem, clock: :clk, enable: :we, addr: :addr, data: :din
  async_read :dout, from: :mem, addr: :addr
end
```

### Interactive Debugging

RHDL includes a built-in [TUI debugger](../simulation/rtl-simulation) with waveform display, breakpoints, and watchpoints — no external tools required.

## Compilation Model

Traditional HDL tools compile monolithically — a single tool transforms your source into a netlist with limited visibility into intermediate steps. RHDL uses a multi-stage pipeline:

1. **Ruby DSL** → RTL model (components, ports, behavior)
2. **RTL model** → Gate-level netlist (AND, OR, NOT, MUX, DFF primitives)
3. **Gate-level netlist** → Exportable IR
4. **IR** → Backend output (Verilog, simulation, diagrams)

Each stage produces a well-defined intermediate representation that can be inspected, tested, and optimized independently.

## Simulation Backends

RHDL offers [multiple simulation backends](../simulation/rtl-simulation) — Ruby behavioral for rapid prototyping, gate-level for verification, a Rust native backend for performance, and a [WASM backend](../simulation/browser-simulation) for browser-based simulation. Traditional tools typically lock you into a single simulation environment.

| Backend | Speed | Use Case |
|---------|-------|----------|
| Ruby behavioral | Baseline | Rapid prototyping, debugging |
| Ruby gate-level | ~2x | Verification against gate netlist |
| Rust native | ~50–100x | Performance-critical simulation |
| WASM (browser) | ~10–20x | Interactive demos, education |

## When to Use Traditional HDLs

RHDL does not replace Verilog and VHDL everywhere. For FPGA vendor-specific primitives, legacy IP integration, and projects with strict tool certification requirements, traditional HDLs remain the right choice. RHDL's [Verilog export](../synthesis/verilog-export) lets you use RHDL for design and hand off to traditional tools for implementation.

## Features on the Roadmap

Based on analysis of mature HDL frameworks like Chisel, several features are planned for future RHDL releases:

- **Signed types (SInt)** — first-class signed integer arithmetic
- **DecoupledIO** — standard ready-valid handshake interfaces
- **Arbiter / RRArbiter** — built-in arbitration components
- **BlackBox** — integration of external Verilog modules
- **Bulk connect** — automatic signal matching between interfaces
- **Formal verification** — bounded model checking support

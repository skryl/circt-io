---
title: What is RHDL
date: 2025-01-20
tags:
  - introduction
  - rhdl
---

RHDL is a Ruby-based Hardware Description Language framework that provides a complete environment for designing, simulating, and exporting digital circuits. From primitive logic gates up through complex CPUs, RHDL lets you describe hardware using expressive Ruby code and then simulate, synthesize, or export it to Verilog.

## Architecture

RHDL is organized into several core subsystems:

```
lib/rhdl/
├── simulation/             # Core simulation engine
│   ├── sim_component.rb    # Base component class
│   ├── simulator.rb        # Simulation runner
│   ├── wire.rb             # Signal wires
│   └── clock.rb            # Clock signal
├── hdl/                    # HDL component library
│   ├── gates/              # Logic gate primitives
│   ├── sequential/         # Flip-flops, registers, counters
│   ├── arithmetic/         # Adders, ALU, comparators
│   ├── combinational/      # Multiplexers, decoders, encoders
│   ├── memory/             # RAM, ROM, register files
│   └── cpu/                # Sample CPU implementations
├── dsl/                    # Component definition DSL
├── export/                 # Verilog/gate-level export
├── debug/                  # Debugging tools
├── tui/                    # Terminal UI
└── diagram/                # Diagram generation
```

## Key Concepts

### Signal Values

Signals in RHDL represent digital values:

- **Binary values** — `0` or `1` for single-bit signals, multi-bit integers for buses
- **Unknown (X)** — uninitialized or conflicting values
- **High-impedance (Z)** — disconnected or tri-state outputs

### Wires

Wires connect components and propagate signal changes:

```ruby
wire = RHDL::HDL::Wire.new("my_signal", width: 8)
wire.set(0x42)
wire.get  # => 66
wire.bit(0)  # => 0 (LSB)
wire.bit(6)  # => 1
```

### Components

Components are the building blocks of every design. They inherit from `SimComponent` and define ports using class macros:

```ruby
class MyGate < RHDL::HDL::SimComponent
  port_input :a
  port_input :b
  port_output :y

  behavior do
    y <= a & b
  end
end
```

### Component Library

RHDL ships with a rich library of pre-built components:

| Category | Components |
|----------|------------|
| **Gates** | AND, OR, XOR, NOT, NAND, NOR, XNOR, Buffer, Tristate |
| **Bitwise** | BitwiseAnd, BitwiseOr, BitwiseXor, BitwiseNot |
| **Flip-flops** | DFlipFlop, TFlipFlop, JKFlipFlop, SRFlipFlop, SRLatch |
| **Registers** | Register, ShiftRegister, Counter, ProgramCounter, StackPointer |
| **Arithmetic** | HalfAdder, FullAdder, RippleCarryAdder, Subtractor, ALU, Multiplier, Divider |
| **Combinational** | Mux2–MuxN, Demux, Decoders, Encoders, BarrelShifter, PopCount |
| **Memory** | RAM, DualPortRAM, ROM, RegisterFile, Stack, FIFO |

## Simulation Flow

Designing with RHDL follows a straightforward cycle:

1. **Create components** with their ports defined
2. **Connect components** by linking output wires to input wires
3. **Set inputs** on the top-level component
4. **Propagate** to compute outputs
5. **Clock** sequential components to update state

```ruby
# Create an AND gate
and_gate = RHDL::HDL::AndGate.new("my_and")

# Set inputs
and_gate.set_input(:a0, 1)
and_gate.set_input(:a1, 1)

# Propagate to compute output
and_gate.propagate

# Read output
and_gate.get_output(:y)  # => 1
```

For larger designs, the `Simulator` class manages multiple components and clocks:

```ruby
sim = RHDL::HDL::Simulator.new

alu = RHDL::HDL::ALU.new("alu", width: 8)
reg = RHDL::HDL::Register.new("reg", width: 8)
sim.add_component(alu)
sim.add_component(reg)

clk = RHDL::HDL::Clock.new("clk")
sim.add_clock(clk)

sim.run(100)  # Run for 100 cycles
```

## Getting Started

If you are new to RHDL, start with the [Installation guide](../installation/getting-started) to set up your environment, then explore the [Ruby DSL Fundamentals](../basics/ruby-dsl-fundamentals) to write your first hardware description.

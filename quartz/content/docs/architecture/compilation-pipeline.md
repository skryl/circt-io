---
title: Compilation Pipeline
date: 2025-03-05
tags:
  - architecture
  - compilation
  - verilog
---

RHDL compiles Ruby hardware descriptions through multiple stages — from DSL to RTL model, gate-level netlist, and finally to backend outputs like Verilog, JSON netlists, or simulation binaries.

## Pipeline Overview

```
Ruby DSL Source
      │
      ▼
┌──────────────┐
│  DSL Parse   │  Ports, parameters, behavior/sequential blocks
└──────────────┘
      │
      ▼
┌──────────────┐
│  RTL Model   │  Components, wires, connections, clock domains
└──────────────┘
      │
      ├─────────────────┬─────────────────┐
      ▼                 ▼                 ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ Verilog IR   │ │ Gate-Level   │ │ Behavioral   │
│ (Export)     │ │ IR (Synth)   │ │ Sim          │
└──────────────┘ └──────────────┘ └──────────────┘
      │                 │                 │
      ▼                 ▼                 ▼
   .v files       JSON netlists     Ruby simulation
                  Gate-level sim    Rust native sim
                  SIMD sim          WASM sim
```

## Stage 1: DSL to RTL Model

The Ruby DSL is evaluated at elaboration time. Class macros (`input`, `output`, `wire`, `parameter`, `instance`, `port`) build an in-memory RTL model:

```ruby
class MyALU < RHDL::Sim::Component
  parameter :width, default: 8
  input :a, width: :width       # Resolved to 8 at elaboration
  input :b, width: :width
  output :result, width: :width

  behavior do
    result <= a + b
  end
end
```

During elaboration:
- Parameters are resolved (simple values first, then computed lambdas)
- Port widths are determined
- Sub-component instances are created
- Behavior and sequential blocks are captured as ASTs

## Stage 2: Verilog Export

The Verilog exporter lowers the RTL model to synthesizable Verilog:

```ruby
verilog = MyALU.to_verilog
# or
verilog = MyALU.to_verilog_hierarchy  # All sub-modules
```

### Supported DSL Subset

| Feature | Verilog Mapping |
|---------|----------------|
| `input`/`output` with widths | Port declarations |
| `wire` | Wire declarations |
| `behavior` block | `assign` statements |
| `sequential` block | `always @(posedge clk)` |
| `mux(sel, a, b)` | Ternary `sel ? a : b` |
| `case_select` | `case` statement |
| Arithmetic operators | Verilog operators |
| `instance` + `port` | Module instantiation |
| `memory` + `sync_write` | `reg` arrays with `always` blocks |

### Module Naming

Ruby class names are automatically converted to Verilog module names:

```ruby
RHDL::HDL::ALU             # => "alu"
RHDL::HDL::DualPortRAM     # => "dual_port_ram"
MOS6502::InstructionDecoder # => "mos6502_instruction_decoder"
```

### Signal Sanitization

- Invalid characters replaced with `_`
- Verilog keywords suffixed with `_rhdl`

### Generated Verilog Example

```verilog
module cpu(
  input        clk,
  input        rst,
  input  [7:0] instruction,
  output [15:0] mem_addr,
  output [7:0] mem_data_out
);
  wire [7:0] alu_result;
  wire [3:0] dec_alu_op;

  instruction_decoder decoder_inst (
    .instruction(instruction),
    .alu_op(dec_alu_op)
  );

  alu #(.WIDTH(8)) alu_inst (
    .a(acc_out),
    .b(mem_data_in),
    .op(dec_alu_op),
    .result(alu_result)
  );

  // ... more instantiations
endmodule
```

## Stage 3: Gate-Level Synthesis

The gate-level backend lowers the RTL model to primitive gates:

```ruby
ir = RHDL::Codegen::Structure::Lower.from_components([component], name: 'alu')
```

This stage:
1. Bit-blasts all multi-bit signals to individual nets
2. Lowers arithmetic to gate-level circuits (adders, multipliers)
3. Lowers multiplexers to binary MUX trees
4. Lowers sequential elements to DFF primitives
5. Produces a flat netlist of gates and DFFs

See [Gate-Level IR](../architecture/circt-ir-overview) and [Lowering Algorithms](../architecture/dialects-and-passes) for details.

## Stage 4: FIRRTL Export

RHDL can also export to FIRRTL format for interoperability with the CIRCT/FIRRTL ecosystem:

```ruby
firrtl = MyComponent.to_firrtl
firrtl = MyComponent.to_firrtl_hierarchy
```

## Intermediate Representation Access

You can inspect the IR at any stage:

```ruby
ir = MyComponent.to_ir

ir.ports       # Port definitions
ir.nets        # Wire declarations
ir.regs        # Register declarations
ir.assigns     # Continuous assignments
ir.instances   # Sub-component instances
ir.processes   # Sequential processes
ir.memories    # Memory definitions
```

## CLI Workflow

```bash
# Export all components to Verilog
rhdl export --all

# Export to gate-level JSON
rhdl gates --export

# Show synthesis statistics
rhdl gates --stats

# Generate circuit diagrams
rhdl diagram --all
```

## Next Steps

- [Frontends and Backends](../architecture/frontends-and-backends) — simulation backend overview
- [Verilog Export](../synthesis/verilog-export) — detailed export guide
- [Gate Synthesis](../synthesis/gate-synthesis) — gate-level synthesis usage

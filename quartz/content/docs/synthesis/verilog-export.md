---
title: Verilog Export
date: 2025-03-22
tags:
  - synthesis
  - verilog
  - export
---

RHDL exports synthesizable Verilog from your Ruby hardware descriptions. This page covers the export workflow, supported DSL features, module naming, and generated output.

## Quick Start

### CLI

```bash
# Export all components
rhdl export --all

# Export only library components
rhdl export --all --scope lib

# Export only examples
rhdl export --all --scope examples

# Export a single component
rhdl export --lang verilog --out ./output RHDL::HDL::Counter

# Export with custom top module name
rhdl export --lang verilog --out ./output --top my_counter RHDL::HDL::Counter

# Clean generated files
rhdl export --clean
```

### Programmatic

```ruby
# Single module
verilog = MyComponent.to_verilog

# With custom module name
verilog = MyComponent.to_verilog(top_name: 'custom_name')

# Complete hierarchy (all sub-modules)
verilog = MyComponent.to_verilog_hierarchy
```

## Supported DSL Features

| DSL Feature | Verilog Output |
|-------------|---------------|
| `input`/`output` with widths | Port declarations |
| `wire` | Wire declarations |
| `behavior` block | `assign` statements |
| `sequential` block | `always @(posedge clk)` |
| `mux(sel, a, b)` | Ternary `sel ? a : b` |
| `case_select` | `case` statement |
| Arithmetic operators | Verilog operators |
| Bitwise operators | Verilog bitwise ops |
| Shift operators | Verilog shift ops |
| Comparison operators | Verilog comparisons |
| `instance` + `port` | Module instantiation |
| `memory` + `sync_write` | `reg` arrays with `always` blocks |
| `async_read` | `assign` from memory |
| Bit selection `a[7..0]` | Verilog bit select |
| `concat` | Verilog concatenation `{a, b}` |

Anything outside this subset raises an error during lowering.

## Module Naming

Ruby class names are automatically converted to snake_case Verilog module names:

```ruby
RHDL::HDL::ALU             # => "alu"
RHDL::HDL::DualPortRAM     # => "dual_port_ram"
MOS6502::InstructionDecoder # => "mos6502_instruction_decoder"
```

### Signal Sanitization

- Invalid characters replaced with `_`
- Verilog keywords suffixed with `_rhdl`

## Generated Output Example

For this RHDL component:

```ruby
class Counter < RHDL::Sim::SequentialComponent
  parameter :width, default: 8
  input :clk, :rst, :en
  output :q, width: :width

  sequential clock: :clk, reset: :rst, reset_values: { q: 0 } do
    q <= mux(en, q + lit(1, width: 8), q)
  end
end
```

RHDL generates:

```verilog
module counter #(
  parameter WIDTH = 8
)(
  input        clk,
  input        rst,
  input        en,
  output [7:0] q
);
  reg [7:0] q_reg;

  always @(posedge clk) begin
    if (rst)
      q_reg <= 8'h00;
    else
      q_reg <= en ? (q_reg + 8'h01) : q_reg;
  end

  assign q = q_reg;
endmodule
```

## Hierarchical Export

For designs with sub-components, `to_verilog_hierarchy` generates all modules:

```ruby
verilog = CPU.to_verilog_hierarchy
```

This produces a single file containing all referenced modules, or individual files per module when using the CLI.

## Output Directory Structure

```
export/verilog/
├── gates/
│   ├── and_gate.v
│   ├── or_gate.v
│   └── ...
├── sequential/
│   ├── counter.v
│   ├── register.v
│   └── ...
├── arithmetic/
│   ├── alu.v
│   └── ...
└── mos6502/
    ├── mos6502_alu.v
    └── ...
```

## FIRRTL Export

RHDL can also export to FIRRTL format for interoperability with the CIRCT ecosystem:

```ruby
firrtl = MyComponent.to_firrtl
firrtl = MyComponent.to_firrtl_hierarchy
```

## Intermediate Representation

Access the IR directly for custom processing:

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

## Next Steps

- [Gate Synthesis](../synthesis/gate-synthesis) — gate-level netlist generation
- [FPGA Workflows](../synthesis/fpga-workflows) — verification with external tools
- [Compilation Pipeline](../architecture/compilation-pipeline) — end-to-end flow

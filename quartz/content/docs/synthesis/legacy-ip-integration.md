---
title: Legacy IP Integration
date: 2025-03-26
tags:
  - synthesis
  - verilog
  - interop
---

RHDL designs can interoperate with existing Verilog IP through its Verilog export capabilities. This page covers strategies for mixing RHDL-generated and hand-written Verilog in the same project.

## Verilog Export for Integration

RHDL generates clean, standard Verilog that integrates with any Verilog-based toolchain:

```bash
# Export your RHDL design
rhdl export --lang verilog --out ./rtl RHDL::HDL::MyDesign

# Export complete hierarchy
rhdl export --all --scope lib --out ./rtl
```

The generated Verilog uses:
- Standard `module` / `endmodule` syntax
- Parameterized modules with `#(parameter ...)`
- Explicit port widths and directions
- `assign` for combinational logic
- `always @(posedge clk)` for sequential logic
- Module instantiation for hierarchies

## Wrapping External Verilog

To use existing Verilog IP within an RHDL design, create a wrapper component that matches the external module's interface:

```ruby
class ExternalPLL < RHDL::Sim::Component
  # Match the external Verilog module's port interface
  input :clk_in
  input :rst
  output :clk_out
  output :locked

  # Behavioral model for simulation
  behavior do
    clk_out <= clk_in
    locked <= ~rst
  end
end
```

When you export to Verilog, replace the generated behavioral module with the real Verilog IP in your build system:

```tcl
# In your synthesis script
add_files rtl/external_pll.v     ;# Real vendor PLL
add_files rtl/my_design.v        ;# RHDL-generated
```

## Top-Level Integration

A common pattern is to write the top-level integration in Verilog while using RHDL for the design logic:

```verilog
// top.v — hand-written top-level
module top(
  input        sys_clk,
  input        sys_rst,
  input  [7:0] gpio_in,
  output [7:0] gpio_out,
  output [3:0] led
);

  // Vendor PLL
  wire clk_100mhz, pll_locked;
  pll_inst pll(
    .clk_in(sys_clk),
    .clk_out(clk_100mhz),
    .locked(pll_locked)
  );

  // RHDL-generated design
  wire rst = sys_rst | ~pll_locked;
  my_design core(
    .clk(clk_100mhz),
    .rst(rst),
    .data_in(gpio_in),
    .data_out(gpio_out),
    .status(led)
  );

endmodule
```

## FIRRTL Interop

For projects using the CIRCT ecosystem, RHDL can export to FIRRTL:

```ruby
firrtl = MyDesign.to_firrtl_hierarchy
File.write('my_design.fir', firrtl)
```

This enables integration with FIRRTL-based tools and transformations.

## BlackBox Support (Planned)

A future RHDL release will add first-class BlackBox support for external modules:

```ruby
# Planned API
class MyBlackBox < RHDL::BlackBox
  verilog_resource "vsrc/mymodule.v"

  input :in, width: 8
  output :out, width: 8

  # Optional: parameters passed to Verilog module
  verilog_parameter "DEPTH", 256
end
```

Until then, use the wrapper pattern described above.

## Integration Checklist

1. **Export RHDL design** to Verilog with `rhdl export`
2. **Verify standalone** with Icarus Verilog (`iverilog`)
3. **Create wrappers** for vendor-specific IP (PLLs, BRAMs, I/O buffers)
4. **Write top-level** in Verilog connecting RHDL modules to vendor IP
5. **Add constraints** (timing, pin assignments) for your target FPGA
6. **Synthesize** with vendor tools (Vivado, Quartus, Yosys)

## Naming Conventions

RHDL generates predictable module names from Ruby class names:

| Ruby Class | Verilog Module |
|-----------|---------------|
| `RHDL::HDL::ALU` | `alu` |
| `RHDL::HDL::DualPortRAM` | `dual_port_ram` |
| `MOS6502::InstructionDecoder` | `mos6502_instruction_decoder` |
| `MyDesign::TopLevel` | `my_design_top_level` |

Plan your naming to avoid conflicts with vendor IP module names.

## Next Steps

- [Verilog Export](../synthesis/verilog-export) — detailed export reference
- [FPGA Workflows](../synthesis/fpga-workflows) — FPGA toolchain integration
- [RHDL vs Traditional HDLs](../introduction/circt-vs-traditional-hdl) — feature comparison

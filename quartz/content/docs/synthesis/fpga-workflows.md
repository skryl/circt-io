---
title: FPGA Workflows
date: 2025-03-24
tags:
  - synthesis
  - fpga
  - verification
---

RHDL generates synthesizable Verilog that can be fed into FPGA and ASIC toolchains. This page covers verification with Icarus Verilog, integration with FPGA vendor tools, and the CIRCT/MLIR export path.

## Verification with Icarus Verilog

Icarus Verilog (`iverilog`) is a free Verilog simulator that can verify RHDL's generated output.

### Installation

```bash
# Ubuntu/Debian
apt-get install iverilog

# macOS
brew install icarus-verilog
```

### Manual Verification

```bash
# 1. Export component to Verilog
rhdl export --lang verilog --out ./output RHDL::HDL::ALU

# 2. Write a testbench
cat > testbench.v << 'EOF'
module tb;
  reg [7:0] a, b;
  reg [3:0] op;
  reg cin;
  wire [7:0] result;
  wire cout, zero, negative, overflow;

  alu uut(.a(a), .b(b), .op(op), .cin(cin),
          .result(result), .cout(cout),
          .zero(zero), .negative(negative),
          .overflow(overflow));

  initial begin
    a = 8'd10; b = 8'd5; op = 4'd0; cin = 0; #10;
    $display("ADD: %d + %d = %d", a, b, result);

    op = 4'd1; #10;
    $display("SUB: %d - %d = %d", a, b, result);

    $finish;
  end
endmodule
EOF

# 3. Compile and run
iverilog -o sim output/alu.v testbench.v
vvp sim
```

### Automated Equivalence Testing

RHDL's test suite includes gate-level equivalence tests when `iverilog` is available:

```ruby
if HdlToolchain.iverilog_available?
  it "generated Verilog matches behavioral simulation" do
    # Generate Verilog and testbench
    # Compile with iverilog
    # Run and compare outputs against Ruby simulation
  end
end
```

## FPGA Vendor Tool Integration

### Xilinx Vivado

```bash
# Export all components
rhdl export --all

# Create Vivado project and add generated Verilog
vivado -mode batch -source create_project.tcl

# In your TCL script:
# add_files export/verilog/
# set_property top my_design [current_fileset]
# launch_runs synth_1
```

### Intel Quartus

```bash
# Export to Verilog
rhdl export --lang verilog --out ./rtl RHDL::HDL::MyDesign

# Add to Quartus project
quartus_sh --flow compile my_project
```

### Open-Source FPGA Tools (Yosys + nextpnr)

```bash
# Synthesize with Yosys
yosys -p "read_verilog output/my_design.v; synth_ice40 -top my_design -json output.json"

# Place and route with nextpnr
nextpnr-ice40 --hx8k --json output.json --asc output.asc

# Generate bitstream
icepack output.asc output.bin
```

## CIRCT/MLIR Path

RHDL can export to FIRRTL for processing by the CIRCT toolchain:

```ruby
# Export to FIRRTL
firrtl = MyComponent.to_firrtl_hierarchy
File.write('my_design.fir', firrtl)
```

```bash
# Process with firtool
firtool my_design.fir -o my_design.v

# Or use arcilator for simulation
firtool my_design.fir --lowering-options=emitVerilog
arcilator my_design.mlir -o sim
```

## Gate Count Estimation

Use gate-level synthesis statistics to estimate FPGA resource usage:

```bash
rhdl gates --stats
```

While FPGA LUTs don't map 1:1 to gate counts, the relative numbers provide a useful complexity metric. A 4-input LUT can implement any single gate, so rough LUT estimates ≈ gate count / 2–3.

## Diagram Generation for Documentation

Generate circuit diagrams alongside your Verilog:

```bash
# Component-level block diagrams
rhdl diagram --all --mode component --format svg

# Gate-level schematics
rhdl diagram --all --mode gate --format svg

# Hierarchical view
rhdl diagram RHDL::HDL::CPU --level hierarchy --depth all --format svg
```

## Next Steps

- [Legacy IP Integration](../synthesis/legacy-ip-integration) — working with external Verilog
- [Verilog Export](../synthesis/verilog-export) — detailed export reference
- [Gate Synthesis](../synthesis/gate-synthesis) — gate-level netlist generation

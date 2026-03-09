---
title: Verilog Export
date: 2025-03-22
tags:
  - synthesis
  - verilog
---

Export your RHDL designs as synthesizable SystemVerilog for use with FPGA and ASIC toolchains.

## Generating Verilog

```bash
rhdl export verilog lib/counter.rb -o output/counter.v
```

## Output Quality

The exported Verilog is:

- **Synthesizable** — no simulation-only constructs
- **Inference-friendly** — patterns that FPGA tools recognize (block RAM, DSP, etc.)
- **Readable** — meaningful signal names preserved from source
- **Flat or hierarchical** — choose module structure with `--flatten` flag

## Example Output

```verilog
module Counter (
  input  wire        clk,
  input  wire        reset,
  input  wire        enable,
  output reg  [3:0]  count
);

  always @(posedge clk) begin
    if (reset)
      count <= 4'h0;
    else if (enable)
      count <= count + 4'h1;
  end

endmodule
```

## Integration with FPGA Tools

The exported Verilog works directly with:

- **Xilinx Vivado** — add to project sources
- **Intel Quartus** — import as design file
- **Yosys** — open-source synthesis
- **Synopsys Design Compiler** — ASIC synthesis

## Verification

After export, verify equivalence between the RHDL source and generated Verilog using co-simulation or formal equivalence checking.

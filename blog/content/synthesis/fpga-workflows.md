---
title: FPGA Workflows
date: 2025-03-24
tags:
  - synthesis
  - fpga
---

End-to-end workflow for taking an RHDL design from source to running on an FPGA.

## Workflow Overview

```
RHDL Source → Verilog Export → FPGA Synthesis → Bitstream → Program
```

## Step 1: Design and Verify

Write and test your design in RHDL using RSpec:

```bash
rspec spec/
rhdl simulate lib/top.rb --level rtl
```

## Step 2: Export Verilog

```bash
rhdl export verilog lib/top.rb -o fpga/rtl/top.v
```

## Step 3: Add Constraints

Create a constraints file for your target board (pin assignments, clock definitions):

```tcl
# Xilinx XDC example
set_property PACKAGE_PIN W5 [get_ports clk]
set_property IOSTANDARD LVCMOS33 [get_ports clk]
create_clock -period 20.000 [get_ports clk]
```

## Step 4: Synthesize and Implement

Run your FPGA vendor's toolchain:

```bash
vivado -mode batch -source build.tcl
```

## Step 5: Program

Flash the bitstream to your board and verify behavior matches simulation.

## Supported Boards

RHDL designs have been tested on:

- Xilinx Artix-7 (Basys 3, Arty)
- Xilinx Zynq (PYNQ, ZedBoard)
- Intel Cyclone V (DE10-Nano)
- Lattice iCE40 (via Yosys + nextpnr)

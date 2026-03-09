---
title: Memory Components
date: 2025-02-24
tags:
  - components
  - memory
---

RHDL provides memory primitives for building RAMs, ROMs, and register files with configurable depth and width.

## Synchronous RAM

```ruby
class RAM < RHDL::Component
  input  :clk
  input  :write_addr, :read_addr, width: 8
  input  :write_data, width: 8
  input  :write_enable
  output :read_data, width: 8

  memory :mem, depth: 256, width: 8

  sequential(clk: :posedge) do
    if write_enable
      mem[write_addr] <= write_data
    end
  end

  combinational do
    read_data <= mem[read_addr]  # async read
  end
end
```

## Key Properties

- **Synchronous write** — data is written on the clock edge
- **Asynchronous read** — data is available combinationally
- **Configurable** — set depth and width as parameters

## Register Files

For small memories with multiple read ports:

```ruby
class RegFile < RHDL::Component
  input  :clk
  input  :rs1, :rs2, :rd, width: 5
  input  :write_data, width: 32
  input  :write_enable
  output :read1, :read2, width: 32

  memory :regs, depth: 32, width: 32

  combinational do
    read1 <= regs[rs1]
    read2 <= regs[rs2]
  end

  sequential(clk: :posedge) do
    if write_enable
      regs[rd] <= write_data
    end
  end
end
```

## Synthesis Considerations

Memory components are mapped to block RAMs or distributed RAM depending on the target FPGA. The Verilog export generates inference-friendly patterns that FPGA synthesis tools recognize automatically.

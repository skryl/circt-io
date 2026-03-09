---
title: "Introducing RHDL: Hardware Design Meets Ruby"
date: 2025-01-15
tags:
  - announcement
  - rhdl
  - ruby
---

RHDL brings hardware description into the Ruby ecosystem. Instead of writing verbose Verilog or VHDL, you describe digital circuits using Ruby's expressive syntax — and get synthesizable output, simulation, and visualization for free.

## Why Ruby?

Hardware description languages haven't evolved much in decades. Verilog and VHDL remain the industry standards, but their syntax and tooling feel stuck in the 1990s. Meanwhile, software development has embraced expressive, high-level languages with rich ecosystems.

Ruby offers exactly what HDL design needs:

- **Metaprogramming** — define reusable hardware generators with clean DSL syntax
- **Rich ecosystem** — leverage gems, testing frameworks, and tooling
- **Readability** — hardware descriptions that read like specifications

## A Quick Example

Here's a simple 4-bit counter in RHDL:

```ruby
class Counter < RHDL::Module
  input  :clk
  input  :reset
  output :count, width: 4

  always posedge(:clk) do
    if reset
      count <= 0
    else
      count <= count + 1
    end
  end
end
```

This compiles to clean, synthesizable Verilog — ready for FPGA or ASIC flows.

## What's in the Toolchain?

RHDL isn't just a language — it's a complete hardware design toolkit:

- **Component library** — gates, flip-flops, registers, ALUs, and memory modules
- **Simulation** — RTL and gate-level simulation with a Rust backend
- **Verilog export** — generate synthesizable HDL from Ruby designs
- **Circuit diagrams** — multi-level visualization in SVG, PNG, and DOT formats
- **Gate synthesis** — automatic lowering to primitive gates

## Getting Started

Install the gem and start designing:

```bash
gem install rhdl
rhdl new my_design
```

Check out the [documentation](https://skryl.github.io/circt-io) for tutorials and API reference.

We're excited to see what the community builds. Hardware design should be accessible, enjoyable, and powerful — and RHDL aims to make that a reality.

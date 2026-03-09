---
title: Why Ruby for Hardware Design
date: 2025-01-22
tags:
  - introduction
  - ruby
  - dsl
---

Hardware description languages like Verilog and VHDL were designed decades ago. They get the job done, but they lack the expressiveness and tooling that modern software developers expect. Ruby offers a compelling alternative as a host language for hardware DSLs.

## The Case for Ruby

Ruby's metaprogramming capabilities make it uniquely suited for building domain-specific languages. With RHDL, hardware designers get:

- **Expressive syntax** — Ruby reads like pseudocode, reducing boilerplate
- **Metaprogramming** — generate parameterized designs programmatically
- **Testing with RSpec** — use a mature test framework for hardware verification
- **Package management** — leverage RubyGems for reusable component libraries
- **REPL-driven development** — explore designs interactively with IRB

## Comparison with Traditional HDLs

```ruby
# RHDL — a 4-bit counter
class Counter < RHDL::Component
  input  :clk, :reset, :enable
  output :count, width: 4

  sequential(clk: :posedge, reset: :sync) do
    if reset
      count <= 0
    elsif enable
      count <= count + 1
    end
  end
end
```

Compare with the equivalent Verilog — the RHDL version eliminates sensitivity lists, explicit always blocks, and repetitive type declarations while remaining clear about the hardware intent.

## Standing on CIRCT

The Ruby DSL is a frontend to the CIRCT compiler. Your Ruby code is lowered through multiple stages — RTL model, gate-level netlist, and finally CIRCT IR — before being handed off to backends for simulation, synthesis, or export. This means you get the productivity of Ruby with the rigor of a real compiler infrastructure.

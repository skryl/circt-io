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

## DSL That Reads Like Hardware

RHDL's DSL maps naturally to hardware concepts. Ports, behavior blocks, and sequential logic all have dedicated syntax:

```ruby
class Counter < RHDL::Sim::SequentialComponent
  parameter :width, default: 8

  input  :clk, :rst, :en
  output :q, width: :width

  sequential clock: :clk, reset: :rst, reset_values: { q: 0 } do
    q <= mux(en, q + lit(1, width: 8), q)
  end
end
```

Compare with the equivalent Verilog — the RHDL version eliminates sensitivity lists, explicit always blocks, and repetitive type declarations while remaining clear about the hardware intent.

## Parameterized Generators

Ruby's dynamic nature makes hardware generators trivial. Parameters can be simple values or computed expressions:

```ruby
class Multiplier < RHDL::Sim::Component
  parameter :width, default: 8
  parameter :product_width, default: -> { @width * 2 }

  input :a, width: :width
  input :b, width: :width
  output :product, width: :product_width

  behavior do
    product <= a * b
  end
end

# Instantiate with different widths
mult_8  = Multiplier.new('mult8',  width: 8)   # 8x8 → 16-bit product
mult_16 = Multiplier.new('mult16', width: 16)  # 16x16 → 32-bit product
```

## Testing with RSpec

Hardware verification uses the same RSpec framework Ruby developers already know:

```ruby
RSpec.describe Counter do
  let(:counter) { Counter.new('test', width: 8) }

  it "counts up when enabled" do
    counter.set_input(:en, 1)
    counter.set_input(:rst, 0)

    5.times do
      counter.set_input(:clk, 0); counter.propagate
      counter.set_input(:clk, 1); counter.propagate
    end

    expect(counter.get_output(:q)).to eq(5)
  end

  it "resets to zero" do
    counter.set_input(:rst, 1)
    counter.set_input(:clk, 0); counter.propagate
    counter.set_input(:clk, 1); counter.propagate

    expect(counter.get_output(:q)).to eq(0)
  end

  it "generates valid Verilog" do
    verilog = Counter.to_verilog
    expect(verilog).to include('module counter')
  end
end
```

## Full Compilation Pipeline

The Ruby DSL is a frontend to a multi-stage compilation pipeline. Your Ruby code is lowered through multiple stages — RTL model, gate-level netlist, and finally exportable IR — before being handed off to backends for [simulation](../simulation/rtl-simulation), [synthesis](../synthesis/gate-synthesis), or [Verilog export](../synthesis/verilog-export). This means you get the productivity of Ruby with the rigor of a real compiler infrastructure.

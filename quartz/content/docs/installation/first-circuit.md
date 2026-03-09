---
title: Your First Circuit
date: 2025-02-05
tags:
  - installation
  - tutorial
---

Build a simple circuit from scratch — your first complete RHDL design from source to simulation to Verilog export.

## A Clocked Register

We will build an 8-bit register with enable and reset, then simulate it and export to Verilog.

```ruby
class MyRegister < RHDL::Sim::SequentialComponent
  input :d, width: 8
  input :clk
  input :rst
  input :en
  output :q, width: 8

  sequential clock: :clk, reset: :rst, reset_values: { q: 0 } do
    q <= mux(en, d, q)  # Load when enabled, hold otherwise
  end
end
```

This component:
- Samples `d` on the rising edge of `clk` when `en` is high
- Holds its current value when `en` is low
- Resets `q` to 0 when `rst` is asserted

## Simulate It

Test the register interactively:

```ruby
reg = MyRegister.new("my_reg")

# Reset
reg.set_input(:rst, 1)
reg.set_input(:en, 0)
reg.set_input(:clk, 0); reg.propagate
reg.set_input(:clk, 1); reg.propagate
puts reg.get_output(:q)  # => 0

# Load a value
reg.set_input(:rst, 0)
reg.set_input(:en, 1)
reg.set_input(:d, 0x42)
reg.set_input(:clk, 0); reg.propagate
reg.set_input(:clk, 1); reg.propagate
puts reg.get_output(:q)  # => 66 (0x42)

# Hold (en=0, value should stay)
reg.set_input(:en, 0)
reg.set_input(:d, 0xFF)
reg.set_input(:clk, 0); reg.propagate
reg.set_input(:clk, 1); reg.propagate
puts reg.get_output(:q)  # => 66 (still 0x42)
```

## Test with RSpec

Write a proper test:

```ruby
# spec/my_register_spec.rb
RSpec.describe MyRegister do
  let(:reg) { MyRegister.new('test') }

  def clock!
    reg.set_input(:clk, 0); reg.propagate
    reg.set_input(:clk, 1); reg.propagate
  end

  it "loads data when enabled" do
    reg.set_input(:rst, 0)
    reg.set_input(:en, 1)
    reg.set_input(:d, 0x42)
    clock!
    expect(reg.get_output(:q)).to eq(0x42)
  end

  it "holds value when disabled" do
    reg.set_input(:rst, 0)
    reg.set_input(:en, 1)
    reg.set_input(:d, 0x42)
    clock!

    reg.set_input(:en, 0)
    reg.set_input(:d, 0xFF)
    clock!
    expect(reg.get_output(:q)).to eq(0x42)
  end

  it "resets to zero" do
    reg.set_input(:en, 1)
    reg.set_input(:d, 0x42)
    clock!

    reg.set_input(:rst, 1)
    clock!
    expect(reg.get_output(:q)).to eq(0)
  end
end
```

Run it:

```bash
rspec spec/my_register_spec.rb
```

## Debug with the TUI

Launch the interactive debugger to step through clock cycles and watch signals:

```bash
rhdl tui MyRegister --signals d,clk,rst,en,q --format hex
```

The TUI shows signal values and waveforms. Press `Space` to step one cycle, `r` to run continuously, and `q` to quit. See the [RTL Simulation guide](../simulation/rtl-simulation) for full debugger documentation.

## Export to Verilog

```bash
rhdl export --lang verilog --out ./output MyRegister
```

This generates clean, synthesizable Verilog:

```verilog
module my_register(
  input        clk,
  input        rst,
  input        en,
  input  [7:0] d,
  output [7:0] q
);
  reg [7:0] q_reg;

  always @(posedge clk) begin
    if (rst)
      q_reg <= 8'h00;
    else if (en)
      q_reg <= d;
  end

  assign q = q_reg;
endmodule
```

## A Hierarchical Design

Combine components using the Structure DSL:

```ruby
class TopLevel < RHDL::Sim::Component
  input :clk, :rst
  input :data, width: 8
  input :load, :count_en, :count_up
  output :reg_out, width: 8
  output :count_out, width: 8

  instance :reg, Register, width: 8
  instance :ctr, Counter, width: 8

  # Clock and reset to both sub-components
  port :clk => [[:reg, :clk], [:ctr, :clk]]
  port :rst => [[:reg, :rst], [:ctr, :rst]]

  # Register connections
  port :data => [:reg, :d]
  port :load => [:reg, :en]
  port [:reg, :q] => :reg_out

  # Counter connections
  port :count_en => [:ctr, :en]
  port :count_up => [:ctr, :up]
  port [:ctr, :q] => :count_out
end
```

## Next Steps

- [Ruby DSL Fundamentals](../basics/ruby-dsl-fundamentals) — complete DSL reference
- [Signals and Types](../basics/signals-and-types) — signal values, bit slicing, concatenation
- [Component Library](../components/combinational-logic) — explore the built-in components

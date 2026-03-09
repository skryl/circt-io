---
title: Your First Circuit
date: 2025-02-05
tags:
  - installation
  - tutorial
---

Build a simple LED blinker circuit from scratch — your first complete RHDL design from source to simulation.

## The Design

We will build a clock divider that blinks an LED at a visible rate. The design takes a fast clock input and produces a slow toggle output.

```ruby
class Blinker < RHDL::Component
  input  :clk, :reset
  output :led

  DIVIDE = 25_000_000  # 1 Hz at 50 MHz clock

  sequential(clk: :posedge, reset: :sync) do
    counter = signal(width: 25)

    if reset
      counter <= 0
      led <= 0
    elsif counter == DIVIDE - 1
      counter <= 0
      led <= ~led
    else
      counter <= counter + 1
    end
  end
end
```

## Simulate It

```ruby
# spec/blinker_spec.rb
RSpec.describe Blinker do
  it "toggles led after DIVIDE cycles" do
    dut = Blinker.new
    dut.reset!

    Blinker::DIVIDE.times { dut.tick! }
    expect(dut.led).to eq(1)
  end
end
```

Run the test:

```bash
rspec spec/blinker_spec.rb
```

## Export to Verilog

```bash
rhdl export verilog lib/blinker.rb -o output/blinker.v
```

## Next Steps

Now that you have a working design, explore the [Ruby DSL Fundamentals](../basics/ruby-dsl-fundamentals) to learn the full language.

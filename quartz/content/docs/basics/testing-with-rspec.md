---
title: Testing with RSpec
date: 2025-02-16
tags:
  - basics
  - testing
  - rspec
---

RHDL uses Ruby's RSpec framework for hardware verification. This gives you a mature, well-documented test framework with expressive matchers, shared contexts, and parallel execution.

## Basic Test Pattern

The fundamental pattern is: set inputs, propagate (or clock), check outputs.

```ruby
RSpec.describe RHDL::HDL::ALU do
  let(:alu) { RHDL::HDL::ALU.new('test', width: 8) }

  it "adds two numbers" do
    alu.set_input(:a, 10)
    alu.set_input(:b, 5)
    alu.set_input(:op, RHDL::HDL::ALU::OP_ADD)
    alu.set_input(:cin, 0)
    alu.propagate
    expect(alu.get_output(:result)).to eq(15)
  end
end
```

## Testing Combinational Components

Combinational components produce outputs immediately after `propagate`:

```ruby
RSpec.describe RHDL::HDL::Mux4 do
  let(:mux) { RHDL::HDL::Mux4.new(nil, width: 8) }

  it "selects the correct input" do
    mux.set_input(:a, 10)
    mux.set_input(:b, 20)
    mux.set_input(:c, 30)
    mux.set_input(:d, 40)

    (0..3).each do |sel|
      mux.set_input(:sel, sel)
      mux.propagate
      expect(mux.get_output(:y)).to eq([10, 20, 30, 40][sel])
    end
  end
end
```

## Testing Sequential Components

Sequential components require clock cycles. A helper method keeps tests clean:

```ruby
RSpec.describe RHDL::HDL::Counter do
  let(:counter) { RHDL::HDL::Counter.new(nil, width: 8) }

  def clock!
    counter.set_input(:clk, 0); counter.propagate
    counter.set_input(:clk, 1); counter.propagate
  end

  before do
    counter.set_input(:rst, 1)
    counter.set_input(:en, 0)
    counter.set_input(:up, 1)
    counter.set_input(:load, 0)
    clock!
    counter.set_input(:rst, 0)
  end

  it "counts up when enabled" do
    counter.set_input(:en, 1)
    5.times { clock! }
    expect(counter.get_output(:q)).to eq(5)
  end

  it "counts down when direction is reversed" do
    counter.set_input(:en, 1)
    counter.set_input(:load, 1)
    counter.set_input(:d, 10)
    clock!

    counter.set_input(:load, 0)
    counter.set_input(:up, 0)
    3.times { clock! }
    expect(counter.get_output(:q)).to eq(7)
  end

  it "holds value when disabled" do
    counter.set_input(:en, 1)
    5.times { clock! }

    counter.set_input(:en, 0)
    3.times { clock! }
    expect(counter.get_output(:q)).to eq(5)
  end
end
```

## Testing Memory Components

```ruby
RSpec.describe RHDL::HDL::RAM do
  let(:ram) { RHDL::HDL::RAM.new(nil, data_width: 8, addr_width: 8) }

  def clock!
    ram.set_input(:clk, 0); ram.propagate
    ram.set_input(:clk, 1); ram.propagate
  end

  it "writes and reads back data" do
    ram.set_input(:addr, 0x42)
    ram.set_input(:din, 0xAB)
    ram.set_input(:we, 1)
    clock!

    ram.set_input(:we, 0)
    ram.propagate
    expect(ram.get_output(:dout)).to eq(0xAB)
  end
end
```

## Testing Verilog Export

```ruby
RSpec.describe "Verilog export" do
  it "generates valid Verilog for ALU" do
    verilog = RHDL::HDL::ALU.to_verilog
    expect(verilog).to include('module alu')
    expect(verilog).to include('input')
    expect(verilog).to include('output')
  end

  it "generates complete hierarchy" do
    verilog = MyCPU.to_verilog_hierarchy
    expect(verilog).to include('module my_cpu')
    expect(verilog).to include('module alu')
  end
end
```

## Exhaustive Testing

For small components, test all possible inputs:

```ruby
RSpec.describe RHDL::HDL::FullAdder do
  let(:fa) { RHDL::HDL::FullAdder.new }

  it "produces correct sum and carry for all inputs" do
    [0, 1].repeated_permutation(3).each do |a, b, cin|
      fa.set_input(:a, a)
      fa.set_input(:b, b)
      fa.set_input(:cin, cin)
      fa.propagate

      expected_sum = (a + b + cin) & 1
      expected_cout = (a + b + cin) >> 1

      expect(fa.get_output(:sum)).to eq(expected_sum),
        "Failed for a=#{a}, b=#{b}, cin=#{cin}"
      expect(fa.get_output(:cout)).to eq(expected_cout),
        "Failed for a=#{a}, b=#{b}, cin=#{cin}"
    end
  end
end
```

## Test Organization

```
spec/
├── gates/
│   ├── and_gate_spec.rb
│   └── or_gate_spec.rb
├── sequential/
│   ├── register_spec.rb
│   └── counter_spec.rb
├── arithmetic/
│   └── alu_spec.rb
├── memory/
│   ├── ram_spec.rb
│   └── fifo_spec.rb
└── integration/
    └── cpu_spec.rb
```

## Tips

- **Use `let` for component instantiation** — avoids repetition and enables lazy evaluation
- **Extract `clock!` helpers** — DRY up sequential test boilerplate
- **Test edge cases** — overflow, underflow, zero, maximum values, division by zero
- **Test reset behavior** — verify components reset to known states
- **Use shared examples** — `shared_examples_for "a register"` for common register behavior across widths

## Next Steps

- [Combinational Logic](../components/combinational-logic) — component library reference
- [Sequential Logic](../components/sequential-logic) — flip-flops, registers, counters

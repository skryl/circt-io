---
title: Testing with RSpec
date: 2025-02-16
tags:
  - basics
  - testing
  - rspec
---

One of RHDL's biggest advantages is using Ruby's mature test ecosystem for hardware verification. Write testbenches with RSpec — the same framework Ruby developers already know.

## Basic Test Structure

```ruby
RSpec.describe Counter do
  let(:dut) { Counter.new }

  before { dut.reset! }

  it "starts at zero after reset" do
    expect(dut.count).to eq(0)
  end

  it "increments on each clock edge" do
    dut.enable = 1
    3.times { dut.tick! }
    expect(dut.count).to eq(3)
  end

  it "wraps around at max value" do
    dut.enable = 1
    16.times { dut.tick! }
    expect(dut.count).to eq(0)  # 4-bit counter wraps
  end
end
```

## Clock and Reset

- `dut.tick!` — advance one clock cycle
- `dut.reset!` — assert reset for one cycle
- `dut.tick!(n)` — advance n clock cycles

## Waveform Capture

Record signals over time for debugging:

```ruby
it "generates correct waveform" do
  trace = dut.capture(:clk, :count, :enable, cycles: 20)
  trace.save("counter_trace.vcd")
end
```

## Property-Based Testing

Combine RSpec with property-based testing gems for exhaustive verification:

```ruby
it "addition is commutative" do
  100.times do
    a, b = rand(256), rand(256)
    dut.a = a; dut.b = b; dut.tick!
    result_ab = dut.result

    dut.a = b; dut.b = a; dut.tick!
    expect(dut.result).to eq(result_ab)
  end
end
```

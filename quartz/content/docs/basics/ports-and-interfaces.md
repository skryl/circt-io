---
title: Ports and Interfaces
date: 2025-02-14
tags:
  - basics
  - vec
  - bundle
  - interfaces
---

Beyond simple ports, RHDL provides Vec (hardware arrays) and Bundle (aggregate interfaces) for structuring complex designs.

## Vec — Hardware Arrays

Vec creates arrays of hardware signals with hardware-indexed access.

### Declaration

```ruby
# Internal vec (array of wires)
vec :registers, count: 32, width: 64

# Input vec — creates data_in_0, data_in_1, etc.
input_vec :data_in, count: 4, width: 8

# Output vec
output_vec :data_out, count: 4, width: 8

# Parameterized
parameter :depth, default: 32
vec :memory, count: :depth, width: :width
```

### Hardware-Indexed Access

Reading a Vec with a hardware signal generates a mux tree for synthesis:

```ruby
class MyMux < RHDL::Sim::Component
  input_vec :data_in, count: 4, width: 8
  input :sel, width: 2
  output :result, width: 8

  behavior do
    result <= data_in[sel]   # Hardware-indexed read generates mux tree
  end
end
```

### Register File Example

```ruby
class RegisterFile < RHDL::Sim::Component
  parameter :depth, default: 32
  parameter :width, default: 32

  input :read_addr, width: 5
  input :write_addr, width: 5
  input :write_data, width: :width
  input :write_enable
  input :clk
  output :read_data, width: :width

  vec :regs, count: :depth, width: :width

  behavior do
    read_data <= regs[read_addr]
  end
end
```

### Vec Properties

```ruby
vec.name          # => :regs
vec.count         # => 32
vec.element_width # => 64
vec.total_width   # => 2048 (count * element_width)
vec.index_width   # => 5 (bits needed to index)

# Iteration
vec.each { |element| puts element.get }
vec.each_with_index { |element, i| ... }

# Bulk operations
values = vec.values
vec.set_values([0x11, 0x22, 0x33])
```

## Bundle — Aggregate Interfaces

Bundles group related signals into reusable interface types.

### Defining a Bundle

```ruby
class ValidBundle < RHDL::Sim::Bundle
  field :data, width: 8, direction: :output
  field :valid, width: 1, direction: :output
  field :ready, width: 1, direction: :input
end
```

### Using Bundles in Components

```ruby
class Producer < RHDL::Sim::Component
  input :clk
  input :data_in, width: 8
  input :enable
  output_bundle :out_port, ValidBundle

  behavior do
    out_port_data  <= data_in
    out_port_valid <= enable
  end
end

class Consumer < RHDL::Sim::Component
  input :clk
  input_bundle :in_port, ValidBundle
  output :data_out, width: 8

  behavior do
    data_out      <= in_port_data
    in_port_ready <= lit(1, width: 1)
  end
end
```

### Direction Flipping

- `input_bundle` — uses directions as defined in the Bundle class
- `output_bundle` — flips all directions (outputs become inputs and vice versa)

```ruby
# Original bundle: data is :output, ready is :input
# After output_bundle: data becomes :input, ready becomes :output

# Explicit flipping
input_bundle :flipped_port, ValidBundle, flipped: true
```

### AXI-Lite Interface Example

```ruby
class AxiLiteWrite < RHDL::Sim::Bundle
  field :awaddr,  width: 32, direction: :output
  field :awvalid, width: 1,  direction: :output
  field :awready, width: 1,  direction: :input
  field :wdata,   width: 32, direction: :output
  field :wvalid,  width: 1,  direction: :output
  field :wready,  width: 1,  direction: :input
end

class AxiMaster < RHDL::Sim::Component
  output_bundle :axi, AxiLiteWrite, flipped: false  # Producer

  behavior do
    axi_awaddr  <= lit(0x1000, width: 32)
    axi_awvalid <= lit(1, width: 1)
  end
end

class AxiSlave < RHDL::Sim::Component
  input_bundle :axi, AxiLiteWrite, flipped: true   # Consumer

  behavior do
    axi_awready <= lit(1, width: 1)
    axi_wready  <= lit(1, width: 1)
  end
end
```

## Structure DSL — Hierarchical Composition

The Structure DSL connects sub-components into larger designs.

### Instance Declaration

```ruby
instance :alu, ALU, width: 8
instance :pc, ProgramCounter, width: 16
instance :reg, Register, width: 8
```

### Port Connections

```ruby
# Signal to instance input
port :signal => [:instance, :port]

# Instance output to signal
port [:instance, :port] => :signal

# Instance to instance
port [:source, :out_port] => [:dest, :in_port]

# Fan-out (one signal to multiple inputs)
port :clk => [[:pc, :clk], [:acc, :clk], [:sp, :clk]]
```

### Complete Hierarchical Example

```ruby
class CPU < RHDL::Sim::Component
  input :clk, :rst
  input :instruction, width: 8
  input :mem_data_in, width: 8
  output :mem_addr, width: 16
  output :mem_data_out, width: 8

  wire :alu_result, width: 8
  wire :dec_alu_op, width: 4

  instance :decoder, InstructionDecoder
  instance :alu, ALU, width: 8
  instance :pc, ProgramCounter, width: 16
  instance :acc, Register, width: 8

  port :instruction => [:decoder, :instruction]
  port [:decoder, :alu_op] => :dec_alu_op

  port :dec_alu_op => [:alu, :op]
  port [:alu, :result] => :alu_result

  port :clk => [[:pc, :clk], [:acc, :clk]]
  port :rst => [[:pc, :rst], [:acc, :rst]]

  port :alu_result => [:acc, :d]
end
```

## Next Steps

- [Testing with RSpec](../basics/testing-with-rspec) — test patterns for hardware verification
- [Component Library](../components/combinational-logic) — explore built-in components

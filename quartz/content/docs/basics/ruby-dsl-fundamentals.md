---
title: Ruby DSL Fundamentals
date: 2025-02-10
tags:
  - basics
  - dsl
  - tutorial
---

RHDL provides several DSL modules for synthesizable hardware description. This guide covers the core language — ports, parameters, behavior blocks, and operators.

## DSL Modules

| DSL | Purpose |
|-----|---------|
| **Ports** | Input/output port definitions (included by default) |
| **Parameter** | Configurable component parameters (included by default) |
| **Behavior** | Combinational logic |
| **Sequential** | Clocked registers and state |
| **Structure** | Hierarchical component composition |
| **Memory** | RAM/ROM arrays |
| **StateMachine** | Finite state machines |
| **Vec** | Hardware signal arrays |
| **Bundle** | Grouped signal interfaces |

## Port Definitions

### Inputs

```ruby
input :name                      # 1-bit input
input :data, width: 8            # 8-bit input
input :addr, width: :addr_width  # Parameterized width
input :rst, default: 0           # Default value for unconnected port
```

### Outputs

```ruby
output :result                   # 1-bit output
output :data_out, width: 8       # 8-bit output
output :product, width: :width   # Parameterized width
```

### Internal Wires

```ruby
wire :intermediate, width: 8     # 8-bit internal signal
wire :carry                      # 1-bit internal signal
```

## Parameters

Simple parameters provide configurable values. Computed parameters use lambdas and can reference other parameters:

```ruby
class Multiplier < RHDL::Sim::Component
  parameter :width, default: 8
  parameter :product_width, default: -> { @width * 2 }
  parameter :addr_width, default: -> { Math.log2(@depth).ceil }

  input :a, width: :width
  input :b, width: :width
  output :product, width: :product_width

  behavior do
    product <= a * b
  end
end

# Instantiate with custom parameters
mult = Multiplier.new('mult', width: 16)
# @width = 16, @product_width = 32
```

## Behavior Blocks

The `behavior` block defines combinational logic for both simulation and synthesis.

### Operators

```ruby
behavior do
  # Bitwise
  and_result <= a & b       # AND
  or_result  <= a | b       # OR
  xor_result <= a ^ b       # XOR
  not_result <= ~a          # NOT

  # Arithmetic
  sum      <= a + b         # Addition
  diff     <= a - b         # Subtraction
  product  <= a * b         # Multiplication
  quotient <= a / b         # Division
  modulo   <= a % b         # Modulo

  # Shifts
  left  <= a << 2           # Shift left by constant
  right <= a >> 3           # Shift right by constant
  dyn   <= a << amt         # Dynamic shift (barrel shifter)

  # Comparisons (return 1-bit)
  eq <= a == b
  ne <= a != b
  lt <= a < b
  gt <= a > b

  # Compound conditions
  in_range <= (a >= 10) & (a <= 20)
end
```

### Conditional Selection

```ruby
behavior do
  # mux(condition, when_true, when_false)
  result <= mux(sel, a, b)

  # Nested mux for multi-way selection
  low    <= mux(sel[0], b, a)
  high   <= mux(sel[0], d, c)
  result <= mux(sel[1], high, low)
end
```

### Case Selection

```ruby
behavior do
  result <= case_select(op, {
    0 => a + b,    # ADD
    1 => a - b,    # SUB
    2 => a & b,    # AND
    3 => a | b,    # OR
    4 => a ^ b     # XOR
  }, default: 0)
end
```

### Literals with Explicit Width

Always use explicit widths for synthesis correctness:

```ruby
behavior do
  zero   <= lit(0, width: 8)
  max    <= lit(0xFF, width: 8)
  masked <= a & lit(0x0F, width: 8)
end
```

### Local Variables

```ruby
behavior do
  sum_full = local(:sum_full, a + b + cin, width: 9)
  result <= sum_full[7..0]
  cout   <= sum_full[8]
end
```

## Complete Example: ALU

```ruby
class ALU < RHDL::Sim::Component
  parameter :width, default: 8

  input :a, width: :width
  input :b, width: :width
  input :op, width: 4
  input :cin, default: 0

  output :result, width: :width
  output :cout, :zero, :negative, :overflow

  OP_ADD = 0; OP_SUB = 1; OP_AND = 2; OP_OR = 3
  OP_XOR = 4; OP_NOT = 5; OP_SHL = 6; OP_SHR = 7

  behavior do
    add_full = local(:add_full, a + b + cin, width: 9)
    sub_full = local(:sub_full, a - b, width: 9)

    result <= case_select(op, {
      OP_ADD => add_full[7..0],
      OP_SUB => sub_full[7..0],
      OP_AND => a & b,
      OP_OR  => a | b,
      OP_XOR => a ^ b,
      OP_NOT => ~a,
      OP_SHL => a << 1,
      OP_SHR => a >> 1
    }, default: add_full[7..0])

    cout     <= case_select(op, {
      OP_ADD => add_full[8],
      OP_SHL => a[7]
    }, default: lit(0, width: 1))

    zero     <= mux(result == lit(0, width: 8), lit(1, width: 1), lit(0, width: 1))
    negative <= result[7]
    overflow <= mux(op == OP_ADD,
      (a[7] == b[7]) & (result[7] != a[7]),
      lit(0, width: 1))
  end
end
```

## Best Practices

- **Use explicit widths** — `lit(0xFF, width: 8)` not bare `0xFF`
- **Prefer DSL over manual propagate** — behavior blocks are synthesizable, `propagate` overrides are simulation-only
- **Use local variables for clarity** — named intermediates make complex expressions readable
- **Test both simulation and synthesis** — verify behavior and check that generated Verilog is correct

## Next Steps

- [Signals and Types](../basics/signals-and-types) — bit slicing, concatenation, reduction operators
- [Ports and Interfaces](../basics/ports-and-interfaces) — Vec and Bundle for structured interfaces
- [Testing with RSpec](../basics/testing-with-rspec) — verification patterns

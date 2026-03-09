---
title: Signals and Types
date: 2025-02-12
tags:
  - basics
  - signals
  - types
---

RHDL signals carry digital values between components. This guide covers signal values, bit selection, concatenation, and reduction operators.

## Signal Values

Signals can represent:

- **Binary values** — `0` or `1` for single-bit, multi-bit integers for buses
- **Unknown (X)** — uninitialized or conflicting values
- **High-impedance (Z)** — disconnected or tri-state outputs

## Wires

Wires connect components and propagate signal changes:

```ruby
wire = RHDL::HDL::Wire.new("my_signal", width: 8)
wire.set(0x42)
wire.get      # => 66
wire.bit(0)   # => 0 (LSB)
wire.bit(6)   # => 1
```

Internal wires within a component are declared with the `wire` macro:

```ruby
wire :intermediate, width: 8
wire :carry
wire :alu_out, width: :width   # Parameterized width
```

## Bit Selection and Slicing

Extract individual bits or ranges within a behavior block:

```ruby
behavior do
  # Single bit
  lsb <= a[0]              # Least significant bit
  msb <= a[7]              # Most significant bit (8-bit signal)
  sign <= a[7]             # Sign bit for 8-bit signed

  # Range slicing
  low_nibble  <= a[3..0]   # Bits 0-3
  high_nibble <= a[7..4]   # Bits 4-7
  byte        <= word[15..8]  # Upper byte of 16-bit word
end
```

## Concatenation

Join signals together — the first argument becomes the high bits:

```ruby
behavior do
  # Combine two bytes into a 16-bit word
  combined <= high_byte.concat(low_byte)

  # Multiple concatenation
  word <= a.concat(b).concat(c).concat(d)

  # Shift left by 1 with zero fill
  shifted_left <= a[6..0].concat(lit(0, width: 1))

  # Shift right by 1 with zero fill
  shifted_right <= lit(0, width: 1).concat(a[7..1])
end
```

## Replication

Repeat a signal multiple times:

```ruby
behavior do
  # Sign extension: replicate sign bit
  sign_ext <= sign_bit.replicate(8)

  # Arithmetic shift right (preserve sign)
  sign = a[7]
  asr1 <= sign.concat(a[7..1])
  asr2 <= sign.replicate(2).concat(a[7..2])
end
```

## Reduction Operators

Reduce a multi-bit signal to a single bit:

```ruby
behavior do
  # OR reduction — is any bit set?
  non_zero <= reduce_or(error_flags)

  # AND reduction — are all bits set?
  all_ready <= reduce_and(ready_signals)

  # XOR reduction — parity
  parity <= reduce_xor(data)
end
```

## Literals

Always specify explicit widths for synthesis correctness:

```ruby
behavior do
  zero    <= lit(0, width: 8)
  max     <= lit(0xFF, width: 8)
  one_bit <= lit(1, width: 1)
  masked  <= a & lit(0x0F, width: 8)
end
```

## Port Width Query

Get the width of a port at elaboration time:

```ruby
behavior do
  w = port_width(:result)
  default_val <= lit(0, width: w)
end
```

## Complete Example: Bit Manipulation

```ruby
class BitManipulator < RHDL::Sim::Component
  input :data, width: 8
  input :op, width: 3
  output :result, width: 8
  output :flag

  behavior do
    reversed = data[0].concat(data[1]).concat(data[2]).concat(data[3])
               .concat(data[4]).concat(data[5]).concat(data[6]).concat(data[7])
    swapped  = data[3..0].concat(data[7..4])
    parity   = reduce_xor(data)

    result <= case_select(op, {
      0 => data[7..1].concat(lit(0, width: 1)),  # Shift right
      1 => data[6..0].concat(lit(0, width: 1)),  # Shift left
      2 => reversed,                               # Bit reverse
      3 => swapped,                                # Nibble swap
      4 => ~data                                   # Invert
    }, default: data)

    flag <= parity
  end
end
```

## Next Steps

- [Ports and Interfaces](../basics/ports-and-interfaces) — Vec and Bundle for structured types
- [Ruby DSL Fundamentals](../basics/ruby-dsl-fundamentals) — complete operator reference

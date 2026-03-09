---
title: Signals and Types
date: 2025-02-12
tags:
  - basics
  - types
---

Understanding RHDL's type system — how signals are declared, sized, and connected.

## Signal Declaration

Signals in RHDL are typed by their bit width:

```ruby
input  :data, width: 8    # 8-bit input
output :result, width: 16  # 16-bit output
signal :temp, width: 32    # 32-bit internal signal
```

Single-bit signals omit the width:

```ruby
input  :clk              # 1-bit clock
output :valid             # 1-bit flag
```

## Bit Slicing

Access individual bits or ranges:

```ruby
data[0]       # LSB
data[7]       # MSB
data[3..0]    # lower nibble
data[7..4]    # upper nibble
```

## Concatenation

Combine signals with array syntax:

```ruby
result <= [upper_byte, lower_byte]
```

## Constants

Use Ruby integers directly. RHDL infers the required width:

```ruby
output <= 0xFF
output <= 0b1010
output <= 42
```

## Type Coercion

Signals are automatically extended or truncated to match the target width on assignment. Explicit casting is available when you need control:

```ruby
narrow <= wide.truncate(8)
wide   <= narrow.extend(16)
wide   <= narrow.sign_extend(16)
```

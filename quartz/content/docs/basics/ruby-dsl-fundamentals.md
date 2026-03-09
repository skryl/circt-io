---
title: Ruby DSL Fundamentals
date: 2025-02-10
tags:
  - basics
  - ruby
  - dsl
---

The RHDL Ruby DSL lets you describe hardware using familiar Ruby syntax. This guide covers the core language constructs.

## Components

Every hardware module is a Ruby class that inherits from `RHDL::Component`:

```ruby
class MyModule < RHDL::Component
  input  :clk, :data_in, width: 8
  output :data_out, width: 8

  # ... logic here
end
```

## Combinational Logic

Use the `combinational` block for logic that depends only on current inputs:

```ruby
combinational do
  data_out <= data_in & 0xFF
end
```

## Sequential Logic

Use `sequential` for clocked logic with optional reset:

```ruby
sequential(clk: :posedge, reset: :sync) do
  if reset
    data_out <= 0
  else
    data_out <= data_in
  end
end
```

## Operators

RHDL supports all standard hardware operators:

| Operator | Description |
|----------|-------------|
| `&` | Bitwise AND |
| `\|` | Bitwise OR |
| `^` | Bitwise XOR |
| `~` | Bitwise NOT |
| `<<` | Shift left |
| `>>` | Shift right |
| `+`, `-`, `*` | Arithmetic |
| `==`, `!=`, `<`, `>` | Comparison |

## Signal Assignment

Use `<=` for signal assignment (non-blocking, like Verilog):

```ruby
output_signal <= input_a + input_b
```

## Parameterization

Ruby's standard features work naturally for parameterized designs:

```ruby
class Register < RHDL::Component
  def initialize(width: 8)
    input  :clk, :d, width: width
    output :q, width: width
  end

  sequential(clk: :posedge) do
    q <= d
  end
end
```

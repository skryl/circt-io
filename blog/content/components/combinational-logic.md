---
title: Combinational Logic
date: 2025-02-20
tags:
  - components
  - combinational
---

Combinational components produce outputs that depend only on current inputs — no clock, no state. They are the foundation of all digital design.

## Defining Combinational Logic

```ruby
class Adder < RHDL::Component
  input  :a, :b, width: 8
  output :sum, width: 9  # extra bit for carry

  combinational do
    sum <= a + b
  end
end
```

## Case Statements

Use Ruby's `case` for multiplexer-like behavior:

```ruby
class ALU < RHDL::Component
  input  :a, :b, width: 8
  input  :op, width: 3
  output :result, width: 8

  combinational do
    case op
    when 0b000 then result <= a + b
    when 0b001 then result <= a - b
    when 0b010 then result <= a & b
    when 0b011 then result <= a | b
    when 0b100 then result <= a ^ b
    when 0b101 then result <= ~a
    when 0b110 then result <= a << 1
    when 0b111 then result <= a >> 1
    end
  end
end
```

## Expression Trees

Combinational logic compiles to expression trees in CIRCT's `Comb` dialect — pure dataflow with no side effects. The compiler automatically optimizes common subexpressions and constant-folds where possible.

## Gate-Level Lowering

During synthesis, combinational expressions are lowered to primitive gates: AND, OR, XOR, NOT, and MUX. You can inspect the gate-level netlist to understand the hardware cost of your design.

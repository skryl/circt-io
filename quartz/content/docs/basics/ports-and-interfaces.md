---
title: Ports and Interfaces
date: 2025-02-14
tags:
  - basics
  - interfaces
---

How to define component boundaries and connect modules together in RHDL.

## Port Declaration

Ports define the external interface of a component:

```ruby
class ALU < RHDL::Component
  input  :a, width: 8
  input  :b, width: 8
  input  :op, width: 3
  output :result, width: 8
  output :carry
  output :zero
end
```

## Instantiation and Wiring

Connect components by instantiating them and wiring ports:

```ruby
class TopLevel < RHDL::Component
  input  :clk, :data_a, :data_b, width: 8
  output :sum, width: 8

  alu = ALU.new
  alu.a  <= data_a
  alu.b  <= data_b
  alu.op <= 0b000  # ADD
  sum    <= alu.result
end
```

## Port Groups

Group related ports for cleaner interfaces:

```ruby
class Memory < RHDL::Component
  port_group :read do
    input  :addr, width: 16
    input  :enable
    output :data, width: 8
  end

  port_group :write do
    input  :addr, width: 16
    input  :data, width: 8
    input  :enable
  end
end
```

## Hierarchical Design

RHDL supports arbitrary nesting. Each component is compiled independently and connected at the boundary, matching how real hardware is organized.

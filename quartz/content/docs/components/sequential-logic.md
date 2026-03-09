---
title: Sequential Logic
date: 2025-02-22
tags:
  - components
  - sequential
---

Sequential components introduce state — their outputs depend on both current inputs and past history. Clocks and registers are the key primitives.

## Registers

The `sequential` block creates clocked logic:

```ruby
class Register < RHDL::Component
  input  :clk, :d, width: 8
  output :q, width: 8

  sequential(clk: :posedge) do
    q <= d
  end
end
```

## Reset Strategies

RHDL supports synchronous and asynchronous reset:

```ruby
# Synchronous reset — reset sampled on clock edge
sequential(clk: :posedge, reset: :sync) do
  if reset
    q <= 0
  else
    q <= d
  end
end

# Asynchronous reset — reset takes effect immediately
sequential(clk: :posedge, reset: :async) do
  if reset
    q <= 0
  else
    q <= d
  end
end
```

## Enable Signals

Gate clock edges with an enable:

```ruby
sequential(clk: :posedge, reset: :sync) do
  if reset
    count <= 0
  elsif enable
    count <= count + 1
  end
end
```

## Clock Domains

Sequential logic is compiled to CIRCT's `Seq` dialect, which explicitly tracks clock domains. The compiler verifies that signals do not cross clock domains without proper synchronization.

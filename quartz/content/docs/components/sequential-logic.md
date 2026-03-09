---
title: Sequential Logic
date: 2025-02-22
tags:
  - components
  - sequential
  - registers
---

Sequential components store state and update on clock edges. RHDL provides flip-flops, registers, counters, and specialized components for CPU design.

## Flip-Flops

### D Flip-Flop

The fundamental storage element — captures input on the rising clock edge:

```ruby
dff = RHDL::HDL::DFlipFlop.new
dff.set_input(:d, 1)
dff.set_input(:en, 1)
dff.set_input(:rst, 0)

# Clock cycle
dff.set_input(:clk, 0); dff.propagate
dff.set_input(:clk, 1); dff.propagate
dff.get_output(:q)   # => 1
dff.get_output(:qn)  # => 0
```

| Port | Direction | Description |
|------|-----------|-------------|
| `d` | Input | Data input |
| `clk` | Input | Clock |
| `rst` | Input | Synchronous reset |
| `en` | Input | Enable |
| `q` | Output | Output |
| `qn` | Output | Inverted output |

### Other Flip-Flops

| Component | Behavior |
|-----------|----------|
| `TFlipFlop` | Toggle on T=1 |
| `JKFlipFlop` | J=K=0: hold, J=0 K=1: reset, J=1 K=0: set, J=K=1: toggle |
| `SRFlipFlop` | Set-Reset flip-flop |
| `SRLatch` | Level-sensitive SR latch |

### JK Flip-Flop DSL Implementation

```ruby
class JKFlipFlop < RHDL::Sim::SequentialComponent
  input :j, :k, :clk, :rst, :en
  output :q, :qn

  sequential clock: :clk, reset: :rst, reset_values: { q: 0 } do
    jk_result = mux(j,
      mux(k, ~q, lit(1, width: 1)),        # j=1: k ? toggle : set
      mux(k, lit(0, width: 1), q))         # j=0: k ? reset : hold
    q <= mux(en, jk_result, q)
  end

  behavior do
    qn <= ~q
  end
end
```

## Registers

### Basic Register

Multi-bit register with enable and synchronous reset:

```ruby
reg = RHDL::HDL::Register.new(nil, width: 8)
reg.set_input(:d, 0x42)
reg.set_input(:en, 1)
reg.set_input(:rst, 0)

reg.set_input(:clk, 0); reg.propagate
reg.set_input(:clk, 1); reg.propagate
reg.get_output(:q)  # => 0x42
```

| Port | Width | Description |
|------|-------|-------------|
| `d` | N | Data input |
| `clk` | 1 | Clock |
| `rst` | 1 | Synchronous reset |
| `en` | 1 | Enable |
| `q` | N | Output |

DSL implementation:

```ruby
class Register < RHDL::Sim::SequentialComponent
  parameter :width, default: 8

  input :d, width: :width
  input :clk, :rst, :en
  output :q, width: :width

  sequential clock: :clk, reset: :rst, reset_values: { q: 0 } do
    q <= mux(en, d, q)
  end
end
```

### Shift Register

Configurable serial/parallel shift register:

```ruby
class ShiftRegister < RHDL::Sim::SequentialComponent
  parameter :width, default: 8

  input :clk, :rst, :en, :load
  input :dir            # 0 = right, 1 = left
  input :d_in           # Serial input
  input :d, width: :width
  output :q, width: :width
  output :serial_out

  sequential clock: :clk, reset: :rst, reset_values: { q: 0 } do
    shift_right = d_in.concat(q[7..1])
    shift_left  = q[6..0].concat(d_in)
    shift_result = mux(dir, shift_left, shift_right)
    q <= mux(load, d, mux(en, shift_result, q))
  end

  behavior do
    serial_out <= mux(dir, q[7], q[0])
  end
end
```

## Counters

### Up/Down Counter

```ruby
counter = RHDL::HDL::Counter.new(nil, width: 4)
counter.set_input(:en, 1)
counter.set_input(:up, 1)
counter.set_input(:rst, 0)
counter.set_input(:load, 0)

10.times do
  counter.set_input(:clk, 0); counter.propagate
  counter.set_input(:clk, 1); counter.propagate
end
counter.get_output(:q)  # => 10
```

| Port | Width | Description |
|------|-------|-------------|
| `clk` | 1 | Clock |
| `rst` | 1 | Reset |
| `en` | 1 | Count enable |
| `up` | 1 | Direction (1=up, 0=down) |
| `load` | 1 | Load enable |
| `d` | N | Load value |
| `q` | N | Count output |
| `tc` | 1 | Terminal count |
| `zero` | 1 | Zero flag |

DSL implementation:

```ruby
class Counter < RHDL::Sim::SequentialComponent
  parameter :width, default: 8

  input :clk, :rst, :en, :up, :load
  input :d, width: :width
  output :q, width: :width
  output :tc, :zero

  sequential clock: :clk, reset: :rst, reset_values: { q: 0 } do
    count_up = q + lit(1, width: 8)
    count_down = q - lit(1, width: 8)
    count_result = mux(up, count_up, count_down)
    q <= mux(load, d, mux(en, count_result, q))
  end

  behavior do
    is_max  = (q == lit(0xFF, width: 8))
    is_zero = (q == lit(0, width: 8))
    tc   <= mux(up, is_max, is_zero)
    zero <= is_zero
  end
end
```

## CPU Components

### Program Counter

16-bit PC with load and configurable increment:

| Port | Width | Description |
|------|-------|-------------|
| `clk` | 1 | Clock |
| `rst` | 1 | Reset |
| `en` | 1 | Increment enable |
| `load` | 1 | Load enable |
| `d` | 16 | Load value |
| `inc` | 16 | Increment amount (default: 1) |
| `q` | 16 | PC value |

```ruby
class ProgramCounter < RHDL::Sim::SequentialComponent
  parameter :width, default: 16

  input :clk, :rst
  input :en, default: 0
  input :load, default: 0
  input :d, width: :width
  input :inc, width: :width, default: 1
  output :q, width: :width

  sequential clock: :clk, reset: :rst, reset_values: { q: 0 } do
    inc_val = mux(inc == lit(0, width: 16), lit(1, width: 16), inc)
    next_pc = (q + inc_val)[15..0]
    q <= mux(load, d, mux(en, next_pc, q))
  end
end
```

### Stack Pointer

8-bit stack pointer with push/pop and boundary detection:

| Port | Width | Description |
|------|-------|-------------|
| `clk` | 1 | Clock |
| `rst` | 1 | Reset (to 0xFF) |
| `push` | 1 | Decrement SP |
| `pop` | 1 | Increment SP |
| `q` | 8 | SP value |
| `empty` | 1 | Stack empty (SP=0xFF) |
| `full` | 1 | Stack full (SP=0) |

## Non-Blocking Assignment Semantics

Sequential components use Verilog-style non-blocking assignment:

1. **Sample Phase** — all sequential components sample their inputs simultaneously
2. **Update Phase** — all sequential components update their outputs simultaneously

This prevents race conditions in chains of registers. When you write `q <= mux(en, d, q)`, the right-hand side reads the *current* value of `q`, and the left-hand side updates the *next* value.

## Next Steps

- [Memory Components](../components/memory-components) — RAM, ROM, register files
- [State Machines](../components/state-machines) — finite state machine DSL
- [Combinational Logic](../components/combinational-logic) — gates, muxes, arithmetic

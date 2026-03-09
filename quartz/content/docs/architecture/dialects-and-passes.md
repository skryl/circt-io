---
title: Lowering Algorithms
date: 2025-03-03
tags:
  - architecture
  - lowering
  - synthesis
---

RHDL's gate-level backend lowers high-level DSL constructs to primitive gates through a series of well-defined algorithms. This page documents how arithmetic, multiplexers, decoders, and other constructs are decomposed.

## Arithmetic Lowering

### Ripple Carry Adder

An N-bit addition is built from a chain of full adders:

```
For each bit i from 0 to width-1:
  sum[i]     = a[i] XOR b[i] XOR carry[i]
  carry[i+1] = (a[i] AND b[i]) OR (carry[i] AND (a[i] XOR b[i]))

Overflow = (a[MSB] == b[MSB]) AND (sum[MSB] != a[MSB])
```

Each full adder uses 2 XOR gates, 2 AND gates, and 1 OR gate. An 8-bit adder uses 48 gates total.

### Array Multiplier

Multiplication is built from partial products summed with adders:

```
For each bit i of multiplier:
  partial_product[i] = multiplicand AND multiplier[i]

Sum all partial products using ripple adders:
  result = PP[0] + (PP[1] << 1) + (PP[2] << 2) + ...
```

An 8-bit multiplier generates ~800 gates.

### Restoring Divider

Division uses a restoring algorithm:

```
remainder = dividend
quotient = 0
For each bit i from MSB to 0:
  remainder = remainder - (divisor << i)
  if remainder >= 0:
    quotient[i] = 1
  else:
    remainder = remainder + (divisor << i)  # Restore
    quotient[i] = 0
```

### Subtractor

Subtraction is implemented as addition with two's complement:

```
diff = a + (~b) + 1
```

This reuses the adder infrastructure with an inverter on the second operand and carry-in set to 1.

## Multiplexer Lowering

### 2-to-1 MUX (Primitive)

The fundamental selection operation:

```
output = (sel AND when_true) OR (NOT sel AND when_false)
```

### 4-to-1 MUX (Two-Level Tree)

```
mux_01 = MUX(sel[0], in[0], in[1])
mux_23 = MUX(sel[0], in[2], in[3])
output = MUX(sel[1], mux_01, mux_23)
```

### 8-to-1 MUX (Three-Level Tree)

Same pattern extended with 3 select bits, resulting in 7 MUX primitives.

### N-to-1 MUX

For arbitrary N, a balanced binary tree of 2-to-1 MUXes is constructed. The tree depth is `ceil(log2(N))`.

## Decoder Lowering

### 2-to-4 Decoder

```
out[0] = NOT a[1] AND NOT a[0]
out[1] = NOT a[1] AND a[0]
out[2] = a[1] AND NOT a[0]
out[3] = a[1] AND a[0]
```

Each output is an AND of the appropriate combination of input bits and their complements.

### N-to-2^N Decoder

Generalized to N input bits with 2^N AND gates, each with N inputs.

## Comparison Lowering

Equality comparison is built from XNOR gates (one per bit) followed by an AND tree:

```
eq = AND(XNOR(a[0], b[0]), XNOR(a[1], b[1]), ..., XNOR(a[N-1], b[N-1]))
```

Less-than comparison chains from MSB to LSB, using the subtractor borrow output.

## Barrel Shifter Lowering

A barrel shifter is built from layers of multiplexers, one layer per bit of the shift amount:

```
Layer 0: shift by 0 or 1 (controlled by shift[0])
Layer 1: shift by 0 or 2 (controlled by shift[1])
Layer 2: shift by 0 or 4 (controlled by shift[2])
...
```

Each layer uses N MUX2 primitives. An 8-bit barrel shifter uses 3 layers = 24 MUX primitives.

## Topological Sort

Gates must be evaluated in dependency order. RHDL implements Kahn's algorithm:

1. Build dependency graph from gate inputs/outputs
2. Find gates with no unsatisfied dependencies
3. Add to schedule, mark outputs as available
4. Repeat until all gates scheduled
5. Detect cycles (indicates combinational loop error)

```ruby
schedule = RHDL::Codegen::Structure::Toposort.sort(ir)
# Returns array of gate indices in evaluation order
```

## ALU Lowering

The ALU combines all arithmetic and logic lowering. For each operation, the appropriate circuit is generated, and a MUX tree selects the active result based on the opcode:

```
add_result   = RippleCarryAdder(a, b)
sub_result   = Subtractor(a, b)
and_result   = BitwiseAnd(a, b)
or_result    = BitwiseOr(a, b)
...
result       = MuxN(op, [add_result, sub_result, and_result, or_result, ...])
```

A full 8-bit ALU with 16 operations generates ~400 gates.

## Next Steps

- [Gate-Level IR](../architecture/circt-ir-overview) — IR data structures and primitives
- [Compilation Pipeline](../architecture/compilation-pipeline) — end-to-end flow
- [Gate Synthesis](../synthesis/gate-synthesis) — practical synthesis usage

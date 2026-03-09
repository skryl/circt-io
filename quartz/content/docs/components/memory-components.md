---
title: Memory Components
date: 2025-02-24
tags:
  - components
  - memory
  - ram
  - rom
---

RHDL provides synthesizable memory components — RAM, ROM, dual-port RAM, register files, stacks, and FIFOs — along with a Memory DSL for declaring custom memories.

## Memory DSL

### Declaring Memory

```ruby
memory :name, depth: 256, width: 8
memory :rom, depth: 512, width: 8, initial: DATA_ARRAY
memory :readonly_mem, depth: 1024, width: 8, readonly: true
```

### Synchronous Write

```ruby
sync_write :memory, clock: :clk, enable: :we, addr: :addr, data: :din

# With compound enable expression
sync_write :mem, clock: :clk, enable: [:cs, :&, :we], addr: :addr, data: :din
```

### Read Operations

```ruby
# Asynchronous read (combinational)
async_read :output, from: :memory, addr: :addr

# Synchronous read (registered)
sync_read :output, from: :memory, clock: :clk, addr: :addr
```

## RAM

Single-port RAM with synchronous write and asynchronous read:

```ruby
ram = RHDL::HDL::RAM.new(nil, data_width: 8, addr_width: 8)

# Write
ram.set_input(:addr, 0x42)
ram.set_input(:din, 0xAB)
ram.set_input(:we, 1)
ram.set_input(:clk, 0); ram.propagate
ram.set_input(:clk, 1); ram.propagate

# Read
ram.set_input(:we, 0)
ram.propagate
ram.get_output(:dout)  # => 0xAB
```

| Port | Direction | Width | Description |
|------|-----------|-------|-------------|
| `clk` | Input | 1 | Clock |
| `we` | Input | 1 | Write enable |
| `addr` | Input | addr_width | Address |
| `din` | Input | data_width | Data in |
| `dout` | Output | data_width | Data out (async read) |

Direct access methods for simulation:
- `read_mem(addr)` — read memory directly
- `write_mem(addr, data)` — write memory directly
- `load_program(program, start_addr)` — load a byte array

### Custom RAM with Memory DSL

```ruby
class RAM256x8 < RHDL::Sim::Component
  include RHDL::DSL::Memory

  input :clk, :we
  input :addr, width: 8
  input :din, width: 8
  output :dout, width: 8

  memory :mem, depth: 256, width: 8

  sync_write :mem, clock: :clk, enable: :we, addr: :addr, data: :din
  async_read :dout, from: :mem, addr: :addr
end
```

## Dual-Port RAM

Separate read and write ports (or two read/write ports):

```ruby
class DualPortRAM < RHDL::Sim::Component
  include RHDL::DSL::Memory

  input :clk
  input :we_a, :we_b
  input :addr_a, :addr_b, width: 8
  input :din_a, :din_b, width: 8
  output :dout_a, :dout_b, width: 8

  memory :mem, depth: 256, width: 8

  sync_write :mem, clock: :clk, enable: :we_a, addr: :addr_a, data: :din_a
  sync_write :mem, clock: :clk, enable: :we_b, addr: :addr_b, data: :din_b
  async_read :dout_a, from: :mem, addr: :addr_a
  async_read :dout_b, from: :mem, addr: :addr_b
end
```

## ROM

Read-only memory initialized with constant data:

```ruby
contents = [0x00, 0x11, 0x22, 0x33]
rom = RHDL::HDL::ROM.new(nil, data_width: 8, addr_width: 8, contents: contents)
rom.set_input(:addr, 2)
rom.set_input(:en, 1)
rom.propagate
rom.get_output(:dout)  # => 0x22
```

### Custom ROM with Initial Data

```ruby
class CharacterROM < RHDL::Sim::Component
  include RHDL::DSL::Memory

  CHARACTER_DATA = [
    0b01110, 0b10001, 0b10001, 0b11111,  # 'A' pattern
    # ... more data
  ].freeze

  input :addr, width: 9
  output :dout, width: 5

  memory :rom, depth: 512, width: 5, initial: CHARACTER_DATA
  async_read :dout, from: :rom, addr: :addr
end
```

## Register File

Multi-register file with 2 read ports and 1 write port — the standard building block for CPU register banks:

| Port | Direction | Width | Description |
|------|-----------|-------|-------------|
| `clk` | Input | 1 | Clock |
| `we` | Input | 1 | Write enable |
| `waddr` | Input | log2(N) | Write address |
| `raddr1` | Input | log2(N) | Read address 1 |
| `raddr2` | Input | log2(N) | Read address 2 |
| `wdata` | Input | data_width | Write data |
| `rdata1` | Output | data_width | Read data 1 |
| `rdata2` | Output | data_width | Read data 2 |

## Stack

LIFO (last-in, first-out) stack with push and pop operations.

## FIFO

First-in, first-out queue with flow control signals:

| Port | Direction | Width | Description |
|------|-----------|-------|-------------|
| `clk` | Input | 1 | Clock |
| `rst` | Input | 1 | Reset |
| `wr_en` | Input | 1 | Write enable |
| `rd_en` | Input | 1 | Read enable |
| `din` | Input | data_width | Data in |
| `dout` | Output | data_width | Data out |
| `empty` | Output | 1 | FIFO empty |
| `full` | Output | 1 | FIFO full |
| `count` | Output | addr_width+1 | Element count |

## Lookup Tables

The Memory DSL also supports lookup tables for instruction decoding:

```ruby
lookup_table :decode do |t|
  t.input :opcode, width: 8
  t.output :addr_mode, width: 4
  t.output :alu_op, width: 4
  t.output :cycles, width: 3

  t.entry 0x00, addr_mode: 0, alu_op: 0, cycles: 7    # BRK
  t.entry 0x69, addr_mode: 1, alu_op: 0, cycles: 2    # ADC imm
  t.entry 0xA9, addr_mode: 1, alu_op: 13, cycles: 2   # LDA imm
  t.entry 0xA5, addr_mode: 2, alu_op: 13, cycles: 3   # LDA zp

  t.default addr_mode: 0xF, alu_op: 0xF, cycles: 0
end
```

## Memory in Behavior Blocks

Use `mem_read_expr` for computed memory addresses inside behavior blocks:

```ruby
behavior do
  dout <= mem_read_expr(:data, sp - lit(1, width: 5), width: 8)
end
```

## Next Steps

- [State Machines](../components/state-machines) — finite state machine DSL
- [Sequential Logic](../components/sequential-logic) — flip-flops, registers, counters
- [RTL Simulation](../simulation/rtl-simulation) — simulating memory-based designs

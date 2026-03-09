---
title: RTL Simulation
date: 2025-03-10
tags:
  - simulation
  - debugging
  - tui
---

RHDL's Ruby behavioral simulator runs your designs directly as Ruby code. It supports signal probing, waveform capture, breakpoints, watchpoints, and an interactive terminal UI (TUI) for step-by-step debugging.

## Basic Simulation

The fundamental simulation flow: create a component, set inputs, propagate, read outputs.

```ruby
alu = RHDL::HDL::ALU.new('alu', width: 8)
alu.set_input(:a, 10)
alu.set_input(:b, 5)
alu.set_input(:op, RHDL::HDL::ALU::OP_ADD)
alu.propagate
result = alu.get_output(:result)  # => 15
```

### Sequential Simulation

For clocked components, toggle the clock signal:

```ruby
reg = RHDL::HDL::Register.new('reg', width: 8)
reg.set_input(:d, 0x42)
reg.set_input(:en, 1)
reg.set_input(:rst, 0)

# Clock cycle (low → high)
reg.set_input(:clk, 0); reg.propagate
reg.set_input(:clk, 1); reg.propagate
reg.get_output(:q)  # => 0x42
```

### Simulator Class

For multi-component designs, the `Simulator` manages components and clocks:

```ruby
sim = RHDL::HDL::Simulator.new

alu = RHDL::HDL::ALU.new("alu", width: 8)
reg = RHDL::HDL::Register.new("reg", width: 8)
sim.add_component(alu)
sim.add_component(reg)

clk = RHDL::HDL::Clock.new("clk")
sim.add_clock(clk)

sim.run(100)  # Run for 100 cycles
```

## Signal Probing

The `SignalProbe` class records signal transitions over time:

```ruby
wire = RHDL::HDL::Wire.new("data_bus", width: 8)
probe = RHDL::HDL::SignalProbe.new(wire, name: "bus_probe")

# Signal changes are automatically recorded
wire.set(0x42)
wire.set(0xFF)

# Access recorded history
probe.history.each do |time, value|
  puts "At #{time}: 0x#{value.to_s(16)}"
end

# Generate ASCII waveform
puts probe.to_waveform(width: 60)
```

### Waveform Capture

Manage multiple probes and export to VCD format:

```ruby
capture = RHDL::HDL::WaveformCapture.new
capture.add_probe(clock_wire, name: "clk")
capture.add_probe(data_wire, name: "data")

capture.start_recording
# ... run simulation ...
capture.stop_recording

# Display text-based waveforms
puts capture.display(width: 80)

# Export VCD for GTKWave
File.write("simulation.vcd", capture.to_vcd(timescale: "1ns"))
```

## Breakpoints and Watchpoints

### Breakpoints

Pause simulation when a condition is met:

```ruby
sim = RHDL::HDL::DebugSimulator.new

# Break at a specific cycle
bp = sim.add_breakpoint { |s| s.current_cycle >= 100 }

# Check status
bp.hit_count   # Number of times triggered
bp.enabled     # Is it active?

# Control
bp.disable!
bp.enable!
sim.remove_breakpoint(bp.id)
```

### Watchpoints

Trigger on signal changes:

```ruby
# Break when signal changes
sim.watch(wire, type: :change)

# Break when signal equals a value
sim.watch(wire, type: :equals, value: 0x42)

# Break on rising/falling edge
sim.watch(clock_wire, type: :rising_edge)
sim.watch(clock_wire, type: :falling_edge)

# Break with callback
sim.watch(wire, type: :equals, value: 0xFF) do |simulator|
  puts "Signal reached maximum!"
end
```

## Interactive TUI Debugger

Launch the TUI from the command line:

```bash
rhdl tui sequential/counter
rhdl tui arithmetic/alu_8bit --signals a,b,result --format hex
```

### TUI Layout

```
┌─────────── Signals ──────────┐┌─────────── Waveform ──────────┐
│ counter.clk    HIGH          ││ clk │▀▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄│
│ counter.q      0x2A (42)     ││ q   │════╳════╳════╳════│
│ counter.zero   LOW           ││ zero│▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄│
└──────────────────────────────┘└────────────────────────────────┘
┌─────────── Console ──────────┐┌──────── Breakpoints ──────────┐
│ Simulation started           ││ ● #1 counter.q changes        │
│ Stepped to cycle 42          ││ ○ #2 cycle == 100             │
└──────────────────────────────┘└────────────────────────────────┘
 ▶ RUNNING │ T:42 C:42                    h:Help q:Quit Space:Step
```

### Keyboard Controls

| Key | Action |
|-----|--------|
| `Space` | Step one cycle |
| `n` | Step half cycle |
| `r` | Run continuously |
| `s` | Stop/pause |
| `c` | Continue until breakpoint |
| `R` | Reset simulation |
| `w` | Add watchpoint |
| `b` | Add breakpoint |
| `j`/`k` or arrows | Scroll signals |
| `:` | Command mode |
| `h`/`?` | Help |
| `q` | Quit |

### Command Mode

Press `:` to enter command mode:

| Command | Description |
|---------|-------------|
| `run [n]` | Run n cycles |
| `step` | Single step |
| `watch <signal> [type]` | Add watchpoint (change, equals, rising_edge, falling_edge) |
| `break [cycle]` | Add breakpoint at cycle |
| `set <signal> <value>` | Set signal value (supports `0x`, `0b`, `0o`) |
| `print <signal>` | Print signal value |
| `list` | List all signals |
| `export <file>` | Export VCD waveform |
| `delete <id>` | Delete breakpoint |
| `clear [breaks|waves|log]` | Clear data |

## VCD Export

Export waveforms to VCD format for viewing in GTKWave:

```ruby
sim.run(100)
File.write("simulation.vcd", sim.waveform.to_vcd(timescale: "1ns"))
```

```bash
# Install GTKWave
apt-get install gtkwave  # Ubuntu/Debian
brew install gtkwave     # macOS

# Open waveform
gtkwave simulation.vcd
```

## Complete Debug Session

```ruby
sim = RHDL::HDL::DebugSimulator.new
clock = RHDL::HDL::Clock.new("clk")
counter = RHDL::HDL::Counter.new("cnt", width: 8)

sim.add_clock(clock)
sim.add_component(counter)
RHDL::HDL::SimComponent.connect(clock, counter.inputs[:clk])

counter.set_input(:rst, 0)
counter.set_input(:en, 1)
counter.set_input(:up, 1)
counter.set_input(:load, 0)

# Add probes
sim.probe(counter, :q)
sim.probe(counter, :zero)

# Watch for value 50
sim.watch(counter.outputs[:q], type: :equals, value: 50) do |s|
  puts "Halfway!"
end

# Break at cycle 100
sim.add_breakpoint { |s| s.current_cycle >= 100 }
sim.on_break = -> (s, bp) { s.pause }

sim.run(200)
File.write("counter.vcd", sim.waveform.to_vcd)
```

## Next Steps

- [Gate-Level Simulation](../simulation/gate-level-simulation) — simulating at the gate level
- [Browser Simulation](../simulation/browser-simulation) — WASM-based web simulator
- [Performance Tuning](../simulation/performance-tuning) — benchmarks and backend selection

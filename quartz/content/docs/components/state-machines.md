---
title: State Machines
date: 2025-02-26
tags:
  - components
  - state-machines
  - fsm
---

RHDL provides a declarative State Machine DSL for building finite state machines. Define states, outputs, and transitions — RHDL handles the encoding and synthesis.

## Basic Syntax

```ruby
state_machine clock: :clk, reset: :rst do
  state :STATE_NAME, value: 0 do
    output signal: value
    transition to: :NEXT_STATE, when_cond: condition
  end

  initial_state :START_STATE
  output_state :state_output
end
```

## Transition Types

```ruby
# Signal-based — transitions when signal equals 1
transition to: :NEXT_STATE, when_cond: :input_signal

# Proc-based — arbitrary condition
transition to: :NEXT_STATE, when_cond: proc { in_val(:counter) > 5 }

# Delayed — after N clock cycles
transition to: :NEXT_STATE, after: 3

# Unconditional — always transitions next cycle
transition to: :NEXT_STATE
```

## Traffic Light Example

A complete traffic light controller with sensor input and timed transitions:

```ruby
class TrafficLight < RHDL::Sim::SequentialComponent
  include RHDL::DSL::StateMachine

  input :clk
  input :rst
  input :sensor
  output :red
  output :yellow
  output :green
  output :state, width: 2

  state_machine clock: :clk, reset: :rst do
    state :RED, value: 0 do
      output red: 1, yellow: 0, green: 0
      transition to: :GREEN, when_cond: :sensor
    end

    state :YELLOW, value: 1 do
      output red: 0, yellow: 1, green: 0
      transition to: :RED, after: 3
    end

    state :GREEN, value: 2 do
      output red: 0, yellow: 0, green: 1
      transition to: :YELLOW, when_cond: proc { in_val(:sensor) == 0 }
    end

    initial_state :RED
    output_state :state
  end
end
```

### How It Works

1. Starts in `RED` state on reset
2. Transitions to `GREEN` when the sensor detects a car
3. Transitions to `YELLOW` when the sensor no longer detects a car
4. Stays in `YELLOW` for 3 clock cycles, then returns to `RED`

### Testing the Traffic Light

```ruby
RSpec.describe TrafficLight do
  let(:tl) { TrafficLight.new('test') }

  def clock!
    tl.set_input(:clk, 0); tl.propagate
    tl.set_input(:clk, 1); tl.propagate
  end

  before do
    tl.set_input(:rst, 1)
    tl.set_input(:sensor, 0)
    clock!
    tl.set_input(:rst, 0)
  end

  it "starts in RED" do
    expect(tl.get_output(:red)).to eq(1)
    expect(tl.get_output(:green)).to eq(0)
  end

  it "goes GREEN when sensor activates" do
    tl.set_input(:sensor, 1)
    clock!
    expect(tl.get_output(:green)).to eq(1)
  end

  it "goes YELLOW then RED when sensor deactivates" do
    tl.set_input(:sensor, 1)
    clock!  # Now GREEN

    tl.set_input(:sensor, 0)
    clock!  # Now YELLOW

    3.times { clock! }  # Wait 3 cycles
    expect(tl.get_output(:red)).to eq(1)
  end
end
```

## State Machine Patterns

### Moore Machine

Outputs depend only on current state (as in the traffic light above). All output values are specified in the `state` block.

### Mealy-Style Outputs

For outputs that depend on both state and inputs, combine the state machine DSL with behavior blocks:

```ruby
class Protocol < RHDL::Sim::SequentialComponent
  include RHDL::DSL::StateMachine

  input :clk, :rst, :request, :data_valid
  output :ack, :busy
  output :state, width: 2

  state_machine clock: :clk, reset: :rst do
    state :IDLE, value: 0 do
      output busy: 0
      transition to: :ACTIVE, when_cond: :request
    end

    state :ACTIVE, value: 1 do
      output busy: 1
      transition to: :DONE, when_cond: :data_valid
    end

    state :DONE, value: 2 do
      output busy: 0
      transition to: :IDLE
    end

    initial_state :IDLE
    output_state :state
  end

  # Mealy output — depends on state AND input
  behavior do
    ack <= mux((state == lit(1, width: 2)) & data_valid,
               lit(1, width: 1),
               lit(0, width: 1))
  end
end
```

### Multi-State Counter

Using `after:` for timed sequences:

```ruby
state_machine clock: :clk, reset: :rst do
  state :INIT, value: 0 do
    output led: 0
    transition to: :BLINK_ON, after: 10
  end

  state :BLINK_ON, value: 1 do
    output led: 1
    transition to: :BLINK_OFF, after: 5
  end

  state :BLINK_OFF, value: 2 do
    output led: 0
    transition to: :BLINK_ON, after: 5
  end

  initial_state :INIT
  output_state :fsm_state
end
```

## Generated Verilog

The state machine DSL generates clean Verilog with explicit state encoding:

```verilog
module traffic_light(
  input        clk,
  input        rst,
  input        sensor,
  output       red,
  output       yellow,
  output       green,
  output [1:0] state
);
  reg [1:0] state_reg;
  localparam RED    = 2'd0;
  localparam YELLOW = 2'd1;
  localparam GREEN  = 2'd2;

  always @(posedge clk) begin
    if (rst) begin
      state_reg <= RED;
    end else begin
      case (state_reg)
        RED:    if (sensor) state_reg <= GREEN;
        YELLOW: /* timed transition logic */
        GREEN:  if (!sensor) state_reg <= YELLOW;
      endcase
    end
  end

  assign red    = (state_reg == RED);
  assign yellow = (state_reg == YELLOW);
  assign green  = (state_reg == GREEN);
  assign state  = state_reg;
endmodule
```

## Next Steps

- [Combinational Logic](../components/combinational-logic) — gates, muxes, arithmetic
- [RTL Simulation](../simulation/rtl-simulation) — simulating state machines
- [Gate Synthesis](../synthesis/gate-synthesis) — synthesizing state machines to gates

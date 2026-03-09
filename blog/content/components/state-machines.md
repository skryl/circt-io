---
title: State Machines
date: 2025-02-26
tags:
  - components
  - fsm
---

Finite state machines (FSMs) are central to control logic. RHDL provides a dedicated syntax for defining states, transitions, and output logic.

## Defining a State Machine

```ruby
class TrafficLight < RHDL::Component
  input  :clk, :reset, :sensor
  output :red, :yellow, :green

  state_machine(clk: :posedge, reset: :sync) do
    state :RED do
      red <= 1; yellow <= 0; green <= 0
      transition_to :GREEN, after: 30, when: sensor
    end

    state :GREEN do
      red <= 0; yellow <= 0; green <= 1
      transition_to :YELLOW, after: 20
    end

    state :YELLOW do
      red <= 0; yellow <= 1; green <= 0
      transition_to :RED, after: 5
    end

    initial_state :RED
  end
end
```

## Features

- **Timed transitions** — `after: N` counts clock cycles automatically
- **Conditional transitions** — `when:` guards on signal values
- **Output logic** — assign outputs directly in state blocks
- **Reset state** — `initial_state` defines the reset target

## Encoding

The compiler automatically selects state encoding (one-hot, binary, or gray code) based on the number of states and target constraints. You can override this with explicit encoding hints.

## Visualization

State machines can be exported as DOT graphs for documentation:

```bash
rhdl diagram lib/traffic_light.rb --format dot --level fsm
```

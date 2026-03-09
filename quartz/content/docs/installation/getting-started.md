---
title: Getting Started
date: 2025-02-01
tags:
  - installation
  - quickstart
---

Get RHDL installed on your system. This guide covers the minimum setup needed to design, simulate, and export your first hardware circuit.

## Prerequisites

- **Ruby** 3.1 or later
- **Bundler** gem for dependency management
- **Git** for version control

## Install RHDL

```bash
gem install rhdl
```

Or add it to your project's Gemfile:

```ruby
gem 'rhdl'
```

Then run:

```bash
bundle install
```

## Verify the Installation

```bash
rhdl --help
```

You should see the available commands:

| Command | Description |
|---------|-------------|
| `tui` | Launch interactive TUI debugger |
| `diagram` | Generate circuit diagrams |
| `export` | Export components to Verilog |
| `gates` | Gate-level synthesis |
| `apple2` | Apple II emulator and ROM tools |

## Quick Smoke Test

Create a simple AND gate and simulate it in IRB:

```ruby
require 'rhdl'

and_gate = RHDL::HDL::AndGate.new("my_and")
and_gate.set_input(:a0, 1)
and_gate.set_input(:a1, 1)
and_gate.propagate
puts and_gate.get_output(:y)  # => 1
```

## List Available Components

RHDL ships with a full library of pre-built components. To see them all:

```bash
rhdl tui --list
```

This lists components across all categories — gates, sequential, arithmetic, combinational, memory, and CPU.

## Next Steps

- [Development Environment Setup](../installation/dev-environment) — configure your editor, toolchain, and project structure
- [Your First Circuit](../installation/first-circuit) — build a working design from scratch

---
title: Legacy IP Integration
date: 2025-03-26
tags:
  - synthesis
  - verilog
  - integration
---

Integrate existing Verilog and VHDL IP into RHDL projects — no need to rewrite working designs.

## Importing Verilog

```bash
rhdl import verilog vendor/uart.v -o lib/vendor/uart.rb
```

The importer parses Verilog modules and generates RHDL wrapper components with matching port signatures.

## Using Imported Modules

```ruby
class System < RHDL::Component
  input  :clk, :reset
  input  :rx
  output :tx

  uart = VendorUART.new  # imported Verilog module
  uart.clk   <= clk
  uart.reset <= reset
  uart.rx    <= rx
  tx         <= uart.tx
end
```

## Mixed-Language Simulation

CIRCT IR provides a common representation for both RHDL and imported Verilog. The simulator treats them uniformly — no co-simulation overhead.

## Supported Constructs

The Verilog importer handles:

- Module declarations with ports
- Always blocks (combinational and sequential)
- Continuous assignments
- Parameter definitions
- Basic generate statements

Unsupported constructs generate warnings with fallback to black-box instantiation.

## Incremental Migration

Start by wrapping existing Verilog IP, then gradually rewrite modules in RHDL as needed. The CIRCT IR lets both representations coexist in the same project without friction.

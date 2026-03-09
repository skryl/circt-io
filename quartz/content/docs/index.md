---
title: Documentation
---

Tutorials, guides, and reference for the CIRCT toolchain and hardware design with Ruby.

<style>
.topics-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  margin-top: 2rem;
}
@media (max-width: 800px) {
  .topics-grid {
    grid-template-columns: 1fr;
  }
}
.topic-card {
  border: 1px solid rgba(58, 106, 58, 0.2);
  padding: 1.25rem;
  background: rgba(58, 106, 58, 0.06);
}
:root[saved-theme="light"] .topic-card {
  background: rgba(58, 106, 58, 0.04);
  border-color: rgba(58, 106, 58, 0.15);
}
.topic-card h3 {
  margin: 0 0 0.25rem 0;
  font-size: 0.85rem;
  letter-spacing: 0.1em;
}
.topic-card h3 a {
  text-decoration: none;
}
.topic-card p.topic-desc {
  font-size: 0.7rem;
  opacity: 0.6;
  margin: 0 0 0.75rem 0;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.topic-card ul {
  list-style: none;
  padding: 0;
  margin: 0;
}
.topic-card ul li {
  padding: 0.2rem 0;
  font-size: 0.8rem;
}
.topic-card ul li::before {
  content: "› ";
  color: #cc342d;
  font-weight: bold;
}
</style>

<div class="topics-grid">

<div class="topic-card">
<h3><a href="docs/introduction/">Introduction</a></h3>
<p class="topic-desc">What CIRCT is and why it matters</p>
<ul>
<li><a href="docs/introduction/what-is-circt">What is CIRCT</a></li>
<li><a href="docs/introduction/why-ruby-for-hardware">Why Ruby for Hardware Design</a></li>
<li><a href="docs/introduction/circt-vs-traditional-hdl">CIRCT vs Traditional HDLs</a></li>
</ul>
</div>

<div class="topic-card">
<h3><a href="docs/installation/">Installation</a></h3>
<p class="topic-desc">Get up and running</p>
<ul>
<li><a href="docs/installation/getting-started">Getting Started</a></li>
<li><a href="docs/installation/dev-environment">Development Environment Setup</a></li>
<li><a href="docs/installation/first-circuit">Your First Circuit</a></li>
</ul>
</div>

<div class="topic-card">
<h3><a href="docs/basics/">Basics</a></h3>
<p class="topic-desc">Core language concepts</p>
<ul>
<li><a href="docs/basics/ruby-dsl-fundamentals">Ruby DSL Fundamentals</a></li>
<li><a href="docs/basics/signals-and-types">Signals and Types</a></li>
<li><a href="docs/basics/ports-and-interfaces">Ports and Interfaces</a></li>
<li><a href="docs/basics/testing-with-rspec">Testing with RSpec</a></li>
</ul>
</div>

<div class="topic-card">
<h3><a href="docs/components/">Components</a></h3>
<p class="topic-desc">Building blocks of digital design</p>
<ul>
<li><a href="docs/components/combinational-logic">Combinational Logic</a></li>
<li><a href="docs/components/sequential-logic">Sequential Logic</a></li>
<li><a href="docs/components/memory-components">Memory Components</a></li>
<li><a href="docs/components/state-machines">State Machines</a></li>
</ul>
</div>

<div class="topic-card">
<h3><a href="docs/architecture/">Architecture</a></h3>
<p class="topic-desc">Compiler internals and IR design</p>
<ul>
<li><a href="docs/architecture/circt-ir-overview">CIRCT IR Overview</a></li>
<li><a href="docs/architecture/dialects-and-passes">Dialects and Passes</a></li>
<li><a href="docs/architecture/compilation-pipeline">Compilation Pipeline</a></li>
<li><a href="docs/architecture/frontends-and-backends">Frontends and Backends</a></li>
</ul>
</div>

<div class="topic-card">
<h3><a href="docs/simulation/">Simulation</a></h3>
<p class="topic-desc">Running and testing designs</p>
<ul>
<li><a href="docs/simulation/rtl-simulation">RTL Simulation</a></li>
<li><a href="docs/simulation/gate-level-simulation">Gate-Level Simulation</a></li>
<li><a href="docs/simulation/browser-simulation">Browser-Based Simulation</a></li>
<li><a href="docs/simulation/performance-tuning">Performance Tuning</a></li>
</ul>
</div>

<div class="topic-card">
<h3><a href="docs/synthesis/">Synthesis</a></h3>
<p class="topic-desc">From design to hardware</p>
<ul>
<li><a href="docs/synthesis/gate-synthesis">Gate Synthesis</a></li>
<li><a href="docs/synthesis/verilog-export">Verilog Export</a></li>
<li><a href="docs/synthesis/fpga-workflows">FPGA Workflows</a></li>
<li><a href="docs/synthesis/legacy-ip-integration">Legacy IP Integration</a></li>
</ul>
</div>

<div class="topic-card">
<h3><a href="docs/showcase/">Showcase</a></h3>
<p class="topic-desc">Real hardware implementations</p>
<ul>
<li><a href="docs/showcase/building-a-6502">Building a 6502 Processor</a></li>
<li><a href="docs/showcase/apple-ii-system">Apple II System Design</a></li>
<li><a href="docs/showcase/game-boy-implementation">Game Boy Implementation</a></li>
<li><a href="docs/showcase/risc-v-rv32i">RISC-V RV32I</a></li>
</ul>
</div>

</div>

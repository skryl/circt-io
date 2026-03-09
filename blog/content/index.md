---
title: CIRCT
---

Welcome to **CIRCT** — the Comprehensive IR Compiler for Hardware. Explore tutorials, deep dives, and guides covering the CIRCT toolchain and hardware design with Ruby.

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
  border: 1px solid rgba(58, 106, 58, 0.3);
  padding: 1.25rem;
  background: rgba(14, 22, 14, 0.3);
}
:root[saved-theme="light"] .topic-card {
  background: rgba(58, 106, 58, 0.04);
  border-color: rgba(58, 106, 58, 0.2);
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
<h3><a href="introduction/">Introduction</a></h3>
<p class="topic-desc">What CIRCT is and why it matters</p>
<ul>
<li><a href="introduction/what-is-circt">What is CIRCT</a></li>
<li><a href="introduction/why-ruby-for-hardware">Why Ruby for Hardware Design</a></li>
<li><a href="introduction/circt-vs-traditional-hdl">CIRCT vs Traditional HDLs</a></li>
</ul>
</div>

<div class="topic-card">
<h3><a href="installation/">Installation</a></h3>
<p class="topic-desc">Get up and running</p>
<ul>
<li><a href="installation/getting-started">Getting Started</a></li>
<li><a href="installation/dev-environment">Development Environment Setup</a></li>
<li><a href="installation/first-circuit">Your First Circuit</a></li>
</ul>
</div>

<div class="topic-card">
<h3><a href="basics/">Basics</a></h3>
<p class="topic-desc">Core language concepts</p>
<ul>
<li><a href="basics/ruby-dsl-fundamentals">Ruby DSL Fundamentals</a></li>
<li><a href="basics/signals-and-types">Signals and Types</a></li>
<li><a href="basics/ports-and-interfaces">Ports and Interfaces</a></li>
<li><a href="basics/testing-with-rspec">Testing with RSpec</a></li>
</ul>
</div>

<div class="topic-card">
<h3><a href="components/">Components</a></h3>
<p class="topic-desc">Building blocks of digital design</p>
<ul>
<li><a href="components/combinational-logic">Combinational Logic</a></li>
<li><a href="components/sequential-logic">Sequential Logic</a></li>
<li><a href="components/memory-components">Memory Components</a></li>
<li><a href="components/state-machines">State Machines</a></li>
</ul>
</div>

<div class="topic-card">
<h3><a href="architecture/">Architecture</a></h3>
<p class="topic-desc">Compiler internals and IR design</p>
<ul>
<li><a href="architecture/circt-ir-overview">CIRCT IR Overview</a></li>
<li><a href="architecture/dialects-and-passes">Dialects and Passes</a></li>
<li><a href="architecture/compilation-pipeline">Compilation Pipeline</a></li>
<li><a href="architecture/frontends-and-backends">Frontends and Backends</a></li>
</ul>
</div>

<div class="topic-card">
<h3><a href="simulation/">Simulation</a></h3>
<p class="topic-desc">Running and testing designs</p>
<ul>
<li><a href="simulation/rtl-simulation">RTL Simulation</a></li>
<li><a href="simulation/gate-level-simulation">Gate-Level Simulation</a></li>
<li><a href="simulation/browser-simulation">Browser-Based Simulation</a></li>
<li><a href="simulation/performance-tuning">Performance Tuning</a></li>
</ul>
</div>

<div class="topic-card">
<h3><a href="synthesis/">Synthesis</a></h3>
<p class="topic-desc">From design to hardware</p>
<ul>
<li><a href="synthesis/gate-synthesis">Gate Synthesis</a></li>
<li><a href="synthesis/verilog-export">Verilog Export</a></li>
<li><a href="synthesis/fpga-workflows">FPGA Workflows</a></li>
<li><a href="synthesis/legacy-ip-integration">Legacy IP Integration</a></li>
</ul>
</div>

<div class="topic-card">
<h3><a href="showcase/">Showcase</a></h3>
<p class="topic-desc">Real hardware implementations</p>
<ul>
<li><a href="showcase/building-a-6502">Building a 6502 Processor</a></li>
<li><a href="showcase/apple-ii-system">Apple II System Design</a></li>
<li><a href="showcase/game-boy-implementation">Game Boy Implementation</a></li>
<li><a href="showcase/risc-v-rv32i">RISC-V RV32I</a></li>
</ul>
</div>

</div>

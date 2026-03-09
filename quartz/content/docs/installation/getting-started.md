---
title: Getting Started
date: 2025-02-01
tags:
  - installation
  - quickstart
---

Get CIRCT and RHDL installed on your system. This guide covers the minimum setup needed to compile and simulate your first hardware design.

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
rhdl version
```

This should print the installed RHDL version and the CIRCT backend version it is linked against.

## Next Steps

- [Development Environment Setup](../installation/dev-environment) — configure your editor and tooling
- [Your First Circuit](../installation/first-circuit) — build a working design from scratch

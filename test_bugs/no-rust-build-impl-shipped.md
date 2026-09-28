---
slug: no-rust-build-impl-shipped
title: cloudflare-rs-dev-server is allowlisted but no shipped implementation is established
status: Active
fix-location: external
last-verified: 2026-09-16
---

# No established Rust cf delegate exists yet

## Current status

Active. cf contains discovery and spawn scaffolding for a Cargo package named `cloudflare-rs-dev-server`, but this repository does not contain that implementation or establish a published release.

`packages/cli/src/commands/dev/known-impls.ts` currently:

- recognizes a Cargo dependency with that exact package name;
- resolves only `$CARGO_HOME/bin/cloudflare-rs-dev-server` (falling back to `~/.cargo/bin`);
- advertises `cargo install cloudflare-rs-dev-server`; and
- has no version constraint, unlike the shipped Vite (v2, including beta prereleases) and Wrangler (4.136.0 or newer) delegates.

The discoverer and error-path tests cover Cargo dependency detection and the missing-install diagnostic. No test currently proves that an installed Rust executable is selected and spawned, and they do not establish that a compatible crate exists. Treat the Python/Rust entries as planned placeholders rather than supported implementations.

## User impact

A Rust-to-Wasm project still needs a real build/dev implementation, commonly Wrangler plus its custom `build.command`. The cf allowlist entry by itself does not build Rust, run `wasm-bindgen`, or produce Build Output.

## Verification note

The source and tests were verified locally on 2026-09-16. A direct crates.io lookup was blocked by the audit environment's outbound registry policy, so this record intentionally makes the repository-grounded claim (“no shipped implementation is established here”) rather than asserting a globally exhaustive crates.io negative.

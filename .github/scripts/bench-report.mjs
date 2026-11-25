#!/usr/bin/env node
// Format hyperfine JSON output as a Markdown report.
//
// Usage: node bench-report.mjs <hyperfine.json>
//
// - One result   → single-row metrics table (used on push to `main`).
// - Two results  → side-by-side table + Δ row comparing the first two
//   commands (used on PRs; first command is expected to be "PR", second
//   "base"). The script does not assume any particular command names —
//   it just compares results[0] against results[1].

import { readFileSync } from "node:fs";

const path = process.argv[2];
if (!path) {
	console.error("usage: bench-report.mjs <hyperfine.json>");
	process.exit(2);
}

const json = JSON.parse(readFileSync(path, "utf8"));
const results = Array.isArray(json.results) ? json.results : [];

if (results.length === 0) {
	console.error("hyperfine output contained no results");
	process.exit(1);
}

const fmt = (seconds) => `${(seconds * 1000).toFixed(1)} ms`;

const out = [];
out.push("### `cf --help` startup", "");

if (results.length === 1) {
	const r = results[0];
	out.push(
		`**${r.command}**`,
		"",
		"| metric | value |",
		"| --- | --- |",
		`| mean | ${fmt(r.mean)} |`,
		`| stddev | ${fmt(r.stddev)} |`,
		`| min | ${fmt(r.min)} |`,
		`| max | ${fmt(r.max)} |`
	);
} else {
	out.push(
		"|  | mean | stddev | min | max |",
		"| --- | --- | --- | --- | --- |"
	);
	for (const r of results) {
		out.push(
			`| **${r.command}** | ${fmt(r.mean)} | ${fmt(r.stddev)} | ${fmt(r.min)} | ${fmt(r.max)} |`
		);
	}

	const [a, b] = results;
	const delta = a.mean - b.mean;
	const pct = b.mean === 0 ? 0 : (delta / b.mean) * 100;
	// Treat sub-millisecond differences as flat — well within CI jitter.
	const arrow = delta > 0.001 ? "↑" : delta < -0.001 ? "↓" : "—";
	const sign = delta >= 0 ? "+" : "";
	out.push(
		"",
		`**Δ (${a.command} vs ${b.command}):** ${arrow} ${sign}${(delta * 1000).toFixed(1)} ms (${sign}${pct.toFixed(1)}%)`
	);
}

out.push(
	"",
	"_Measured with hyperfine on `ubuntu-latest` (3 warmup runs, 20 timed runs). CI numbers carry ±a few ms of runner jitter; treat small deltas as noise._"
);

console.log(out.join("\n"));

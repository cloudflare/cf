import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { mock } from "node:test";
import { fileURLToPath, pathToFileURL } from "node:url";

const probes = [
	[],
	["--version"],
	["nonesuch"],
	["zons"],
	["kv", "namespaces", "typo", "--help"],
	["--wat"],
	["kv", "namespaces", "update"],
	["zones", "list", "extra"],
	["zones", "list", "--bad", "--dry-run"],
	["zones", "list", "--dry-run"],
	["--quiet", "zones", "list", "--per-page=2", "--dry-run"],
	["zones", "list", "--per-page", "oops", "--dry-run"],
	["zones", "list", "--name", "a", "--name=b", "--dry-run"],
	["zones", "list", "--quiet=yes", "--dry-run"],
	["zones", "list", "-q", "--no-quiet", "--dry-run"],
	["zones", "list", "--status", "typo", "--dry-run"],
	["zones", "list", "--page", "-2", "--dry-run"],
	["--per-page", "2", "zones", "list", "--dry-run"],
	["zones", "list", "--page", "--dry-run"],
	["zones", "list", "--page=", "--dry-run"],
	["zones", "list", "--page", "2", "--page", "--dry-run"],
	["zones", "list", "--bad-flag", "--dry-run"],
	["zones", "list", "--no-dry-run=true"],
	["zones", "list", "-qz", "example", "--dry-run"],
	["zones", "list", "--no-page", "--dry-run"],
	["zones", "list", "--name=a", "--no-name", "--dry-run"],
	["zones", "list", "--page", "-.5", "--dry-run"],
	["zones", "list", "-ab", "--dry-run"],
	["zones", "list", "--bad.one", "--dry-run"],
	["zones", "--dry-run", "list"],
	["--profile", "--help"],
	["zones", "list", "--zone", "--help"],
	["zones", "list", "--zone", "--bad"],
	["zones", "list", "-zabcd", "--dry-run"],
	["kv", "namespaces", "update", "--wat"],
	["o11y", "issues", "get", "parity-group", "--dry-run"],
	["dev", "--dry-run", "--", "--port", "1234"],
	["schema", "zones", "list"],
	["cli", "search", "List zones"],
];

async function capture(dist, cases) {
	const { runMain, CliExit } = await import(
		pathToFileURL(join(dist, "index.mjs")).href
	);
	globalThis.fetch = () => {
		throw new Error("Network access disabled during parity comparison");
	};
	const results = [];
	for (const args of cases) {
		const out = [],
			err = [];
		const stdout = mock.method(process.stdout, "write", (chunk) => {
			out.push(Buffer.from(chunk));
			return true;
		});
		const stderr = mock.method(process.stderr, "write", (chunk) => {
			err.push(Buffer.from(chunk));
			return true;
		});
		let code = 0;
		try {
			await runMain(args);
		} catch (error) {
			code = error instanceof CliExit ? error.code : 1;
		} finally {
			stdout.mock.restore();
			stderr.mock.restore();
		}
		const summarize = (chunks) =>
			process.env.CF_PARITY_DETAIL
				? Buffer.concat(chunks).toString()
				: createHash("sha256").update(Buffer.concat(chunks)).digest("hex");
		results.push([code, summarize(out), summarize(err)]);
	}
	return results;
}

if (process.argv[2] === "--capture") {
	console.log(
		JSON.stringify(
			await capture(process.argv[3], JSON.parse(readFileSync(0, "utf8")))
		)
	);
} else {
	const [reference, candidate] = process.argv
		.slice(2)
		.map((dir) => resolve(dir));
	assert(
		reference && candidate,
		"Usage: node scripts/compare-cli-parity.mjs <reference dist> <candidate dist>"
	);
	const paths = new Set([""]);
	const operations = new Map();
	const handwritten = new Set();
	const sampleValue = (param) =>
		String(
			param.enum?.[0] ?? { number: 2, boolean: true }[param.type] ?? "parity-id"
		);
	for (const dist of [reference, candidate]) {
		for (const file of ["commands", "hand-written-commands"]) {
			const { commands } = JSON.parse(
				readFileSync(join(dist, "_meta", `${file}.json`), "utf8")
			);
			for (const command of commands) {
				const { fullPath } = command;
				for (let depth = 1; depth <= fullPath.length; depth++) {
					paths.add(fullPath.slice(0, depth).join(" "));
				}
				const route = fullPath.join(" ");
				if (file === "hand-written-commands") {
					handwritten.add(route);
				} else if (
					command.httpMethod &&
					command.options.some((opt) => opt.name === "dry-run")
				) {
					operations.set(route, [
						...fullPath,
						...command.arguments
							.filter((param) => param.required)
							.map(sampleValue),
						...command.options
							.filter((opt) => opt.required)
							.map((opt) => `--${opt.name}=${sampleValue(opt)}`),
						"--dry-run",
					]);
				}
			}
		}
	}
	for (const route of handwritten) {
		operations.delete(route);
	}
	const cases = [
		...Array.from(paths, (route) => [
			...route.split(" ").filter(Boolean),
			"--help",
		]),
		...probes,
		...operations.values(),
	];
	const compare = (dist, selected, detail) => {
		const home = mkdtempSync(join(tmpdir(), "cf-parser-parity-"));
		try {
			const result = spawnSync(
				process.execPath,
				[fileURLToPath(import.meta.url), "--capture", dist],
				{
					cwd: home,
					env: {
						PATH: process.env.PATH,
						SystemRoot: process.env.SystemRoot,
						HOME: home,
						USERPROFILE: home,
						XDG_CONFIG_HOME: home,
						XDG_STATE_HOME: home,
						CI: "1",
						NO_COLOR: "1",
						CF_SEND_TELEMETRY: "false",
						CLOUDFLARE_ACCOUNT_ID: "00000000000000000000000000000001",
						CLOUDFLARE_ZONE_ID: "00000000000000000000000000000002",
						CF_PARITY_DETAIL: detail ? "1" : "",
					},
					encoding: "utf8",
					input: JSON.stringify(selected),
					maxBuffer: 64 * 1024 * 1024,
				}
			);
			assert.equal(result.status, 0, result.error?.message ?? result.stderr);
			return JSON.parse(result.stdout);
		} finally {
			rmSync(home, { recursive: true, force: true });
		}
	};
	const before = compare(reference, cases, false),
		after = compare(candidate, cases, false);
	const mismatches = cases.filter(
		(_, idx) => JSON.stringify(before[idx]) !== JSON.stringify(after[idx])
	);
	console.log(
		`${cases.length - mismatches.length}/${cases.length} invocations matched (exit status, stdout and stderr).`
	);
	console.log(
		`${paths.size} help routes; ${probes.length} explicit probes; ${operations.size} generated dry runs (${before.slice(paths.size + probes.length).filter(([code]) => code === 0).length} successful on reference).`
	);
	if (mismatches.length) {
		console.log(JSON.stringify(mismatches));
		const sample = mismatches.slice(0, 3);
		console.log(
			JSON.stringify(
				{
					sample,
					before: compare(reference, sample, true),
					after: compare(candidate, sample, true),
				},
				null,
				2
			)
		);
		process.exitCode = 1;
	}
}

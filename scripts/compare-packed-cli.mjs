import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { delimiter, join, resolve } from "node:path";

const [reference, candidate] = process.argv.slice(2);
assert(
	reference && candidate,
	"Pass the reference and candidate npm install directories"
);

/** @type {[string[], number, "stdout" | "stderr", RegExp][]} */
const scenarios = [
	[["zero-trust", "devices", "list", "--help"], 0, "stdout", /--help/],
	[["zones", "list", "--dry-run"], 0, "stdout", /"method": "GET"/],
	[
		["zones", "list", "--bad", "--dry-run"],
		1,
		"stderr",
		/Unknown argument: bad/,
	],
	[
		["zones", "delete", "--force", "-f", "--dry-run"],
		0,
		"stdout",
		/"method": "DELETE"/,
	],
	[
		["zones", "delete"],
		1,
		"stderr",
		/non-interactive; pass --force to confirm/,
	],
];

function invoke(install, args, cwd) {
	const windows = process.platform === "win32";
	const bin = resolve(install, "node_modules", ".bin");
	const result = spawnSync(
		windows ? process.env.ComSpec : join(bin, "cf"),
		windows ? ["/d", "/c", "cf.cmd", ...args] : args,
		{
			cwd,
			env: {
				PATH: [bin, process.env.PATH].join(delimiter),
				SystemRoot: process.env.SystemRoot,
				HOME: cwd,
				USERPROFILE: cwd,
				APPDATA: cwd,
				LOCALAPPDATA: cwd,
				XDG_CONFIG_HOME: cwd,
				XDG_STATE_HOME: cwd,
				CI: "1",
				NO_COLOR: "1",
				CF_SEND_TELEMETRY: "false",
				CLOUDFLARE_API_TOKEN: "offline-test-token",
				CLOUDFLARE_ACCOUNT_ID: "00000000000000000000000000000001",
				CLOUDFLARE_ZONE_ID: "00000000000000000000000000000002",
				CLOUDFLARE_API_BASE_URL: "http://127.0.0.1:1",
			},
			input: "",
			timeout: 30000,
		}
	);
	assert.ifError(result.error);
	assert.equal(result.signal, null);
	return result;
}

for (const [args, status, stream, expected] of scenarios) {
	const command = `cf ${args.join(" ")}`;
	const run = (install) => {
		const home = mkdtempSync(join(tmpdir(), "cf-packed-"));
		try {
			return invoke(install, args, home);
		} finally {
			rmSync(home, { recursive: true, force: true });
		}
	};
	const before = run(reference),
		after = run(candidate);
	assert.equal(
		before.status,
		status,
		`${command}: reference exit (${before.stderr})`
	);
	assert.match(
		before[stream].toString(),
		expected,
		`${command}: reference ${stream}`
	);
	assert.equal(
		after.status,
		before.status,
		`${command}: exit (${after.stderr})`
	);
	for (const name of ["stdout", "stderr"]) {
		assert.deepEqual(
			after[name],
			before[name],
			`${command}: ${name}\nExpected: ${before[name]}\nReceived: ${after[name]}`
		);
	}
	console.log(`Matched: ${command} (exit ${status})`);
}

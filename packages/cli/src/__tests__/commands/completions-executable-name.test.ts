/**
 * cloudflare/cf#688: the package installs the CLI as both `cf` and
 * `cloudflare`, and the docs offer `cloudflare` for when another `cf` is on
 * PATH. The scripts `cloudflare complete <shell>` prints must register
 * completion for `cloudflare` and call back into `cloudflare`, not `cf`.
 */
import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
	afterEach,
	beforeEach,
	describe,
	expect,
	it,
	vi,
} from "vite-plus/test";

vi.mock("../../lib/telemetry/run.js", () => ({
	runWithTelemetry: (
		_opts: unknown,
		_argv: unknown,
		fn: () => unknown
	): unknown => fn(),
}));

const { default: completeCommand } =
	await import("../../commands/completions/index.js");

type Shell = "bash" | "zsh" | "fish" | "powershell";

const originalArgv1 = process.argv[1];
let dir: string;

beforeEach(() => {
	dir = mkdtempSync(join(tmpdir(), "cf-complete-name-"));
});

afterEach(() => {
	process.argv[1] = originalArgv1;
	vi.restoreAllMocks();
	rmSync(dir, { recursive: true, force: true });
});

/** Run `<executable> complete <shell>` through the command's handler. */
async function generateScript(
	executable: "cf" | "cloudflare",
	shell: Shell
): Promise<string> {
	process.argv[1] = `/usr/local/lib/node_modules/cf/node_modules/.bin/${executable}`;
	const chunks: string[] = [];
	vi.spyOn(console, "log").mockImplementation((...args: unknown[]) => {
		chunks.push(`${args.map(String).join(" ")}\n`);
	});
	vi.spyOn(process.stdout, "write").mockImplementation(((chunk: unknown) => {
		chunks.push(String(chunk));
		return true;
	}) as typeof process.stdout.write);
	await completeCommand.handler({
		shell,
		_: ["complete"],
		$0: executable,
	} as never);
	vi.restoreAllMocks();
	return chunks.join("");
}

/**
 * Source a generated bash script in a clean bash, with stub `cf` and
 * `cloudflare` functions, then run the completion function registered for
 * `executable` on `<executable> wor` and print COMPREPLY.
 */
function completeInBash(
	script: string,
	executable: "cf" | "cloudflare"
): { status: number | null; stdout: string; stderr: string } {
	const file = join(dir, "completion.bash");
	writeFileSync(file, script);
	const result = spawnSync(
		"bash",
		[
			"--noprofile",
			"--norc",
			"-c",
			[
				`source "$1"`,
				// A different program named `cf` that must not be called.
				`cf() { printf 'from-other-cf\\n:4\\n'; }`,
				`cloudflare() { printf 'workers\\n:4\\n'; }`,
				`spec=$(complete -p "$2") || exit 3`,
				`fn=$(sed -E 's/.*-F ([^ ]+).*/\\1/' <<<"$spec")`,
				`COMP_WORDS=("$2" wor); COMP_CWORD=1`,
				`COMP_LINE="$2 wor"; COMP_POINT=\${#COMP_LINE}`,
				`"$fn" "$2" wor "$2"`,
				`printf '%s\\n' "\${COMPREPLY[@]}"`,
			].join("\n"),
			"bash",
			file,
			executable,
		],
		{ encoding: "utf8" }
	);
	return {
		status: result.status,
		stdout: result.stdout,
		stderr: result.stderr,
	};
}

describe("cloudflare complete (cloudflare/cf#688)", () => {
	it("registers a bash completion for `cloudflare`", async () => {
		const script = await generateScript("cloudflare", "bash");
		const result = completeInBash(script, "cloudflare");
		// Exit 3 means `complete -p cloudflare` found no specification.
		expect(result.status, result.stderr).toBe(0);
	});

	it("bash completion for `cloudflare` calls `cloudflare`, not a different `cf`", async () => {
		const script = await generateScript("cloudflare", "bash");
		const result = completeInBash(script, "cloudflare");
		expect(result.stdout.split("\n")).toContain("workers");
		expect(result.stdout).not.toContain("from-other-cf");
	});

	it("registers a zsh completion for `cloudflare` that calls back into `cloudflare`", async () => {
		const script = await generateScript("cloudflare", "zsh");
		expect(script).toMatch(/^compdef \S+ (?:.*\s)?cloudflare(?:\s|$)/m);
		expect(script).toContain("cloudflare complete --");
	});

	it("fish completion calls back into `cloudflare`", async () => {
		const script = await generateScript("cloudflare", "fish");
		expect(script).toContain("(cloudflare complete --");
	});

	it("powershell completion registers and calls back into `cloudflare`", async () => {
		const script = await generateScript("cloudflare", "powershell");
		expect(script).toMatch(
			/Register-ArgumentCompleter -CommandName 'cloudflare'/
		);
		expect(script).toContain("& cloudflare complete '--'");
	});

	it("still registers a bash completion for `cf` when invoked as `cf`", async () => {
		const script = await generateScript("cf", "bash");
		const result = completeInBash(script, "cf");
		expect(result.status, result.stderr).toBe(0);
		expect(script).toContain("cf complete --");
	});
});

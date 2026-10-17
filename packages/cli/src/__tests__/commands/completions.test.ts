import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { RootCommand } from "@bomb.sh/tab";
import { afterEach, describe, expect, it, vi } from "vite-plus/test";
import { registerCompletions } from "../../commands/completions/index.js";
import type { CommandMeta } from "../../lib/metadata.js";

const TCP_META = {
	command: "cf access tcp",
	name: "tcp",
	fullPath: ["access", "tcp"],
	aliases: ["ssh", "rdp", "smb"],
	description: "Proxy a TCP connection through Access",
	usage: "cf access tcp [options]",
	arguments: [],
	options: [
		{
			name: "log-level",
			alias: ["loglevel", "log"],
			type: "string",
			required: false,
			description: "cloudflared log level",
			enum: ["debug", "info"],
		},
	],
} satisfies CommandMeta;

function parseCompletions(root: RootCommand, args: string[]): string[] {
	const lines: string[] = [];
	vi.spyOn(console, "log").mockImplementation((line) => {
		lines.push(String(line));
	});
	root.parse(args);
	return lines;
}

describe("metadata-backed completions", () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("registers command aliases as sibling leaves", () => {
		const root = new RootCommand();
		registerCompletions(root, [TCP_META]);

		expect(parseCompletions(root, ["access", "s"])).toEqual(
			expect.arrayContaining([
				"ssh\tProxy a TCP connection through Access",
				"smb\tProxy a TCP connection through Access",
			])
		);
	});

	it("registers option aliases and their enum candidates on aliases", () => {
		const root = new RootCommand();
		registerCompletions(root, [TCP_META]);

		expect(parseCompletions(root, ["access", "ssh", "--log"])).toEqual(
			expect.arrayContaining([
				"--log-level\tcloudflared log level",
				"--loglevel\tcloudflared log level",
				"--log\tcloudflared log level",
			])
		);

		vi.restoreAllMocks();
		expect(parseCompletions(root, ["access", "ssh", "--loglevel", ""])).toEqual(
			expect.arrayContaining(["debug\tdebug", "info\tinfo"])
		);
	});
});

describe("Zsh completion script", () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	function generateScript(): string {
		const output = vi.spyOn(console, "log").mockImplementation(() => {});
		new RootCommand().setup("cf", "cf", "zsh");
		return output.mock.calls.map(([line]) => String(line)).join("\n");
	}

	function runZsh(commands: string) {
		const directory = mkdtempSync(join(tmpdir(), "cf zsh-"));
		try {
			const scriptPath = join(directory, "completions.zsh");
			writeFileSync(scriptPath, generateScript());
			return spawnSync(
				"zsh",
				["-f", "-c", commands, "cf-zsh-test", scriptPath],
				{
					encoding: "utf8",
					env: { ...process.env, ZDOTDIR: directory },
					timeout: 10_000,
				}
			);
		} finally {
			rmSync(directory, { recursive: true, force: true });
		}
	}

	it("preserves the compdef directive as the first line", () => {
		expect(generateScript().split("\n")[0]).toBe("#compdef cf");
	});

	// Zsh is optional on Linux and Windows; script generation is tested everywhere.
	describe.skipIf(
		spawnSync("zsh", ["-f", "-c", "exit 0"], { timeout: 5_000 }).status !== 0
	)("when Zsh is available", () => {
		it("initializes a clean shell and registers the cf handler", () => {
			const result = runZsh(`
(( ! $+functions[compdef] )) || exit 1
source "$1" || exit $?
(( $+functions[_cf] )) || exit 1
print -r -- "$_comps[cf]"
`);
			expect(result.error).toBeUndefined();
			expect(result.stderr).toBe("");
			expect(result.status).toBe(0);
			expect(result.stdout).toBe("_cf\n");
		});

		it("does not reinitialize completion when sourced again", () => {
			const result = runZsh(`
source "$1" || exit $?
compinit() { print -u2 -- "unexpected compinit"; return 1; }
source "$1" || exit $?
print -r -- "$_comps[cf]"
`);
			expect(result.error).toBeUndefined();
			expect(result.stderr).toBe("");
			expect(result.status).toBe(0);
			expect(result.stdout).toBe("_cf\n");
		});

		it("skips compinit in an initialized shell, including repeated sourcing", () => {
			const result = runZsh(`
autoload -Uz compinit
compinit || exit $?
compinit() { print -u2 -- "unexpected compinit"; return 1; }
source "$1" || exit $?
source "$1" || exit $?
(( $+functions[_cf] )) || exit 1
print -r -- "$_comps[cf]"
`);
			expect(result.error).toBeUndefined();
			expect(result.stderr).toBe("");
			expect(result.status).toBe(0);
			expect(result.stdout).toBe("_cf\n");
		});
	});
});

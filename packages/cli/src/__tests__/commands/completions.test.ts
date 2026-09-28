import { RootCommand } from "@bomb.sh/tab";
import { afterEach, describe, expect, it, vi } from "vitest";
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

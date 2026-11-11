import { describe, expect, it } from "vite-plus/test";
import {
	commandFiles,
	metadataFiles,
} from "../../../../generator/plugin/files.js";
import { HandWritten } from "../../../../generator/plugin/hand-written.js";
import { method, operation } from "../../helpers/cli-plugin.js";
import type { Command } from "../../../../generator/plugin/commands.js";
import type { CommandMeta } from "../../../lib/command-meta.js";

function generate(contentType: string, status = "200") {
	const leaf = method("get", "things.get");
	const ops = new Map([
		[
			leaf.operationId,
			operation("get", "/things", {
				responses: [[status, { content: [contentType] }]],
			}),
		],
	]);
	const command: Command = {
		name: "things",
		description: "Example things",
		items: [leaf],
		hideCommand: false,
	};
	const hand = new HandWritten({
		handWritten: [],
		sidecars: { roots: {}, subgroups: {}, leaves: {}, leafOverrides: {} },
	});
	const files = new Map(
		[
			...commandFiles(ops, command, hand),
			...metadataFiles(ops, [command], hand),
		].map((file) => [file.path, file.content])
	);
	const metadata = JSON.parse(files.get("_meta/commands.json") ?? "") as {
		commands: CommandMeta[];
	};
	const meta = metadata.commands.find((c) => c.command === "cf things get");
	const code = files.get("things/get.ts");
	if (meta === undefined || code === undefined) {
		throw new Error("Missing generated things get command");
	}
	return { meta, code };
}

describe("command metadata text option", () => {
	it.each(["application/octet-stream", "image/png", "application/pdf"])(
		"matches the runtime option for %s responses",
		(contentType) => {
			const { meta, code } = generate(contentType);
			const match = code.match(/\.option\("text", (\{[^\n]*\})\)/);
			expect(match).not.toBeNull();
			const runtime = JSON.parse(match?.[1] ?? "") as Record<string, unknown>;
			expect(runtime).toMatchObject({ type: "boolean", default: false });
			expect(meta.options.filter((option) => option.name === "text")).toEqual([
				{ name: "text", required: false, ...runtime },
			]);
		}
	);

	it.each([
		["application/json", "200"],
		["text/plain", "200"],
		["application/json", "101"],
	])(
		"omits text from metadata and runtime for %s responses with status %s",
		(contentType, status) => {
			const { meta, code } = generate(contentType, status);
			expect(meta.options.some((option) => option.name === "text")).toBe(false);
			expect(code).not.toContain('.option("text"');
		}
	);
});

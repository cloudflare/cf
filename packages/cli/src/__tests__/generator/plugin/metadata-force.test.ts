import { describe, expect, it } from "vite-plus/test";
import {
	commandFiles,
	metadataFiles,
} from "../../../../generator/plugin/files.js";
import { HandWritten } from "../../../../generator/plugin/hand-written.js";
import { method, operation } from "../../helpers/cli-plugin.js";
import type { Command } from "../../../../generator/plugin/commands.js";
import type { CommandMeta } from "../../../lib/command-meta.js";

function generate(httpMethod: string, requireConfirmation?: string) {
	const leaf = method("update", "things.update", { requireConfirmation });
	const ops = new Map([[leaf.operationId, operation(httpMethod, "/things")]]);
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
	const meta = metadata.commands.find((c) => c.command === "cf things update");
	const code = files.get("things/update.ts");
	if (meta === undefined || code === undefined) {
		throw new Error("Missing generated things update command");
	}
	return { meta, code };
}

describe("command metadata force option", () => {
	it.each([
		["delete", undefined],
		["post", "This operation deletes data."],
		["put", "This operation replaces the full recipient list."],
		["patch", "This operation removes recipients."],
	])(
		"matches the runtime option for %s with confirmation %s",
		(verb, message) => {
			const { meta, code } = generate(verb, message);
			expect(meta.options.filter((option) => option.name === "force")).toEqual([
				{
					name: "force",
					type: "boolean",
					alias: "f",
					required: false,
					description: "Skip confirmation (useful in scripts and CI)",
					default: false,
				},
			]);
			expect(code).toContain(
				'.option("force", {"type":"boolean","alias":"f","description":"Skip confirmation (useful in scripts and CI)","default":false})'
			);
			expect(code).toContain("confirmDelete({ force: Boolean(argv.force)");
			expect(code).toContain("shortFlagAliases: { f:");
			expect(code).toContain("safeFlags: ['dry-run', 'force']");
		}
	);

	it.each(["get", "post", "put", "patch"])(
		"omits force from metadata and runtime for an ordinary %s operation",
		(verb) => {
			const { meta, code } = generate(verb);
			expect(meta.options.some((option) => option.name === "force")).toBe(
				false
			);
			expect(code).not.toContain('.option("force"');
			expect(code).not.toContain("confirmDelete");
			expect(code).not.toContain("shortFlagAliases");
		}
	);

	it("ignores an empty confirmation annotation consistently", () => {
		const { meta, code } = generate("put", "");
		expect(meta.options.some((option) => option.name === "force")).toBe(false);
		expect(code).not.toContain('.option("force"');
		expect(code).not.toContain("confirmDelete");
		expect(code).not.toContain("shortFlagAliases");
	});
});

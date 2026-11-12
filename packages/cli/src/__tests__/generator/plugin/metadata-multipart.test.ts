import { describe, expect, it } from "vite-plus/test";
import {
	commandFiles,
	metadataFiles,
} from "../../../../generator/plugin/files.js";
import { HandWritten } from "../../../../generator/plugin/hand-written.js";
import { bodyParam, method, operation } from "../../helpers/cli-plugin.js";
import type { Command } from "../../../../generator/plugin/commands.js";
import type { MultipartField } from "../../../../generator/plugin/operation.js";
import type { CommandMeta } from "../../../lib/command-meta.js";

const field = (
	name: string,
	type: MultipartField["type"],
	isBinary = false
): MultipartField => ({
	name,
	type,
	isBinary,
	readOnly: false,
	description: `${name} field`,
});

function generate() {
	const leaf = method("upload", "things.upload");
	const ops = new Map([
		[
			leaf.operationId,
			operation("post", "/things", {
				hasRequestBody: true,
				requestContentTypes: ["application/json", "multipart/form-data"],
				bodyParams: [bodyParam("label", "string", ["label"])],
				multipart: {
					fields: [
						field("file", "string", true),
						field("label", "string"),
						field("metadata", "object"),
						field("ttl", "number"),
						field("private", "boolean"),
					],
					payloadField: "file",
				},
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
	const meta = metadata.commands.find((c) => c.command === "cf things upload");
	const code = files.get("things/upload.ts");
	if (meta === undefined || code === undefined) {
		throw new Error("Missing generated things upload command");
	}
	return { meta, code };
}

describe("command metadata multipart form options", () => {
	it("lists the same flags as the runtime builder", () => {
		const { meta, code } = generate();
		const runtime = [
			...code.matchAll(
				/\.option\(['"]([^'"]+)['"], \{\s*(?:"type":"|type: ')(\w+)/g
			),
		].map(([, name, type]) => ({ name, type }));
		expect(meta.options.map(({ name, type }) => ({ name, type }))).toEqual(
			runtime
		);
		expect(runtime.map(({ name }) => name)).toEqual(
			expect.arrayContaining(["label", "metadata", "ttl", "private"])
		);
		expect(meta.options).toContainEqual({
			name: "metadata",
			type: "string",
			required: false,
			description: "metadata field",
		});
	});
});

import { describe, expect, it } from "vite-plus/test";
import {
	getLeafUsage,
	getMethodSummary,
} from "../../../generator/descriptions.js";
import { generateToolDefinition } from "../../../generator/metadata.js";
import type { GeneratedCommandMeta } from "../../../generator/metadata.js";
import type { Schema } from "@cloudflare/forge";

const DESCRIPTION = "Full first line.\nFull second line.";

function method(summary?: string, description = DESCRIPTION): Schema.method {
	return {
		description,
		name: "list",
		operationId: "test-list",
		status: "generally-available",
		summary,
	};
}

function commandMeta(): GeneratedCommandMeta {
	return {
		arguments: [],
		command: "cf test list",
		description: DESCRIPTION,
		fullPath: ["test", "list"],
		name: "list",
		options: [],
		summary: "List test records",
		usage: "cf test list",
	};
}

describe("command descriptions", () => {
	it("uses the method summary for compact contexts", () => {
		expect(getMethodSummary(method("  List test records  "))).toBe(
			"List test records"
		);
	});

	it("falls back to the first description line", () => {
		expect(getMethodSummary(method(undefined, `\n${DESCRIPTION}`))).toBe(
			"Full first line."
		);
	});

	it("uses the full description in leaf help usage", () => {
		expect(getLeafUsage(method(), "test", "records/nested", "list <id>")).toBe(
			"$0 test records nested list <id>\n\nFull first line.\nFull second line."
		);
	});

	it("keeps full descriptions in MCP tools", () => {
		expect(generateToolDefinition(commandMeta()).description).toBe(DESCRIPTION);
	});
});

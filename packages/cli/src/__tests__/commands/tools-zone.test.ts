import { afterEach, beforeEach, describe, expect, it, vi } from "vite-plus/test";
import { captureOutput } from "../helpers/capture-output.js";
import { runCf } from "../helpers/run-cf.js";

interface ToolsOutput {
	tools: {
		name: string;
		inputSchema: {
			properties: Record<string, { type: string; description: string }>;
			required: string[];
		};
	}[];
}

// https://github.com/cloudflare/cf/issues/690
describe("cf tools zone selector", () => {
	let output: ReturnType<typeof captureOutput>;

	beforeEach(() => {
		output = captureOutput();
	});

	afterEach(() => vi.restoreAllMocks());

	it("lists the optional --zone flag on a zone-scoped command", async () => {
		await runCf(["tools"], { CI: "true" });

		const { tools } = JSON.parse(output.stdout()) as ToolsOutput;
		const tool = tools.find((t) => t.name === "cf_dns_records_list");
		expect(tool).toBeDefined();
		expect(tool?.inputSchema.properties).toHaveProperty("name");
		expect(tool?.inputSchema.properties["zone"]).toMatchObject({
			type: "string",
			description: expect.stringMatching(/zone id or domain name/i),
		});
		// Optional, so a zone configured in the environment still works.
		expect(tool?.inputSchema.required).not.toContain("zone");
	});
});

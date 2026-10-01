import { exports } from "cloudflare:workers";
import { assert, describe, expect, it } from "vitest";

assert(
	exports.default,
	"The generated Flue Worker must have a default export."
);
const worker = exports.default;

describe("built Flue Worker", () => {
	it("serves health through the generated entrypoint", async () => {
		const response = await worker.fetch("https://factory.test/health");
		expect(response.status).toBe(200);
		expect(await response.json()).toEqual({ status: "ok" });
	});

	it("keeps agent routes private", async () => {
		const response = await worker.fetch(
			"https://factory.test/agents/issue-triage/42"
		);
		expect(response.status).toBe(404);
	});

	it("rejects unsigned webhooks through the generated entrypoint", async () => {
		const response = await worker.fetch(
			"https://factory.test/channels/github/webhook",
			{
				body: "{}",
				headers: { "content-type": "application/json" },
				method: "POST",
			}
		);
		expect(response.status).toBe(401);
	});
});

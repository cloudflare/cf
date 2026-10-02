import { afterEach, describe, expect, it, vi } from "vitest";
import { formatDryRun, redactDryRunBody } from "../../lib/dry-run.js";

afterEach(() => vi.restoreAllMocks());

describe("dry-run redaction", () => {
	it("redacts known paths in nested objects and arrays without changing the body", () => {
		const body = {
			type: "secret_text",
			text: "hunter2-secret",
			credentials: [
				{ name: "first", token: "abc" },
				{ name: "second", token: "def" },
			],
		};

		expect(
			redactDryRunBody(body, [["text"], ["credentials", "token"]])
		).toEqual({
			type: "secret_text",
			text: "<redacted>",
			credentials: [
				{ name: "first", token: "<redacted>" },
				{ name: "second", token: "<redacted>" },
			],
		});
		expect(body.text).toBe("hunter2-secret");
		expect(body.credentials[0]?.token).toBe("abc");
	});

	it("redacts sensitive fields in a root array and non-string values", () => {
		expect(
			redactDryRunBody(
				[{ text: "one" }, { text: { private: "value" } }],
				[["text"]]
			)
		).toEqual([{ text: "<redacted>" }, { text: "<redacted>" }]);
	});

	it("hides secrets in formatted dry-run output", () => {
		const log = vi.spyOn(console, "log").mockImplementation(() => {});
		const output = {
			command: "cf workers secrets update",
			method: "PUT",
			url: "https://api.cloudflare.com/client/v4/secrets",
			pathParams: {},
			body: { text: "hunter2-secret", type: "secret_text" },
		};
		formatDryRun({ ...output, sensitiveBodyPaths: [["text"]] });
		expect(log.mock.lastCall?.[0]).toContain("<redacted>");
		expect(log.mock.lastCall?.[0]).not.toContain("hunter2-secret");
		expect(log.mock.lastCall?.[0]).not.toContain("sensitiveBodyPaths");
	});
});

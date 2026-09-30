import { describe, expect, it } from "vitest";
import { getApiTimeoutMs } from "../../lib/api-timeout.js";

describe("getApiTimeoutMs", () => {
	it("keeps the standard deadline for requests without byte bodies", () => {
		expect(getApiTimeoutMs(undefined)).toBe(30_000);
		expect(getApiTimeoutMs({ key: "value" })).toBe(30_000);
	});

	it("counts multipart file sizes and respects a longer base deadline", () => {
		const body = new FormData();
		body.append("file", new Blob([Buffer.alloc(2 * 1024 * 1024)]));

		expect(getApiTimeoutMs(body)).toBe(32_000);
		expect(getApiTimeoutMs(body, 60_000)).toBe(62_000);
	});
});

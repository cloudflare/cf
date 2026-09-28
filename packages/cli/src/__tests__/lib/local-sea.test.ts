import { describe, expect, it, vi } from "vitest";
import { createLocalFetch } from "../../lib/local.js";

vi.mock("node:sea", () => ({
	isSea: () => true,
}));

describe("--local in a single executable", () => {
	it("rejects the unsupported runtime", () => {
		expect(() => createLocalFetch()).toThrow(
			"--local is not supported by the standalone executable."
		);
	});
});

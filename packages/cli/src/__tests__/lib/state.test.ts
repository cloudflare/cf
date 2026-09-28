import { readFileSync } from "node:fs";
import { join } from "node:path";
import { getCfConfigPath } from "@cloudflare/workers-auth/cf";
import { runInTempDir } from "@cloudflare/workers-utils/test-helpers";
import { describe, expect, it } from "vitest";
import { readState, updateState } from "../../lib/state.js";

describe("state", () => {
	runInTempDir();

	it("returns an empty object when no state exists", () => {
		expect(readState()).toEqual({});
	});

	it("stores the completion tip state in cf's global directory", () => {
		updateState({ completions: { prompted: true } });

		expect(readState()).toEqual({ completions: { prompted: true } });
		expect(
			JSON.parse(readFileSync(join(getCfConfigPath(), "state.json"), "utf8"))
		).toEqual({ completions: { prompted: true } });
	});

	it("stores the telemetry notice independently of its preference", () => {
		updateState({
			telemetry: {
				preference: {
					enabled: false,
					date: "2026-01-01T00:00:00.000Z",
				},
			},
		});
		updateState({ telemetry: { bannerLastShown: "9.9.9" } });

		expect(readState()).toEqual({
			telemetry: {
				bannerLastShown: "9.9.9",
				preference: {
					enabled: false,
					date: "2026-01-01T00:00:00.000Z",
				},
			},
		});
	});
});

import { runInTempDir } from "@cloudflare/workers-utils/test-helpers";
import { describe, expect, it } from "vite-plus/test";
import { mockOutputStreams } from "../helpers/capture-output.js";
import { runCf } from "../helpers/run-cf.js";

describe("cf cli telemetry", () => {
	runInTempDir();
	const std = mockOutputStreams();

	it("reports the opt-out default and updates the stored preference", async () => {
		await runCf(["cli", "telemetry", "status"]);
		expect(std.getAndClearOut()).toContain("Status: Enabled");

		await runCf(["cli", "telemetry", "disable"]);
		await runCf(["cli", "telemetry", "status"]);
		expect(std.getAndClearOut()).toContain("Status: Disabled");

		await runCf(["cli", "telemetry", "enable"]);
		await runCf(["cli", "telemetry", "status"]);
		expect(std.getAndClearOut()).toContain("Status: Enabled");
	});

	it("confirms each change on stderr and keeps stdout empty", async () => {
		std.setStderrTTY(true);

		await runCf(["cli", "telemetry", "disable"]);
		expect(std.out).toBe("");
		expect(std.getAndClearErr()).toContain(
			"✓ cf is no longer collecting usage telemetry."
		);

		await runCf(["cli", "telemetry", "enable"]);
		expect(std.out).toBe("");
		expect(std.getAndClearErr()).toContain(
			"✓ cf is now collecting anonymous usage telemetry. Thank you for helping make cf better."
		);
	});

	it("prints nothing when a change succeeds outside a terminal", async () => {
		await runCf(["cli", "telemetry", "disable"]);
		await runCf(["cli", "telemetry", "enable"]);

		expect(std.out).toBe("");
		expect(std.err).toBe("");
	});

	it("shows when the environment overrides stored state", async () => {
		await runCf(["cli", "telemetry", "status"], {
			CF_SEND_TELEMETRY: "false",
		});
		expect(std.getAndClearOut()).toContain(
			"Status: Disabled (set by CF_SEND_TELEMETRY)"
		);
	});

	it("warns when the environment overrides enabling telemetry", async () => {
		await runCf(["cli", "telemetry", "enable"], {
			CF_SEND_TELEMETRY: "false",
		});
		expect(std.out).toBe("");
		expect(std.err).toMatchInlineSnapshot(
			`"▲  cf is not collecting usage telemetry because CF_SEND_TELEMETRY=false overrides this setting."`
		);
	});

	it("warns when the environment overrides disabling telemetry", async () => {
		await runCf(["cli", "telemetry", "disable"], {
			CF_SEND_TELEMETRY: "true",
		});
		expect(std.out).toBe("");
		expect(std.err).toMatchInlineSnapshot(
			`"▲  cf is collecting usage telemetry because CF_SEND_TELEMETRY=true overrides this setting."`
		);
	});

	it("names DO_NOT_TRACK when it overrides enabling telemetry", async () => {
		await runCf(["cli", "telemetry", "enable"], { DO_NOT_TRACK: "1" });
		expect(std.out).toBe("");
		expect(std.err).toMatchInlineSnapshot(
			`"▲  cf is not collecting usage telemetry because DO_NOT_TRACK overrides this setting."`
		);
	});

	it("shows the Wrangler environment alias as the source", async () => {
		await runCf(["cli", "telemetry", "status"], {
			WRANGLER_SEND_METRICS: "false",
		});
		expect(std.getAndClearOut()).toContain(
			"Status: Disabled (set by WRANGLER_SEND_METRICS)"
		);
	});

	it("names the alias when it overrides enabling telemetry", async () => {
		await runCf(["cli", "telemetry", "enable"], {
			WRANGLER_SEND_METRICS: "false",
		});
		expect(std.out).toBe("");
		expect(std.err).toMatchInlineSnapshot(
			`"▲  cf is not collecting usage telemetry because WRANGLER_SEND_METRICS=false overrides this setting."`
		);
	});
});

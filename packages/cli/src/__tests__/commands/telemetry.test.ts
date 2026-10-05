import {
	mockConsoleMethods,
	runInTempDir,
} from "@cloudflare/workers-utils/test-helpers";
import { describe, expect, it } from "vite-plus/test";
import { runCf } from "../helpers/run-cf.js";

describe("cf cli telemetry", () => {
	runInTempDir();
	const std = mockConsoleMethods();

	it("reports the opt-out default and updates the stored preference", async () => {
		await runCf(["cli", "telemetry", "status"]);
		expect(std.getAndClearOut()).toContain("Status: Enabled");

		await runCf(["cli", "telemetry", "disable"]);
		expect(std.getAndClearOut()).toContain("Status: Disabled");

		await runCf(["cli", "telemetry", "status"]);
		expect(std.getAndClearOut()).toContain("Status: Disabled");

		await runCf(["cli", "telemetry", "enable"]);
		expect(std.getAndClearOut()).toContain("Status: Enabled");
	});

	it("shows when the environment overrides stored state", async () => {
		await runCf(["cli", "telemetry", "status"], {
			CF_SEND_TELEMETRY: "false",
		});
		expect(std.getAndClearOut()).toContain(
			"Status: Disabled (set by CF_SEND_TELEMETRY)"
		);
	});

	it("reports an environment override after enabling telemetry", async () => {
		await runCf(["cli", "telemetry", "enable"], {
			CF_SEND_TELEMETRY: "false",
		});
		const output = std.getAndClearOut();
		expect(output).toContain("Status: Disabled (set by CF_SEND_TELEMETRY)");
		expect(output).toContain("CF_SEND_TELEMETRY=false overrides this setting");
	});

	it("reports an environment override after disabling telemetry", async () => {
		await runCf(["cli", "telemetry", "disable"], {
			CF_SEND_TELEMETRY: "true",
		});
		const output = std.getAndClearOut();
		expect(output).toContain("Status: Enabled (set by CF_SEND_TELEMETRY)");
		expect(output).toContain("CF_SEND_TELEMETRY=true overrides this setting");
	});

	it("shows DO_NOT_TRACK as the effective source after enabling", async () => {
		await runCf(["cli", "telemetry", "enable"], { DO_NOT_TRACK: "1" });
		const output = std.getAndClearOut();
		expect(output).toContain("Status: Disabled (set by DO_NOT_TRACK)");
		expect(output).toContain("DO_NOT_TRACK overrides this setting");
	});

	it("shows the Wrangler environment alias as the source", async () => {
		await runCf(["cli", "telemetry", "status"], {
			WRANGLER_SEND_METRICS: "false",
		});
		expect(std.getAndClearOut()).toContain(
			"Status: Disabled (set by WRANGLER_SEND_METRICS)"
		);
	});

	it("reports the alias when it overrides enabling telemetry", async () => {
		await runCf(["cli", "telemetry", "enable"], {
			WRANGLER_SEND_METRICS: "false",
		});
		const output = std.getAndClearOut();
		expect(output).toContain("Status: Disabled (set by WRANGLER_SEND_METRICS)");
		expect(output).toContain(
			"WRANGLER_SEND_METRICS=false overrides this setting"
		);
	});
});

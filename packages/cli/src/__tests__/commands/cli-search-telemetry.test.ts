import { beforeEach, describe, expect, it, vi } from "vitest";
import { captureOutput } from "../helpers/capture-output.js";
import { runCf } from "../helpers/run-cf.js";

const telemetry = vi.hoisted(() => ({
	enabled: true,
	events: [] as Array<{ name: string; properties: Record<string, unknown> }>,
}));

vi.mock("../../lib/telemetry/dispatcher.js", () => ({
	getTelemetryDispatcher: () => ({
		enabled: telemetry.enabled,
		sendCommandEvent: (name: string, properties: Record<string, unknown>) =>
			telemetry.events.push({ name, properties }),
		sendAdhocEvent: () => {},
	}),
}));

describe("cf cli search telemetry", () => {
	beforeEach(() => {
		captureOutput();
		telemetry.enabled = true;
		telemetry.events.length = 0;
	});

	it("records the query and the search command lifecycle", async () => {
		await runCf(["cli", "search", "list zones"]);
		expect(telemetry.events).toHaveLength(2);
		expect(telemetry.events[0]).toMatchObject({
			name: "cf command started",
			properties: { command: "cli search" },
		});
		expect(telemetry.events[1]).toMatchObject({
			name: "cf command finished",
			properties: {
				command: "cli search",
				outcome: "success",
				searchQuery: "list zones",
			},
		});
	});

	it("honors telemetry opt-out", async () => {
		telemetry.enabled = false;
		await runCf(["cli", "search", "list zones"]);
		expect(telemetry.events).toEqual([]);
	});
});

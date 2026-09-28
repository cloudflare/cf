import { beforeEach, describe, expect, it, vi } from "vitest";
import { CliExit } from "../../../lib/cli-exit.js";

const state = vi.hoisted(() => ({
	enabled: true,
	events: [] as Array<{ name: string; properties: Record<string, unknown> }>,
}));

const lifecycle = vi.hoisted(() => ({ markReported: vi.fn() }));

vi.mock("../../../lib/telemetry/dispatcher.js", () => ({
	getTelemetryDispatcher: () => ({
		enabled: state.enabled,
		sendCommandEvent: (name: string, properties: Record<string, unknown>) =>
			state.events.push({ name, properties }),
	}),
}));

vi.mock("../../../lib/telemetry/lifecycle.js", () => ({
	markCommandReported: lifecycle.markReported,
}));

import { runWithTelemetry } from "../../../lib/telemetry/run.js";

const meta = {
	command: "resource items list",
	classification: { safeFlags: [] },
};

function cliExit(
	code: number,
	signal?: NodeJS.Signals,
	cancelled = false
): Error {
	return new CliExit(code, { signal, cancelled });
}

describe("runWithTelemetry", () => {
	beforeEach(() => {
		state.enabled = true;
		state.events.length = 0;
		lifecycle.markReported.mockClear();
	});

	it("reports a completed command", async () => {
		await expect(runWithTelemetry(meta, {}, () => "ok")).resolves.toBe("ok");
		expect(state.events.map((event) => event.name)).toEqual([
			"cf command started",
			"cf command finished",
		]);
		expect(state.events[0]?.properties).toMatchObject({
			command: meta.command,
		});
		expect(state.events[1]?.properties).toMatchObject({
			command: meta.command,
			outcome: "success",
		});
	});

	it("reports an error and rethrows it unchanged", async () => {
		const error = new TypeError("sensitive");
		await expect(
			runWithTelemetry(meta, {}, () => {
				throw error;
			})
		).rejects.toBe(error);
		expect(state.events.at(-1)?.name).toBe("cf command finished");
		expect(state.events.at(-1)?.properties).toMatchObject({
			command: meta.command,
			outcome: "error",
			errorType: "Error",
		});
	});

	it("rethrows the original error when telemetry accessors throw", async () => {
		const error = Object.assign(new Error("original failure"), {
			body: { errors: [] },
			rawResponse: undefined,
		});
		Object.defineProperty(error, "statusCode", {
			get: () => {
				throw new Error("accessor failure");
			},
		});

		await expect(
			runWithTelemetry(meta, {}, () => {
				throw error;
			})
		).rejects.toBe(error);
		expect(state.events.at(-1)?.properties).toMatchObject({
			outcome: "error",
			errorType: "Error",
		});
	});

	it.each([
		[0, undefined, false, "success"],
		[0, "SIGINT", false, "cancelled"],
		[130, "SIGINT", false, "cancelled"],
		[143, "SIGTERM", false, "cancelled"],
		[130, undefined, true, "cancelled"],
		[130, undefined, false, "error"],
		[17, undefined, false, "error"],
		[137, "SIGKILL", false, "error"],
	] as const)(
		"reports CliExit(%i, %s, cancelled: %s) as %s",
		async (code, signal, cancelled, outcome) => {
			const error = cliExit(code, signal, cancelled);
			await expect(
				runWithTelemetry(meta, {}, () => {
					throw error;
				})
			).rejects.toBe(error);
			expect(state.events.at(-1)?.properties).toMatchObject({ outcome });
		}
	);

	it("does not trust a project-controlled CliExit lookalike", async () => {
		const error = Object.assign(new Error("project failure"), {
			name: "CliExit",
			code: 0,
		});

		await expect(
			runWithTelemetry(meta, {}, () => {
				throw error;
			})
		).rejects.toBe(error);
		expect(state.events.at(-1)?.properties).toMatchObject({
			outcome: "error",
			errorType: "Error",
		});
	});

	it("does not emit when disabled", async () => {
		state.enabled = false;
		await runWithTelemetry(meta, {}, () => undefined);
		expect(state.events).toEqual([]);
		expect(lifecycle.markReported).toHaveBeenCalledOnce();
	});

	it("does not inspect arguments when argument metrics are disabled", async () => {
		await runWithTelemetry(
			{ command: meta.command, recordArgs: false },
			{ tokenFromProd: "sensitive" },
			() => undefined
		);
		expect(state.events[0]?.properties).toMatchObject({
			sanitizedArgs: {},
			argsUsed: [],
			argsCombination: "",
		});
		expect(JSON.stringify(state.events)).not.toContain("token-from-prod");
		expect(JSON.stringify(state.events)).not.toContain("sensitive");
	});

	it("reports a search query on the finished event only", async () => {
		await runWithTelemetry(
			{
				command: "cli search",
				recordArgs: false,
				searchQuery: "list zones",
			},
			{ query: "list zones" },
			() => undefined
		);
		expect(state.events[0]?.properties).not.toHaveProperty("searchQuery");
		expect(state.events[1]?.properties).toMatchObject({
			command: "cli search",
			outcome: "success",
			searchQuery: "list zones",
			sanitizedArgs: {},
		});
	});

	it("bounds unusually long search queries in telemetry", async () => {
		await runWithTelemetry(
			{
				command: "cli search",
				recordArgs: false,
				searchQuery: "x".repeat(1100),
			},
			{},
			() => undefined
		);
		expect(state.events[1]?.properties).toMatchObject({
			searchQuery: "x".repeat(1024),
			searchQueryTruncated: true,
		});
	});
});

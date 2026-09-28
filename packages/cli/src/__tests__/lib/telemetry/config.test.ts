import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { getGlobalConfigPath } from "@cloudflare/workers-utils";
import { runInTempDir } from "@cloudflare/workers-utils/test-helpers";
import { beforeEach, describe, expect, it } from "vitest";
import { readState, updateState } from "../../../lib/state.js";
import {
	getBannerLastShown,
	getDeviceId,
	getTelemetryFromEnv,
	isFirstUsage,
	resolveTelemetry,
	setBannerLastShown,
	setTelemetryPermission,
	TELEMETRY_POLICY_DATE,
} from "../../../lib/telemetry/config.js";

describe("telemetry config", () => {
	runInTempDir();

	beforeEach(() => {
		delete process.env.CF_SEND_TELEMETRY;
		delete process.env.WRANGLER_SEND_METRICS;
		delete process.env.DO_NOT_TRACK;
	});

	it("defaults to enabled without persisting a preference", () => {
		expect(isFirstUsage()).toBe(true);
		expect(resolveTelemetry()).toEqual({ enabled: true, source: "default" });
		expect(isFirstUsage()).toBe(true);
		expect(readState().telemetry?.preference).toBeUndefined();

		getDeviceId();
		expect(isFirstUsage()).toBe(false);
	});

	it("honors environment overrides", () => {
		process.env.CF_SEND_TELEMETRY = "false";
		expect(getTelemetryFromEnv()).toBe(false);
		expect(resolveTelemetry()).toEqual({ enabled: false, source: "env" });

		process.env.CF_SEND_TELEMETRY = "1";
		expect(resolveTelemetry()).toEqual({ enabled: true, source: "env" });
	});

	it.each(["1", "true", "TRUE"])(
		"honors DO_NOT_TRACK=%s even with explicit opt-ins",
		(value) => {
			process.env.DO_NOT_TRACK = value;
			process.env.CF_SEND_TELEMETRY = "true";
			setTelemetryPermission(true);
			expect(resolveTelemetry()).toEqual({
				enabled: false,
				source: "do-not-track",
			});
		}
	);

	it("uses WRANGLER_SEND_METRICS as an environment alias", () => {
		process.env.WRANGLER_SEND_METRICS = "false";
		expect(getTelemetryFromEnv()).toBe(false);
		expect(resolveTelemetry()).toEqual({
			enabled: false,
			source: "wrangler-env",
		});

		process.env.WRANGLER_SEND_METRICS = "1";
		expect(resolveTelemetry()).toEqual({
			enabled: true,
			source: "wrangler-env",
		});
	});

	it("prefers CF_SEND_TELEMETRY when both environment variables are set", () => {
		process.env.WRANGLER_SEND_METRICS = "false";
		process.env.CF_SEND_TELEMETRY = "true";
		expect(resolveTelemetry()).toEqual({ enabled: true, source: "env" });

		process.env.CF_SEND_TELEMETRY = "false";
		process.env.WRANGLER_SEND_METRICS = "true";
		expect(resolveTelemetry()).toEqual({ enabled: false, source: "env" });
	});

	it("falls back to the alias when CF_SEND_TELEMETRY is invalid", () => {
		process.env.CF_SEND_TELEMETRY = "invalid";
		process.env.WRANGLER_SEND_METRICS = "false";
		expect(resolveTelemetry()).toEqual({
			enabled: false,
			source: "wrangler-env",
		});
	});

	it("ignores an invalid value in the alias", () => {
		process.env.WRANGLER_SEND_METRICS = "no";
		expect(resolveTelemetry()).toEqual({ enabled: true, source: "default" });
	});

	it("ignores Wrangler's saved telemetry preference", () => {
		const configPath = join(getGlobalConfigPath(), "metrics.json");
		mkdirSync(getGlobalConfigPath(), { recursive: true });
		writeFileSync(configPath, '{"permission":{"enabled":false}}');
		expect(resolveTelemetry()).toEqual({ enabled: true, source: "default" });
		setTelemetryPermission(false);
		expect(resolveTelemetry()).toEqual({ enabled: false, source: "config" });
	});

	it("honors an explicit stored preference", () => {
		setTelemetryPermission(false);
		expect(resolveTelemetry()).toEqual({ enabled: false, source: "config" });
	});

	it("tracks first usage by device id rather than preference", () => {
		setTelemetryPermission(true);
		expect(isFirstUsage()).toBe(true);

		getDeviceId();
		expect(isFirstUsage()).toBe(false);
	});

	it("preserves an opt-out from an older telemetry policy", () => {
		updateState({
			telemetry: {
				preference: {
					enabled: false,
					date: "2000-01-01T00:00:00.000Z",
				},
			},
		});
		expect(resolveTelemetry()).toEqual({ enabled: false, source: "config" });
	});

	it("does not refresh the stored date for an opt-in from an older telemetry policy", () => {
		const staleDate = new Date(
			TELEMETRY_POLICY_DATE.getTime() - 1
		).toISOString();
		updateState({
			telemetry: {
				preference: {
					enabled: true,
					date: staleDate,
				},
			},
		});
		expect(resolveTelemetry()).toEqual({ enabled: true, source: "default" });
		expect(readState().telemetry?.preference?.date).toBe(staleDate);
	});

	it("does not replace a malformed stored preference", () => {
		updateState({
			telemetry: {
				preference: {
					enabled: "false" as unknown as boolean,
					date: "9999-01-01T00:00:00.000Z",
				},
			},
		});

		expect(resolveTelemetry()).toEqual({ enabled: true, source: "default" });
		expect(readState().telemetry?.preference?.enabled).toBe("false");
	});

	it("does not refresh a stored opt-in with a malformed date", () => {
		updateState({
			telemetry: {
				preference: {
					enabled: true,
					date: 42 as unknown as string,
				},
			},
		});

		expect(resolveTelemetry()).toEqual({ enabled: true, source: "default" });
		expect(readState().telemetry?.preference?.date).toBe(42);
	});

	it("does not report every environment-enabled invocation as first usage", () => {
		process.env.CF_SEND_TELEMETRY = "true";
		expect(isFirstUsage()).toBe(true);
		getDeviceId();
		expect(isFirstUsage()).toBe(false);
	});

	it("persists a stable device id and disclosure version", () => {
		const firstId = getDeviceId();
		expect(getDeviceId()).toBe(firstId);
		setBannerLastShown("9.9.9");
		expect(getBannerLastShown()).toBe("9.9.9");
	});

	it("reuses only persisted UUID v4 device ids", () => {
		const validId = "123e4567-e89b-42d3-a456-426614174000";
		updateState({ deviceId: validId });

		expect(getDeviceId()).toBe(validId);
	});

	it.each([
		{ label: "malformed string", deviceId: "project-controlled-value" },
		{ label: "non-string value", deviceId: 42 },
	])("replaces a $label device id", ({ deviceId }) => {
		updateState({ deviceId: deviceId as unknown as string });

		const replacement = getDeviceId();
		expect(replacement).toMatch(
			/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
		);
		expect(replacement).not.toBe(deviceId);
		expect(readState().deviceId).toBe(replacement);
	});

	it("persists the disclosure version without saving an environment override", () => {
		process.env.CF_SEND_TELEMETRY = "true";
		expect(resolveTelemetry()).toEqual({ enabled: true, source: "env" });

		setBannerLastShown("9.9.9");
		expect(getBannerLastShown()).toBe("9.9.9");
		expect(readState()).toEqual({
			telemetry: { bannerLastShown: "9.9.9" },
		});
	});
});

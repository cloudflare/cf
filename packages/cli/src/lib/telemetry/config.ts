import { randomUUID } from "node:crypto";
import { isDoNotTrackEnabled } from "@cloudflare/workers-utils";
import { readState, updateState } from "../state.js";

export const TELEMETRY_POLICY_DATE = new Date("2026-01-01T00:00:00.000Z");
export const TELEMETRY_ENV_VAR = "CF_SEND_TELEMETRY";
export const WRANGLER_TELEMETRY_ENV_VAR = "WRANGLER_SEND_METRICS";
const UUID_V4 =
	/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export type TelemetrySource =
	| "do-not-track"
	| "env"
	| "wrangler-env"
	| "config"
	| "default";

export interface ResolvedTelemetry {
	enabled: boolean;
	source: TelemetrySource;
}

function parseTelemetryEnv(raw: string | undefined): boolean | undefined {
	if (raw === undefined) {
		return undefined;
	}

	const value = raw.trim().toLowerCase();
	if (value === "true" || value === "1") {
		return true;
	}
	if (value === "false" || value === "0") {
		return false;
	}
	return undefined;
}

function getTelemetryEnvPreference(): ResolvedTelemetry | undefined {
	const cf = parseTelemetryEnv(process.env[TELEMETRY_ENV_VAR]);
	if (cf !== undefined) {
		return { enabled: cf, source: "env" };
	}

	const wrangler = parseTelemetryEnv(process.env[WRANGLER_TELEMETRY_ENV_VAR]);
	if (wrangler !== undefined) {
		return { enabled: wrangler, source: "wrangler-env" };
	}
	return undefined;
}

export function getTelemetryFromEnv(): boolean | undefined {
	return getTelemetryEnvPreference()?.enabled;
}

export function getDeviceId(): string {
	const state = readState();
	if (typeof state.deviceId === "string" && UUID_V4.test(state.deviceId)) {
		return state.deviceId;
	}

	const deviceId = randomUUID();
	updateState({ deviceId });
	return deviceId;
}

export function isFirstUsage(): boolean {
	return readState().deviceId === undefined;
}

export function resolveTelemetry(): ResolvedTelemetry {
	if (isDoNotTrackEnabled()) {
		return { enabled: false, source: "do-not-track" };
	}

	const fromEnv = getTelemetryEnvPreference();
	if (fromEnv !== undefined) {
		return fromEnv;
	}

	const stored = readState().telemetry?.preference;
	if (stored?.enabled === false) {
		return { enabled: false, source: "config" };
	}
	if (stored?.enabled === true) {
		const isCurrentPolicy =
			typeof stored.date === "string" &&
			new Date(stored.date) >= TELEMETRY_POLICY_DATE;
		if (isCurrentPolicy) {
			return { enabled: true, source: "config" };
		}
	}

	return { enabled: true, source: "default" };
}

export function getTelemetrySourceLabel(
	source: TelemetrySource
): string | undefined {
	switch (source) {
		case "do-not-track":
			return "DO_NOT_TRACK";
		case "env":
			return TELEMETRY_ENV_VAR;
		case "wrangler-env":
			return WRANGLER_TELEMETRY_ENV_VAR;
		default:
			return undefined;
	}
}

export function setTelemetryPermission(enabled: boolean): void {
	updateState({
		telemetry: {
			preference: {
				enabled,
				date: new Date().toISOString(),
			},
		},
	});
}

export function getBannerLastShown(): string | undefined {
	return readState().telemetry?.bannerLastShown;
}

export function setBannerLastShown(version: string): void {
	updateState({ telemetry: { bannerLastShown: version } });
}

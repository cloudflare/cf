import { createHash } from "node:crypto";
import { isInteractive } from "@cloudflare/cli-shared-helpers/interactive";
import { VERSION } from "../../version.js";
import { detectAgentContext } from "../agent-context.js";
import { DELEGATION_SENTINEL } from "../delegate.js";
import { isCI } from "../interactive.js";
import { detectCLIMode } from "../request-headers.js";
import { getDeviceId, isFirstUsage, resolveTelemetry } from "./config.js";
import {
	getArch,
	getNodeVersion,
	getOSVersion,
	getPackageManager,
	getPlatform,
} from "./environment.js";
import {
	__resetTelemetryLifecycleForTests,
	trackTelemetryDispatch,
} from "./lifecycle.js";
import type {
	CommandEventName,
	CommandEventProperties,
	CommonEventProperties,
} from "./types.js";

const SPARROW_URL = "https://sparrow.cloudflare.com";
const SPARROW_SOURCE_KEY = process.env.SPARROW_SOURCE_KEY ?? "";

function hashAgentSession(
	deviceId: string,
	agent: string,
	sessionId: string
): string {
	return createHash("sha256")
		.update("cf-agent-session-v1\0")
		.update(deviceId)
		.update("\0")
		.update(agent)
		.update("\0")
		.update(sessionId)
		.digest("hex")
		.slice(0, 32);
}

declare const PACKAGE_PRERELEASE_LABEL: string | undefined;

function getPrereleaseLabel(): string | undefined {
	return typeof PACKAGE_PRERELEASE_LABEL === "string"
		? PACKAGE_PRERELEASE_LABEL
		: undefined;
}

export type Properties = Record<string, unknown>;

export type CommandEventInput = Omit<
	CommandEventProperties,
	keyof CommonEventProperties
>;

export interface TelemetryDispatcher {
	enabled: boolean;
	sendCommandEvent(
		eventName: CommandEventName,
		properties: CommandEventInput
	): void;
	sendAdhocEvent(name: string, properties?: Properties): void;
}

let dispatcherSingleton: TelemetryDispatcher | undefined;

export function getTelemetryDispatcher(): TelemetryDispatcher {
	if (dispatcherSingleton) {
		return dispatcherSingleton;
	}

	const [major, minor, patch] = VERSION.split(".").map((part) => {
		const parsed = Number.parseInt(part, 10);
		return Number.isNaN(parsed) ? 0 : parsed;
	});
	const amplitudeSessionId = Date.now();
	let amplitudeEventId = 0;
	const firstUsage = isFirstUsage();
	const { enabled } = resolveTelemetry();
	const agentContext = detectAgentContext();
	const agent = agentContext.harness?.id ?? null;
	const sessionMatch = agentContext.matches.find((match) => match.sessionId);

	function common(): CommonEventProperties {
		const prereleaseLabel = getPrereleaseLabel();
		const deviceId = getDeviceId();
		return {
			product: "cf",
			cliVersion: VERSION,
			cliMajor: major ?? 0,
			cliMinor: minor ?? 0,
			cliPatch: patch ?? 0,
			...(prereleaseLabel ? { prereleaseLabel } : {}),
			osPlatform: getPlatform(),
			osVersion: getOSVersion(),
			arch: getArch(),
			nodeVersion: getNodeVersion(),
			packageManager: getPackageManager(),
			deviceId,
			amplitude_session_id: amplitudeSessionId,
			amplitude_event_id: amplitudeEventId++,
			...(sessionMatch?.sessionId
				? {
						agentSessionKey: hashAgentSession(
							deviceId,
							sessionMatch.harness.id,
							sessionMatch.sessionId
						),
					}
				: {}),
			isFirstUsage: firstUsage,
			isCI,
			isInteractive: isInteractive(),
			cliMode: detectCLIMode(),
			agent,
			delegated: Boolean(process.env[DELEGATION_SENTINEL]),
		};
	}

	function dispatch(
		name: string,
		properties: Properties
	): Promise<void> | void {
		const body = {
			deviceId: properties.deviceId,
			event: name,
			timestamp: Date.now(),
			properties,
		};

		if (process.env.DEBUG) {
			console.error(
				`Telemetry ${enabled && SPARROW_SOURCE_KEY ? "sending" : "would send"}: ${JSON.stringify(body)}`
			);
		}
		if (!enabled || !SPARROW_SOURCE_KEY) {
			return;
		}

		return fetch(`${SPARROW_URL}/api/v1/event`, {
			method: "POST",
			signal: AbortSignal.timeout(1000),
			headers: {
				Accept: "*/*",
				"Content-Type": "application/json",
				"Sparrow-Source-Key": SPARROW_SOURCE_KEY,
			},
			mode: "cors",
			keepalive: true,
			body: JSON.stringify(body),
		})
			.then(() => undefined)
			.catch((error: unknown) => {
				if (process.env.DEBUG) {
					console.error(
						"Telemetry failed to send:",
						error instanceof Error ? error.message : String(error)
					);
				}
			});
	}

	dispatcherSingleton = {
		enabled,
		sendCommandEvent(eventName, properties) {
			if (!enabled) {
				return;
			}
			try {
				trackTelemetryDispatch(
					dispatch(eventName, { ...common(), ...properties })
				);
			} catch (error) {
				if (process.env.DEBUG) {
					console.error("Telemetry failed to prepare:", error);
				}
			}
		},
		sendAdhocEvent(name, properties = {}) {
			if (!enabled) {
				return;
			}
			try {
				trackTelemetryDispatch(dispatch(name, { ...common(), ...properties }));
			} catch (error) {
				if (process.env.DEBUG) {
					console.error("Telemetry failed to prepare:", error);
				}
			}
		},
	};
	return dispatcherSingleton;
}

export function __resetTelemetryForTests(): void {
	dispatcherSingleton = undefined;
	__resetTelemetryLifecycleForTests();
}

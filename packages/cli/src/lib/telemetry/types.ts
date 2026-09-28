import type { CLIMode } from "../request-headers.js";

export interface CommonEventProperties {
	product: "cf";
	cliVersion: string;
	cliMajor: number;
	cliMinor: number;
	cliPatch: number;
	prereleaseLabel?: string;
	osPlatform: string;
	osVersion: string;
	arch: string;
	nodeVersion: number;
	packageManager: "npm" | "pnpm" | "yarn" | "bun" | "unknown";
	deviceId: string;
	amplitude_session_id: number;
	amplitude_event_id: number;
	/** Stable within a detected agent conversation, without sending its raw ID. */
	agentSessionKey?: string;
	isFirstUsage: boolean;
	isCI: boolean;
	isInteractive: boolean;
	cliMode: CLIMode;
	agent: string | null;
	delegated: boolean;
}

export type CommandEventName = "cf command started" | "cf command finished";
export type CommandOutcome = "success" | "error" | "cancelled";

export const UNKNOWN_COMMAND_EVENT = "unknown command";

export interface SanitizedError {
	errorType: string | undefined;
	httpStatus?: number;
	errorCodes?: number[];
}

export interface CommandEventProperties extends CommonEventProperties {
	command: string;
	outcome?: CommandOutcome;
	sanitizedArgs: Record<string, unknown>;
	argsUsed: string[];
	argsCombination: string;
	durationMs?: number;
	/** Only populated for a completed `cf cli search` invocation. */
	searchQuery?: string;
	searchQueryTruncated?: boolean;
	errorType?: string;
	httpStatus?: number;
	errorCodes?: number[];
}

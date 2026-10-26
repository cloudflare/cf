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
	/** Whether a global cf handed this run to a project-local cf. */
	delegated: boolean;
	/**
	 * The delegating global cf's version. Present only on delegated runs
	 * whose global cf passes a valid version; `cliVersion` remains the
	 * version of the cf that runs the command.
	 */
	globalCliVersion?: string;
}

export type CommandEventName = "cf command started" | "cf command finished";
export type CommandOutcome = "success" | "error" | "cancelled";

export const UNKNOWN_COMMAND_EVENT = "unknown command";

/**
 * Why yargs could not resolve the invocation to a runnable command.
 * `surplus-positional` is the strict-commands check failing at a leaf, where
 * any extra positional counts as an unknown command.
 */
export type CommandResolutionFailureKind =
	| "unknown-subcommand"
	| "surplus-positional"
	| "suggested-command"
	| "missing-command";

/**
 * Raw resolution state captured from yargs when parsing fails. The unknown
 * tokens are user input; only their sanitized form may be sent.
 */
export interface CommandResolutionFailure {
	kind: CommandResolutionFailureKind;
	/** Registered command names yargs resolved before failing. */
	knownCommand: string[];
	knownCommandIsLeaf: boolean;
	unknownTokens: string[];
	/** A registered command name taken from yargs' "Did you mean" message. */
	suggestedCommand?: string;
}

/** Sent only when the command could not be resolved. */
export interface CommandResolutionProperties {
	resolutionFailure: CommandResolutionFailureKind;
	knownCommand: string;
	knownCommandIsLeaf: boolean;
	/** At most three tokens: cf command words or shape labels such as `<hex>`. */
	unknownTokens: string[];
	unknownTokenCount: number;
	suggestedCommand?: string;
	/** Flags that are not cf option names; counted, never named. */
	unknownFlagCount: number;
}

export interface SanitizedError {
	errorType: string | undefined;
	httpStatus?: number;
	errorCodes?: number[];
}

export interface CommandEventProperties
	extends CommonEventProperties, Partial<CommandResolutionProperties> {
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

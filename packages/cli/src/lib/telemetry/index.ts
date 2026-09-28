export {
	TELEMETRY_ENV_VAR,
	TELEMETRY_POLICY_DATE,
	getBannerLastShown,
	getDeviceId,
	getTelemetryFromEnv,
	isFirstUsage,
	resolveTelemetry,
	setBannerLastShown,
	setTelemetryPermission,
	type ResolvedTelemetry,
	type TelemetrySource,
} from "./config.js";
export {
	getTelemetryDispatcher,
	type TelemetryDispatcher,
} from "./dispatcher.js";
export {
	allTelemetryDispatchesSettled,
	beginTelemetryRun,
	markCommandReported,
	wasCommandReported,
} from "./lifecycle.js";
export {
	runWithTelemetry,
	withTelemetry,
	type CommandTelemetryMeta,
} from "./run.js";
export {
	sanitizeArgs,
	type ArgClassification,
	type ShortFlagAlias,
	type ShortFlagAliases,
} from "./sanitization.js";
export {
	UNKNOWN_COMMAND_EVENT,
	type CommandEventName,
	type CommandEventProperties,
	type CommandOutcome,
} from "./types.js";

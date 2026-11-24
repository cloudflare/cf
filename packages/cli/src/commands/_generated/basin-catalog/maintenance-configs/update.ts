/**
 * update command
 * @generated from apis/overlays/basin-catalog.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";
import { resolveFileToken } from "#lib/input-validation.js";

const parameters = {
	flags: {
		"compaction-state": {
			kind: "parsed",
			brief: "Specifies the state of maintenance operations.",
			optional: true,
			choices: ["enabled", "disabled"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "compaction-state", "text"),
		},
		"compaction-target-size-mb": {
			kind: "parsed",
			brief:
				'Sets the target file size for compaction in megabytes. Defaults to "128".',
			optional: true,
			choices: ["64", "128", "256", "512"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "compaction-target-size-mb", "text"),
		},
		"snapshot-expiration-max-snapshot-age": {
			kind: "parsed",
			brief: "Updates the maximum age for snapshots optionally.",
			optional: true,
			parse: String,
		},
		"snapshot-expiration-min-snapshots-to-keep": {
			kind: "parsed",
			brief: "Updates the minimum number of snapshots to retain optionally.",
			optional: true,
			parse: Number,
		},
		"snapshot-expiration-state": {
			kind: "parsed",
			brief: "Specifies the state of maintenance operations.",
			optional: true,
			choices: ["enabled", "disabled"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "snapshot-expiration-state", "text"),
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		body: {
			kind: "parsed",
			brief: "Contains request to update catalog maintenance configuration.",
			optional: true,
			parse: String,
		},
	},
	operands: [
		{
			placeholder: "bucket-name",
			brief: "Specifies the R2 bucket name.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "update <bucket-name>",
	describe: "Update catalog maintenance configuration",
	usage:
		"$0 basin-catalog maintenance-configs update <bucket-name>\n\nUpdate the maintenance configuration for a catalog. This allows you to enable or disable compaction and adjust target file sizes for optimization.",
	...parameters,
	loader: () => import("./update.handler.js"),
});

export default command;

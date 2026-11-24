/**
 * update command
 * @generated from apis/overlays/content-scan.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";
import { resolveFileToken } from "#lib/input-validation.js";

const parameters = {
	flags: {
		value: {
			kind: "parsed",
			brief: "The status value for Content Scanning.",
			optional: true,
			choices: ["enabled", "disabled"],
			parse: String,
			coerce: (value: string) => resolveFileToken(value, "value", "text"),
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		force: {
			kind: "boolean",
			brief: "Skip confirmation (useful in scripts and CI)",
			alias: "f",
			default: false,
		},
		body: {
			kind: "parsed",
			brief: "Content Scanning settings to update.",
			optional: true,
			parse: String,
		},
	},
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "update",
	describe: "Update the Content Scanning status for a zone.",
	usage:
		"$0 content-scan update\n\nUpdate the Content Scanning status by setting the status value to `enabled` or `disabled`. This is equivalent to calling the dedicated enable and disable endpoints.",
	...parameters,
	loader: () => import("./update.handler.js"),
});

export default command;

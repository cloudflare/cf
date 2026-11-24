/**
 * update command
 * @generated from apis/overlays/zero-trust.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"region-key": {
			kind: "parsed",
			brief: "The key of a Data Localization Suite region.",
			optional: true,
			parse: String,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		body: {
			kind: "parsed",
			brief: "Raw JSON request body (bypasses individual flags)",
			optional: true,
			parse: String,
		},
	},
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "update",
	describe: "Select region",
	usage:
		"$0 zero-trust region update\n\nSelects the region that the account uses for Cloudflare One. The region must be one of the account's available regions. Selecting the active region again has no effect.",
	...parameters,
	loader: () => import("./update.handler.js"),
});

export default command;

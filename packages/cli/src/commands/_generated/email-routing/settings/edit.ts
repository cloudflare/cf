/**
 * edit command
 * @generated from apis/overlays/email-routing.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		enabled: {
			kind: "boolean",
			brief:
				"State of your zone Email Routing settings. No-op on this endpoint - use `POST`/`DELETE /zones/{zone_id}/email/routing/dns`.",
			optional: true,
		},
		"skip-wizard": {
			kind: "boolean",
			brief: "Flag to check if the user skipped the configuration wizard.",
			optional: true,
		},
		"support-subaddress": {
			kind: "boolean",
			brief:
				"Whether subaddressing (plus-addressing) is honored when matching incoming mail against routing rules.",
			optional: true,
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
	command: "edit",
	describe: "Update Email Routing settings",
	usage:
		"$0 email-routing settings edit\n\nUpdate the settings for your Email Routing zone.",
	...parameters,
	loader: () => import("./edit.handler.js"),
});

export default command;

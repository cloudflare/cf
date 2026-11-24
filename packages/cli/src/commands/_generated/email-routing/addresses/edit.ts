/**
 * edit command
 * @generated from apis/overlays/email-routing.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";
import { resolveFileToken } from "#lib/input-validation.js";

const parameters = {
	flags: {
		status: {
			kind: "parsed",
			brief:
				"Destination address status. Non-admin callers may only set verified addresses back to unverified; setting to verified requires admin privileges.",
			optional: true,
			choices: ["unverified", "verified"],
			parse: String,
			coerce: (value: string) => resolveFileToken(value, "status", "text"),
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
	operands: [
		{
			placeholder: "destination-address-identifier",
			brief: "Destination address identifier.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "edit <destination-address-identifier>",
	describe: "Update destination address",
	usage:
		"$0 email-routing addresses edit <destination-address-identifier>\n\nUpdates the status of a specific destination address.",
	...parameters,
	loader: () => import("./edit.handler.js"),
});

export default command;

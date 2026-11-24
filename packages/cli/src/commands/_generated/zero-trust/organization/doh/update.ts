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
		"doh-jwt-duration": {
			kind: "parsed",
			brief:
				"The duration the DoH JWT is valid for. Must be in the format `300ms` or `2h45m`. Valid time units are: ns, us (or µs), ms, s, m, h.  Note that the maximum duration for this setting is the same as the key rotation period on the account. Default expiration is 24h",
			optional: true,
			parse: String,
		},
		"service-token-id": {
			kind: "parsed",
			brief:
				"The uuid of the service token you want to use for DoH authentication",
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
	describe: "Update your Zero Trust organization DoH settings",
	usage:
		"$0 zero-trust organization doh update\n\nUpdates the DoH settings for your Zero Trust organization.",
	...parameters,
	loader: () => import("./update.handler.js"),
});

export default command;

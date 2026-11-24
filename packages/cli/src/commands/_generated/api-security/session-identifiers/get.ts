/**
 * get command
 * @generated from apis/overlays/api-security.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		normalize: {
			kind: "boolean",
			brief:
				"Ensures that the configuration is written or retrieved in normalized fashion",
			optional: true,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get",
	describe: "Get session identifier settings",
	usage:
		"$0 api-security session-identifiers get\n\nReturns the authentication identifier characteristics configured for the zone. Header, cookie, or JWT claim values identify distinct API sessions.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;

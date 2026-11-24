/**
 * rotate command
 * @generated from apis/overlays/zero-trust.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"previous-client-secret-expires-at": {
			kind: "parsed",
			brief:
				"The expiration of the previous `client_secret`. If not provided, it defaults to the current timestamp in order to immediately expire the previous secret. If the service token was reported as leaked, this must not be in the future; the leaked secret is discarded immediately.",
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
	operands: [
		{ placeholder: "service-token-id", brief: "UUID.", parse: String },
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "rotate <service-token-id>",
	describe: "Rotate a service token",
	usage:
		"$0 zero-trust access service-tokens rotate <service-token-id>\n\nGenerates a new Client Secret for a service token and revokes the old one.",
	...parameters,
	loader: () => import("./rotate.handler.js"),
});

export default command;

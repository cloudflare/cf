/**
 * create command
 * @generated from apis/overlays/realtime.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		expires: {
			kind: "parsed",
			brief:
				"Optional expiry (RFC 3339). Defaults to 1 year from creation;\nrejected if more than 1 year in the future.\n",
			optional: true,
			parse: String,
		},
		label: {
			kind: "parsed",
			brief: "Optional, customer-set label.",
			optional: true,
			parse: String,
		},
		operations: {
			kind: "parsed",
			brief:
				"Non-empty subset of the V1 roles the token is allowed to\nperform. Signed into the token.\n",
			variadic: true,
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
		{
			placeholder: "relay-id",
			brief: "Relay unique identifier (32 hex characters).",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "create <relay-id>",
	describe: "Create a token",
	usage:
		"$0 realtime moq relays tokens create <relay-id>\n\nMints a new relay-scoped token and adds it to the relay's accepted-auth registry. The token value (secret) is shown once in the response. A relay may hold up to 10 tokens; creating an 11th is rejected.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;

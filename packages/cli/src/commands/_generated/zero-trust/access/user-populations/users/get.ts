/**
 * get command
 * @generated from apis/overlays/zero-trust.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"user-population-id": { kind: "parsed", brief: "UUID.", parse: String },
		attributes: {
			kind: "parsed",
			brief: "Comma-separated SCIM attributes to return.",
			optional: true,
			parse: String,
		},
		"excluded-attributes": {
			kind: "parsed",
			brief: "Comma-separated SCIM attributes to exclude from the response.",
			optional: true,
			parse: String,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [
		{
			placeholder: "user-id",
			brief: "The SCIM user identifier.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <user-id>",
	describe: "Get a user population user",
	usage:
		"$0 zero-trust access user-populations users get <user-id>\n\nFetches a SCIM user from a user population.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;

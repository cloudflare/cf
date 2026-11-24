/**
 * get command
 * @generated from apis/overlays/email-security.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [
		{
			placeholder: "pattern-id",
			brief: "URL ignore pattern identifier.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <pattern-id>",
	describe: "Get a URL ignore pattern",
	usage:
		"$0 email-security url-ignore-patterns get <pattern-id>\n\nReturns a single URL rewrite ignore pattern by its identifier.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;

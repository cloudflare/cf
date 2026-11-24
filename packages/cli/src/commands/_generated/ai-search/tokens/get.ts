/**
 * get command
 * @generated from apis/overlays/ai-search.ts
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
			placeholder: "token-id",
			brief: "Stored credential record ID.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <token-id>",
	describe: "Get a token",
	usage:
		"$0 ai-search tokens get <token-id>\n\nRetrieve a stored AI Search credential without exposing its secret.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;

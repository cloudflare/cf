/**
 * update command
 * @generated from apis/overlays/ai-search.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"api-token-id": {
			kind: "parsed",
			brief: "Cloudflare API token ID.",
			optional: true,
			parse: String,
		},
		"api-token": {
			kind: "parsed",
			brief: "Cloudflare API token value.",
			optional: true,
			parse: String,
		},
		legacy: {
			kind: "boolean",
			brief: "Whether the credential uses the legacy API key format.",
			optional: true,
		},
		name: {
			kind: "parsed",
			brief: "Human-readable name for the credential.",
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
			placeholder: "token-id",
			brief: "Stored credential record ID.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "update <token-id>",
	describe: "Update a token",
	usage:
		"$0 ai-search tokens update <token-id>\n\nReplace a stored AI Search credential and invalidate cached credentials for instances that use it.",
	...parameters,
	loader: () => import("./update.handler.js"),
});

export default command;

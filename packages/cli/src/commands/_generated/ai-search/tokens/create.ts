/**
 * create command
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
			default: true,
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
			placeholder: "name",
			brief: "Human-readable name for the credential.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "create <name>",
	describe: "Create a token",
	usage:
		"$0 ai-search tokens create <name>\n\nCreate a stored Cloudflare credential for an AI Search instance to access its data source.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;

/**
 * delete command
 * @generated from apis/overlays/ai-gateway.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"gateway-id": {
			kind: "parsed",
			brief: "Unique identifier of the AI Gateway within the account.",
			parse: String,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		force: {
			kind: "boolean",
			brief: "Skip confirmation (useful in scripts and CI)",
			alias: "f",
			default: false,
		},
	},
	operands: [
		{
			placeholder: "hostname",
			brief: "Custom hostname that you own, such as \`ai.example.com\`.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "delete <hostname>",
	describe: "Delete a custom domain",
	usage:
		"$0 ai-gateway custom-domains delete <hostname>\n\nDeletes a custom domain from an AI Gateway and removes its Cloudflare for SaaS custom hostname.",
	...parameters,
	loader: () => import("./delete.handler.js"),
});

export default command;

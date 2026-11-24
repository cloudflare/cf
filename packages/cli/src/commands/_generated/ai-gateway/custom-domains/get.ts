/**
 * get command
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
	command: "get <hostname>",
	describe: "Get a custom domain",
	usage:
		"$0 ai-gateway custom-domains get <hostname>\n\nRetrieves a custom domain attached to an AI Gateway, including its status and CNAME target.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;

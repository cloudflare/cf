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
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [{ placeholder: "id", brief: "ID", parse: String }],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <id>",
	describe: "Get a custom provider",
	usage:
		"$0 ai-gateway custom-providers get <id>\n\nRetrieves a custom provider, including its slug, base URL, and custom headers.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;

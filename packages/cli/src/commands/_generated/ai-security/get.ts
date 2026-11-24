/**
 * get command
 * @generated from apis/overlays/ai-security.ts
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
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get",
	describe: "Get the AI Security for Apps status for a zone.",
	usage:
		"$0 ai-security get\n\nGet the current AI Security for Apps status for the zone. While enabled, Cloudflare scans prompts sent to endpoints labeled `cf-llm` for personally identifiable information, unsafe topics, and prompt injection attempts.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;

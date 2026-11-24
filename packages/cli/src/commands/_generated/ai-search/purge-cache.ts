/**
 * purge-cache command
 * @generated from apis/overlays/ai-search.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		namespace: {
			kind: "parsed",
			brief: "Namespace to use for this operation.",
			default: "default",
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
			placeholder: "instance-id",
			brief: "AI Search instance ID.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "purge-cache <instance-id>",
	describe: "Purge search cache.",
	usage:
		"$0 ai-search purge-cache <instance-id>\n\nPurges all cached search results for an AI Search instance. A new internal cache key is generated, immediately orphaning all prior cached entries.",
	...parameters,
	loader: () => import("./purge-cache.handler.js"),
});

export default command;

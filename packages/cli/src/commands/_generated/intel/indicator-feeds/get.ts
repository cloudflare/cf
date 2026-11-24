/**
 * get command
 * @generated from apis/overlays/intel.ts
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
		{ placeholder: "feed-id", brief: "Indicator feed ID", parse: String },
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <feed-id>",
	describe: "Get indicator feed metadata",
	usage:
		"$0 intel indicator-feeds get <feed-id>\n\nRetrieves details for a specific custom threat indicator feed.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;

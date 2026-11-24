/**
 * data command
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
	command: "data <feed-id>",
	describe: "Get indicator feed data",
	usage:
		"$0 intel indicator-feeds data <feed-id>\n\nRetrieves the raw data entries in a custom threat indicator feed.",
	...parameters,
	loader: () => import("./data.handler.js"),
});

export default command;

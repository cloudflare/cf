/**
 * update command
 * @generated from apis/overlays/intel.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		description: {
			kind: "parsed",
			brief: "The new description of the feed",
			optional: true,
			parse: String,
		},
		"is-attributable": {
			kind: "boolean",
			brief: "The new is_attributable value of the feed",
			optional: true,
		},
		"is-downloadable": {
			kind: "boolean",
			brief: "The new is_downloadable value of the feed",
			optional: true,
		},
		"is-public": {
			kind: "boolean",
			brief: "The new is_public value of the feed",
			optional: true,
		},
		name: {
			kind: "parsed",
			brief: "The new name of the feed",
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
		{ placeholder: "feed-id", brief: "Indicator feed ID", parse: String },
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "update <feed-id>",
	describe: "Update indicator feed metadata",
	usage:
		"$0 intel indicator-feeds update <feed-id>\n\nRevises details for a specific custom threat indicator feed.",
	...parameters,
	loader: () => import("./update.handler.js"),
});

export default command;

/**
 * list command
 * @generated from apis/overlays/workers-for-platforms.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"dispatch-namespace": {
			kind: "parsed",
			brief: "Name of the Workers for Platforms dispatch namespace.",
			parse: String,
		},
		tags: {
			kind: "parsed",
			brief:
				"Filter scripts by tags. Format: comma-separated list of tag:allowed pairs where allowed is 'yes' or 'no'.",
			optional: true,
			parse: String,
		},
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
	command: "list",
	describe: "List Workers for Platforms Scripts",
	usage:
		"$0 workers-for-platforms dispatch-namespaces scripts list\n\nFetch a list of scripts uploaded to a Workers for Platforms dispatch namespace.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;

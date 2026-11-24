/**
 * list command
 * @generated from apis/overlays/workers.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		worker: {
			kind: "parsed",
			brief: "Name of the script.",
			optional: true,
			alias: ["script-name", "worker-id"],
			parse: String,
		},
		since: {
			kind: "parsed",
			brief: "Start of the deployment creation time range, inclusive.",
			optional: true,
			parse: String,
		},
		until: {
			kind: "parsed",
			brief: "End of the deployment creation time range, inclusive.",
			optional: true,
			parse: String,
		},
		page: {
			kind: "parsed",
			brief: "Current page.",
			optional: true,
			parse: Number,
		},
		"per-page": {
			kind: "parsed",
			brief: "Items per page.",
			optional: true,
			parse: Number,
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
	describe: "List Worker Deployments",
	usage:
		"$0 workers deployments list\n\nList Worker deployments. The first deployment in the list is the latest deployment actively serving traffic.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;

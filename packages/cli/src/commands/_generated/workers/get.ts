/**
 * get command
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
			brief: "Identifier for the Worker, which can be ID or name.",
			optional: true,
			alias: ["script-name", "worker-id"],
			grouped: true,
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
			placeholder: "worker",
			brief: "Identifier for the Worker, which can be ID or name.",
			parse: String,
			optional: true,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get [worker]",
	describe: "Get Worker",
	usage: "$0 workers get [worker]\n\nGet details about a specific Worker.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;

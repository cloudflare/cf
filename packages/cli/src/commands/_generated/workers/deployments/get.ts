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
			brief: "Name of the script.",
			optional: true,
			alias: ["script-name", "worker-id"],
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
			placeholder: "deployment-id",
			brief: "Identifier of the Worker Deployment.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <deployment-id>",
	describe: "Get Worker Deployment",
	usage:
		"$0 workers deployments get <deployment-id>\n\nGet information about a Worker Deployment.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;

/**
 * get command
 * @generated from apis/overlays/builds.ts
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
			brief: "Name or script tag of the Worker.",
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
			placeholder: "deploy-hook-uuid",
			brief: "UUID of the deploy hook, as returned by deploy-hooks list.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <deploy-hook-uuid>",
	describe: "Get a deploy hook",
	usage:
		"$0 builds deploy-hooks get <deploy-hook-uuid>\n\nRetrieve the name, branch, Worker identifier, and timestamps for a deploy hook.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;

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
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [
		{
			placeholder: "worker",
			brief: "Script tag of the Worker.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <worker>",
	describe: "Get Worker build configuration",
	usage:
		"$0 builds workers get <worker>\n\nRetrieve the repository and production build settings associated with a Worker tag.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;

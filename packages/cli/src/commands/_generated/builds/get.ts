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
			placeholder: "build-uuid",
			brief: "UUID of the build, as returned by builds list.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <build-uuid>",
	describe: "Get a Workers build",
	usage:
		"$0 builds get <build-uuid>\n\nRetrieve status, outcome, timestamps, trigger settings, and source metadata for a build UUID.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;

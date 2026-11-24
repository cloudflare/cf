/**
 * cancel command
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
	command: "cancel <build-uuid>",
	describe: "Cancel a Workers build",
	usage: "$0 builds cancel <build-uuid>\n\nCancel a queued or running build.",
	...parameters,
	loader: () => import("./cancel.handler.js"),
});

export default command;

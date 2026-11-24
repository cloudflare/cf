/**
 * retry command
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
			brief: "Script tag of the Worker.",
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
			placeholder: "build-uuid",
			brief: "UUID of the build, as returned by builds list.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "retry <build-uuid>",
	describe: "Retry a Worker build",
	usage:
		"$0 builds retry <build-uuid>\n\nStart a new build from the branch and commit of a stopped build.",
	...parameters,
	loader: () => import("./retry.handler.js"),
});

export default command;

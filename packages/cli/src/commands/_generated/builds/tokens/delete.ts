/**
 * delete command
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
		force: {
			kind: "boolean",
			brief: "Skip confirmation (useful in scripts and CI)",
			alias: "f",
			default: false,
		},
	},
	operands: [
		{
			placeholder: "build-token-uuid",
			brief: "UUID of the build token used when deploying the Worker.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "delete <build-token-uuid>",
	describe: "Delete a build token",
	usage:
		"$0 builds tokens delete <build-token-uuid>\n\nDelete a stored build token owned by the current user.",
	...parameters,
	loader: () => import("./delete.handler.js"),
});

export default command;

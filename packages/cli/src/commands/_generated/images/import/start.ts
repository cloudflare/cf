/**
 * start command
 * @generated from apis/overlays/images.ts
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
			placeholder: "migration-id",
			brief: "Sourcing kit resource identifier.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "start <migration-id>",
	describe: "Start a migration",
	usage:
		"$0 images import start <migration-id>\n\nStart a pending CF Images import.",
	...parameters,
	loader: () => import("./start.handler.js"),
});

export default command;

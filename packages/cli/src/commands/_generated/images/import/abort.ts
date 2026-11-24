/**
 * abort command
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
	command: "abort <migration-id>",
	describe: "Abort a migration",
	usage:
		"$0 images import abort <migration-id>\n\nAbort a running CF Images import. Already imported images will remain.",
	...parameters,
	loader: () => import("./abort.handler.js"),
});

export default command;

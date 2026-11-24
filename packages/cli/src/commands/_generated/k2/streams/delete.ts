/**
 * delete command
 * @generated from apis/overlays/k2.ts
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
			placeholder: "stream-id",
			brief: "Specifies the public ID of the K2 stream.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "delete <stream-id>",
	describe: "Delete K2 stream",
	usage:
		"$0 k2 streams delete <stream-id>\n\nDelete a K2 stream in an account. Deleting a stream that does not exist also succeeds.",
	...parameters,
	loader: () => import("./delete.handler.js"),
});

export default command;

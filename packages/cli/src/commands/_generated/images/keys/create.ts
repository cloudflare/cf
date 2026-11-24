/**
 * create command
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
			placeholder: "signing-key-name",
			brief: "Signing key name",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "create <signing-key-name>",
	describe: "Create a new Signing Key",
	usage:
		"$0 images keys create <signing-key-name>\n\nCreate a new CF Images signing key with specified name. Returns all keys available.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;

/**
 * get command
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
	command: "get <migration-id>",
	describe: "Get sourcing kit migration",
	usage:
		"$0 images import get <migration-id>\n\nGet the configuration and status of a CF Images import.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;

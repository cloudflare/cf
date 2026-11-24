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
			placeholder: "source-id",
			brief: "Sourcing kit resource identifier.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <source-id>",
	describe: "Get sourcing kit source",
	usage:
		"$0 images import sources get <source-id>\n\nGet details of a source configured for CF Images imports.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;

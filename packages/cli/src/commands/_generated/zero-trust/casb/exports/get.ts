/**
 * get command
 * @generated from apis/overlays/zero-trust.ts
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
			placeholder: "id",
			brief: "Unique identifier for the export job",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <id>",
	describe: "Get a single export job",
	usage:
		"$0 zero-trust casb exports get <id>\n\nRetrieves a single export job by its unique identifier",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;

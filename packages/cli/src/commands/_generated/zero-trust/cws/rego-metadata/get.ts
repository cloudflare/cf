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
			placeholder: "rego-metadata-id",
			brief: "ID of the rego metadata document to retrieve",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <rego-metadata-id>",
	describe: "Get a rego metadata document by ID",
	usage:
		"$0 zero-trust cws rego-metadata get <rego-metadata-id>\n\nReturns the Rego metadata document with the specified ID.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;

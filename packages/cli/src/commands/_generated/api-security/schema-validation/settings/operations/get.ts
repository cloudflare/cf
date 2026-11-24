/**
 * get command
 * @generated from apis/overlays/api-security.ts
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
			placeholder: "operation-id",
			brief: "Identifier for the operation",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <operation-id>",
	describe: "Get per-operation schema validation setting",
	usage:
		"$0 api-security schema-validation settings operations get <operation-id>\n\nRetrieves the schema validation settings configured for a specific API operation.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;

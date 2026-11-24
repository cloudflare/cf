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
			placeholder: "finding-type-id",
			brief: "A UUID string identifying the finding type.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <finding-type-id>",
	describe: "Get finding by ID",
	usage:
		"$0 zero-trust casb finding-types get <finding-type-id>\n\nRetrieve a specific finding type by its unique identifier.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;

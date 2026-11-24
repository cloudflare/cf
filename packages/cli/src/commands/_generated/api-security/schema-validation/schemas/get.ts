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
		"omit-source": {
			kind: "boolean",
			brief:
				"Omit the source-files of schemas and only retrieve their meta-data.",
			optional: true,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [
		{
			placeholder: "schema-id",
			brief: "The unique identifier of the schema",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <schema-id>",
	describe: "Get details of a schema",
	usage:
		"$0 api-security schema-validation schemas get <schema-id>\n\nGets the contents and metadata of a specific OpenAPI schema uploaded to API Security.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;

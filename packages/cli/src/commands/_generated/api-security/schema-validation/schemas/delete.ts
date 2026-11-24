/**
 * delete command
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
		force: {
			kind: "boolean",
			brief: "Skip confirmation (useful in scripts and CI)",
			alias: "f",
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
	command: "delete <schema-id>",
	describe: "Delete a schema",
	usage:
		"$0 api-security schema-validation schemas delete <schema-id>\n\nPermanently removes an uploaded OpenAPI schema from API Security. Operations using this schema will lose their validation rules.",
	...parameters,
	loader: () => import("./delete.handler.js"),
});

export default command;

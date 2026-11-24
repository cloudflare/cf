/**
 * validate-sql command
 * @generated from apis/overlays/pipelines.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		sql: {
			kind: "parsed",
			brief: "Specifies SQL to validate.",
			optional: true,
			parse: String,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		body: {
			kind: "parsed",
			brief: "Raw JSON request body (bypasses individual flags)",
			optional: true,
			parse: String,
		},
	},
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "validate-sql",
	describe: "Validate SQL",
	usage:
		"$0 pipelines validate-sql\n\nValidates that the Pipelines SQL is correct.",
	...parameters,
	loader: () => import("./validate-sql.handler.js"),
});

export default command;

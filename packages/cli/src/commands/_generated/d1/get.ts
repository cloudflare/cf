/**
 * get command
 * @generated from apis/overlays/d1.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		fields: {
			kind: "parsed",
			brief:
				"Comma-separated list of fields to include in the response. When omitted,\nall fields are returned.",
			variadic: true,
			optional: true,
			choices: [
				"uuid",
				"name",
				"created_at",
				"version",
				"jurisdiction",
				"num_tables",
				"file_size",
				"running_in_region",
				"read_replication",
			],
			parse: String,
			coerce: (values: string[]) => values.flatMap((value) => value.split(",")),
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [
		{ placeholder: "database-id", brief: "Database ID", parse: String },
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <database-id>",
	describe: "Get D1 Database",
	usage: "$0 d1 get <database-id>\n\nGet details for a specific D1 database.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;

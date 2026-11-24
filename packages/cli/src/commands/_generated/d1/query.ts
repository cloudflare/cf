/**
 * query command
 * @generated from apis/overlays/d1.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		params: {
			kind: "parsed",
			brief: "The params field",
			variadic: true,
			optional: true,
			parse: String,
		},
		sql: {
			kind: "parsed",
			brief:
				"Your SQL query. Supports multiple statements, joined by semicolons, which will be executed as a batch.",
			optional: true,
			parse: String,
		},
		batch: {
			kind: "parsed",
			brief:
				'The batch field. Provide as a JSON array of objects or @path/to/file.json. Shape: [{"sql": string, "params"?: [string]}]. ? marks optional keys.',
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
			brief: "A single query object or a batch query object",
			optional: true,
			parse: String,
		},
	},
	operands: [
		{
			placeholder: "database-id",
			brief: "D1 database identifier (UUID).",
			parse: String,
		},
	],
	rules(rules) {
		rules.conflicts("params", ["batch"]);
		rules.implies("params", ["sql"]);
		rules.conflicts("sql", ["batch"]);
		rules.conflicts("batch", ["params", "sql"]);
	},
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "query <database-id>",
	describe: "Query D1 Database",
	usage:
		"$0 d1 query <database-id>\n\nExecute a SQL query against a D1 database and return results as objects.",
	...parameters,
	loader: () => import("./query.handler.js"),
});

export default command;

/**
 * restore command
 * @generated from apis/overlays/d1.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		bookmark: {
			kind: "parsed",
			brief:
				"A bookmark to restore the database to. Required if `timestamp` is not provided.",
			optional: true,
			parse: String,
		},
		timestamp: {
			kind: "parsed",
			brief:
				"An ISO 8601 timestamp to restore the database to. Required if `bookmark` is not provided.",
			optional: true,
			parse: String,
		},
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
			placeholder: "database-id",
			brief: "D1 database identifier (UUID).",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "restore <database-id>",
	describe: "Restore D1 Database to a bookmark or point in time",
	usage:
		"$0 d1 time-travel restore <database-id>\n\nRestore a D1 database to a previous point in time either via a bookmark or a timestamp.",
	...parameters,
	loader: () => import("./restore.handler.js"),
});

export default command;

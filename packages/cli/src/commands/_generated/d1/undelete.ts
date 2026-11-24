/**
 * undelete command
 * @generated from apis/overlays/d1.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"new-name": {
			kind: "parsed",
			brief:
				"Restore the database with this name instead of the name it had when it was deleted. Required if another database in the account already uses that name.",
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
		body: {
			kind: "parsed",
			brief: "Raw JSON request body (bypasses individual flags)",
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
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "undelete <database-id>",
	describe: "Undelete D1 Database",
	usage:
		"$0 d1 undelete <database-id>\n\nRestore a deleted D1 database. The database is restored with the name it had when it was deleted, unless `new_name` is provided. The restored database counts against the account's limits. Undeleting a database that is not deleted succeeds without changes, unless `new_name` differs from its current name which errors. A database can only be undeleted within 7 days (7 * 24 hours) of its deletion. Once a database is undeleted, Time Travel (point-in-time recovery) cannot restore it to a bookmark or timestamp at or before the undeletion. Only states after the undeletion can be restored.",
	...parameters,
	loader: () => import("./undelete.handler.js"),
});

export default command;

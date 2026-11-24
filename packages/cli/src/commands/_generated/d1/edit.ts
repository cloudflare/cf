/**
 * edit command
 * @generated from apis/overlays/d1.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";
import { resolveFileToken } from "#lib/input-validation.js";

const parameters = {
	flags: {
		"read-replication-mode": {
			kind: "parsed",
			brief:
				"The read replication mode for the database. Use 'auto' to create replicas and allow D1 automatically place them around the world, or 'disabled' to not use any database replicas (it can take a few hours for all replicas to be deleted).",
			optional: true,
			choices: ["auto", "disabled"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "read-replication-mode", "text"),
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
	command: "edit <database-id>",
	describe: "Update D1 Database partially",
	usage:
		"$0 d1 edit <database-id>\n\nPartially update a D1 database's configuration.",
	...parameters,
	loader: () => import("./edit.handler.js"),
});

export default command;

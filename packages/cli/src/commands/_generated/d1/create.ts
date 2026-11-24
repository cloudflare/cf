/**
 * create command
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
		jurisdiction: {
			kind: "parsed",
			brief:
				"Specify the location to restrict the D1 database to run and store data. If this option is present, the location hint is ignored.",
			optional: true,
			choices: ["eu", "fedramp", "us"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "jurisdiction", "text"),
		},
		name: {
			kind: "parsed",
			brief: "D1 database name.",
			optional: true,
			parse: String,
		},
		"primary-location-hint": {
			kind: "parsed",
			brief:
				"Specify the region to create the D1 primary, if available. If this option is omitted, the D1 will be created as close as possible to the current user.",
			optional: true,
			choices: ["wnam", "enam", "weur", "eeur", "apac", "oc"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "primary-location-hint", "text"),
		},
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
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "create",
	describe: "Create D1 Database",
	usage: "$0 d1 create\n\nCreate a new D1 database in your account.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;

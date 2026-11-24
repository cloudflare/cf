/**
 * update command
 * @generated from apis/overlays/cloudforce-one.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"alert-enabled": {
			kind: "boolean",
			brief:
				"Deprecated and ignored: saved-query alerting and rules were removed.",
			optional: true,
		},
		"alert-rollup-enabled": {
			kind: "boolean",
			brief:
				"Deprecated and ignored: saved-query alerting and rules were removed.",
			optional: true,
		},
		name: {
			kind: "parsed",
			brief: "Unique name for the saved query",
			optional: true,
			parse: String,
		},
		"query-json": {
			kind: "parsed",
			brief: "JSON string containing the query parameters",
			optional: true,
			parse: String,
		},
		"rule-enabled": {
			kind: "boolean",
			brief:
				"Deprecated and ignored: saved-query alerting and rules were removed.",
			optional: true,
		},
		"rule-scope": {
			kind: "parsed",
			brief:
				"Deprecated and ignored: saved-query alerting and rules were removed.",
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
	operands: [
		{ placeholder: "query-id", brief: "Event query ID", parse: String },
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "update <query-id>",
	describe: "Update a saved event query",
	usage:
		"$0 cloudforce-one threat-intel events queries update <query-id>\n\nUpdates the given fields of a saved event query.",
	...parameters,
	loader: () => import("./update.handler.js"),
});

export default command;

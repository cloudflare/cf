/**
 * create command
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
				"Send an hourly notification when new events match this saved view. Receive it by adding the view to a Threat Events saved query notification policy.",
			default: false,
		},
		"alert-rollup-enabled": {
			kind: "boolean",
			brief:
				"Deprecated and ignored: saved-query alerting and rules were removed.",
			default: false,
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
			default: false,
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
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "create",
	describe: "Create a saved event query",
	usage:
		"$0 cloudforce-one threat-intel events queries create\n\nSaves an event query under a unique `name`. `query_json` holds the query parameters as a JSON string.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;

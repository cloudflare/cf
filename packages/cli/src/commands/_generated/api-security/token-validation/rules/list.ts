/**
 * list command
 * @generated from apis/overlays/api-security.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"per-page": {
			kind: "parsed",
			brief: "Maximum number of results per page.",
			optional: true,
			parse: Number,
		},
		page: {
			kind: "parsed",
			brief: "Page number of paginated results.",
			optional: true,
			parse: Number,
		},
		"token-configuration": {
			kind: "parsed",
			brief: "Select rules using any of these token configurations.",
			variadic: true,
			optional: true,
			parse: String,
		},
		action: {
			kind: "enum",
			brief:
				"Action to take on requests that match operations included in `selector` and fail `expression`.",
			values: ["log", "block"],
			optional: true,
		},
		enabled: {
			kind: "boolean",
			brief: "Toggle rule on or off.",
			optional: true,
		},
		id: {
			kind: "parsed",
			brief: "Select rules with these IDs.",
			optional: true,
			parse: String,
		},
		"rule-id": {
			kind: "parsed",
			brief: "Select rules with these IDs.",
			optional: true,
			parse: String,
		},
		host: {
			kind: "parsed",
			brief: "Select rules with this host in `include`.",
			optional: true,
			parse: String,
		},
		hostname: {
			kind: "parsed",
			brief: "Select rules with this host in `include`.",
			optional: true,
			parse: String,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "list",
	describe: "List token validation rules",
	usage:
		"$0 api-security token-validation rules list\n\nLists token validation rules for the zone, with filters for configuration, action, state, ID, and host.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;

/**
 * list command
 * @generated from apis/overlays/email-security.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		page: {
			kind: "parsed",
			brief: "Current page within paginated list of results.",
			optional: true,
			parse: Number,
		},
		"per-page": {
			kind: "parsed",
			brief: "The number of results per page. Maximum value is 1000.",
			optional: true,
			parse: Number,
		},
		search: {
			kind: "parsed",
			brief: "Search term for filtering records. Behavior may change.",
			optional: true,
			parse: String,
		},
		order: {
			kind: "enum",
			brief: "Field to sort by.",
			values: ["domain", "created_at"],
			optional: true,
		},
		direction: {
			kind: "enum",
			brief: "The sorting direction.",
			values: ["asc", "desc"],
			optional: true,
		},
		"allowed-delivery-mode": {
			kind: "enum",
			brief: "Delivery mode to filter by.",
			values: ["DIRECT", "BCC", "JOURNAL", "API", "RETRO_SCAN"],
			optional: true,
		},
		domain: {
			kind: "parsed",
			brief: "Domain names to filter by.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"active-delivery-mode": {
			kind: "enum",
			brief: "Currently active delivery mode to filter by.",
			values: ["DIRECT", "BCC", "JOURNAL", "API", "RETRO_SCAN"],
			optional: true,
		},
		"integration-id": {
			kind: "parsed",
			brief: "Integration ID to filter by.",
			optional: true,
			parse: String,
		},
		status: {
			kind: "enum",
			brief: "Filters response to domains with the provided status.",
			values: ["PENDING", "ACTIVE", "FAILED", "TIMEOUT"],
			optional: true,
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
	describe: "List protected email domains",
	usage:
		"$0 email-security domains list\n\nReturns a paginated list of email domains protected by Email Security. Includes domain configuration, delivery modes, and authorization status. Supports filtering by delivery mode and integration ID.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;

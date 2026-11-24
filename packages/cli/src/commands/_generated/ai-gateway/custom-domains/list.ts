/**
 * list command
 * @generated from apis/overlays/ai-gateway.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"gateway-id": {
			kind: "parsed",
			brief: "Unique identifier of the AI Gateway within the account.",
			parse: String,
		},
		page: { kind: "parsed", brief: "Page", optional: true, parse: Number },
		"per-page": {
			kind: "parsed",
			brief: "Per page",
			optional: true,
			parse: Number,
		},
		status: {
			kind: "enum",
			brief: "Status",
			values: ["initializing", "pending_dcv", "active", "blocked", "error"],
			optional: true,
		},
		search: {
			kind: "parsed",
			brief: "Search by hostname",
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
	describe: "List custom domains",
	usage:
		"$0 ai-gateway custom-domains list\n\nLists the custom domains attached to an AI Gateway, including the certificate and validation status of each domain.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;

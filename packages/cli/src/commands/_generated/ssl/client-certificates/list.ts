/**
 * list command
 * @generated from apis/overlays/ssl.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		status: {
			kind: "enum",
			brief: "Client Certitifcate Status to filter results by.",
			values: [
				"all",
				"active",
				"pending_reactivation",
				"pending_revocation",
				"revoked",
			],
			optional: true,
		},
		page: {
			kind: "parsed",
			brief: "Page number of paginated results.",
			optional: true,
			parse: Number,
		},
		"per-page": {
			kind: "parsed",
			brief: "Number of records per page.",
			optional: true,
			parse: Number,
		},
		limit: {
			kind: "parsed",
			brief: "Limit to the number of records returned.",
			optional: true,
			parse: Number,
		},
		offset: {
			kind: "parsed",
			brief: "Offset the results.",
			optional: true,
			parse: Number,
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
	describe: "List Client Certificates",
	usage:
		"$0 ssl client-certificates list\n\nList all of your Zone's API Shield mTLS Client Certificates by Status and/or using Pagination.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;

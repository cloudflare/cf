/**
 * list command
 * @generated from apis/overlays/custom-csrs.ts
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
			brief: "Page number of paginated results.",
			optional: true,
			parse: Number,
		},
		"per-page": {
			kind: "parsed",
			brief: "Number of custom CSRs per page.",
			optional: true,
			parse: Number,
		},
		order: {
			kind: "enum",
			brief: "The field to sort the returned custom CSRs by.",
			values: ["name", "account_tag", "created_at"],
			optional: true,
		},
		direction: {
			kind: "enum",
			brief: "The direction to sort by.",
			values: ["asc", "desc"],
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
	describe: "List Custom CSRs",
	usage:
		"$0 custom-csrs list\n\nList all custom Certificate Signing Requests (CSRs) for an account or zone.\n\nRuns against your account. Pass --zone to run against a zone instead. CLOUDFLARE_ZONE_ID is ignored.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;

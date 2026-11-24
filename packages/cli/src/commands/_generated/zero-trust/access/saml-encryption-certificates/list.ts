/**
 * list command
 * @generated from apis/overlays/zero-trust.ts
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
			brief: "Maximum number of results per page.",
			optional: true,
			parse: Number,
		},
		id: {
			kind: "parsed",
			brief:
				"Filter by SAML certificate set UID. Accepts a comma-separated list of UIDs.",
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
	describe: "List SAML certificate sets",
	usage:
		"$0 zero-trust access saml-encryption-certificates list\n\nReturns a paginated list of the organization's SAML encryption certificate sets. Each certificate set includes the current and (if present) previous certificates.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;

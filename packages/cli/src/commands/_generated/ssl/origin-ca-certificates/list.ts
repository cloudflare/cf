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
		"zone-id": {
			kind: "parsed",
			brief: "Identifier.",
			optional: true,
			parse: String,
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
	describe: "List Certificates",
	usage:
		"$0 ssl origin-ca-certificates list\n\nList all existing Origin CA certificates for a given zone. Revoked certificates are not included. You can use an Origin CA Key as your User Service Key or an API token when calling this endpoint ([see above](#requests)).",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;

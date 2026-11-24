/**
 * list command
 * @generated from apis/overlays/resource-sharing.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"share-id": {
			kind: "parsed",
			brief: "Share identifier tag.",
			parse: String,
		},
		"include-resources": {
			kind: "boolean",
			brief: "Include resources in the response.",
			optional: true,
		},
		page: {
			kind: "parsed",
			brief: "Page number. Defaults to `1` when omitted.",
			optional: true,
			parse: Number,
		},
		"per-page": {
			kind: "parsed",
			brief:
				"Number of objects to return per page. Defaults to `20` when omitted.",
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
	describe: "List share recipients by share ID",
	usage:
		'$0 resource-sharing recipients list\n\nList share recipients by share ID. Returns **all** recipients regardless of their `association_status` (associating, associated, disassociating, disassociated). Callers that want only "active" recipients must filter client-side on the `association_status` field.',
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;

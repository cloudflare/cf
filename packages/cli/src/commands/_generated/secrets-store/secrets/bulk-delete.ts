/**
 * bulk-delete command
 * @generated from apis/overlays/secrets-store.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"store-id": { kind: "parsed", brief: "Store identifier.", parse: String },
		ids: {
			kind: "parsed",
			brief: "List of secret identifier tags to delete.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		force: {
			kind: "boolean",
			brief: "Skip confirmation (useful in scripts and CI)",
			alias: "f",
			default: false,
		},
		body: {
			kind: "parsed",
			brief: "Request body for bulk deleting secrets.",
			optional: true,
			parse: String,
		},
	},
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "bulk-delete",
	describe: "Delete secrets",
	usage: "$0 secrets-store secrets bulk-delete\n\nDeletes one or more secrets.",
	...parameters,
	loader: () => import("./bulk-delete.handler.js"),
});

export default command;

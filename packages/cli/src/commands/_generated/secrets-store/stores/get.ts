/**
 * get command
 * @generated from apis/overlays/secrets-store.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [
		{ placeholder: "store-id", brief: "Store identifier.", parse: String },
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <store-id>",
	describe: "Get a store by ID",
	usage:
		"$0 secrets-store stores get <store-id>\n\nReturns details of a single store.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;

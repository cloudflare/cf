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
		"store-id": { kind: "parsed", brief: "Store identifier.", parse: String },
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [
		{ placeholder: "secret-id", brief: "Secret identifier.", parse: String },
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <secret-id>",
	describe: "Get a secret by ID",
	usage:
		"$0 secrets-store secrets get <secret-id>\n\nReturns details of a single secret.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;

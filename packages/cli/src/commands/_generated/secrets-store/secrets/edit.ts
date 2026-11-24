/**
 * edit command
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
		comment: {
			kind: "parsed",
			brief: "Freeform text describing the secret.",
			optional: true,
			parse: String,
		},
		scopes: {
			kind: "parsed",
			brief:
				"The list of services that can use this secret, or null when the secret inherits its store's scopes. Set it to null in a patch to inherit again. An empty list lets no service use the secret.",
			variadic: true,
			optional: true,
			parse: String,
		},
		value: {
			kind: "parsed",
			brief:
				"The value of the secret. Maximum 64 KiB (65,536 bytes). Note that this is 'write only' - the API never returns this value; it exists only to create or modify secrets.",
			optional: true,
			parse: String,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		body: {
			kind: "parsed",
			brief: "Raw JSON request body (bypasses individual flags)",
			optional: true,
			parse: String,
		},
	},
	operands: [
		{ placeholder: "secret-id", brief: "Secret identifier.", parse: String },
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "edit <secret-id>",
	describe: "Patch a secret",
	usage:
		"$0 secrets-store secrets edit <secret-id>\n\nUpdates a single secret.",
	...parameters,
	loader: () => import("./edit.handler.js"),
});

export default command;

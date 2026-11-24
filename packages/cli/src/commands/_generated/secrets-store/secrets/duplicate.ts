/**
 * duplicate command
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
		name: {
			kind: "parsed",
			brief: "The name of the secret.",
			optional: true,
			parse: String,
		},
		scopes: {
			kind: "parsed",
			brief:
				"The list of services that can use this secret. Omit it on create or duplicate to inherit the store's scopes. An empty list lets no service use the secret.",
			variadic: true,
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
	command: "duplicate <secret-id>",
	describe: "Duplicate Secret",
	usage:
		"$0 secrets-store secrets duplicate <secret-id>\n\nCreates a duplicate of the secret, keeping the value.",
	...parameters,
	loader: () => import("./duplicate.handler.js"),
});

export default command;

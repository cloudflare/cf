/**
 * create command
 * @generated from apis/overlays/kv.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";
import { resolveFileToken } from "#lib/input-validation.js";

const parameters = {
	flags: {
		jurisdiction: {
			kind: "parsed",
			brief:
				"Specify the jurisdiction to restrict the KV namespace to durably store data within. Can only be set at namespace creation time.",
			optional: true,
			choices: ["eu", "fedramp", "us"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "jurisdiction", "text"),
		},
		"namespace-mode": {
			kind: "parsed",
			brief:
				"The mode of the Workers KV namespace. Specify `instant` when creating a namespace to create a KV Instant namespace. Omit this field when creating a namespace to create a classic namespace. Currently, `instant` is the only supported explicit value.",
			optional: true,
			choices: ["instant"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "namespace-mode", "text"),
		},
		title: {
			kind: "parsed",
			brief: "Human-readable string name for a Workers KV namespace.",
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
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "create",
	describe: "Create a namespace",
	usage:
		"$0 kv namespaces create\n\nCreates a Workers KV namespace in the specified account with the given title. Returns `400` if the account already owns a namespace with that title; an existing namespace must be explicitly deleted before it can be replaced. An optional jurisdiction restricts where data is durably stored and can only be set at creation time.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;

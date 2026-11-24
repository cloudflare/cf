/**
 * create command
 * @generated from apis/overlays/images.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";
import { resolveFileToken } from "#lib/input-validation.js";

const parameters = {
	flags: {
		"conflict-behaviour": {
			kind: "parsed",
			brief: "How to handle objects that already exist at the destination.",
			default: "skip",
			choices: ["skip", "overwrite"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "conflict-behaviour", "text"),
		},
		"excluded-content-types": {
			kind: "parsed",
			brief: "Content types to skip during migration.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"path-prefix": {
			kind: "parsed",
			brief: "Prefix to prepend to image custom IDs.",
			optional: true,
			parse: String,
		},
		"root-directory": {
			kind: "parsed",
			brief: "Only import objects under this prefix in the source bucket.",
			optional: true,
			parse: String,
		},
		"source-id": {
			kind: "parsed",
			brief: "The identifier of the source to migrate from.",
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
	describe: "Create a sourcing kit migration",
	usage:
		"$0 images import create\n\nCreate a pending CF Images import from a configured source.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;

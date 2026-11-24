/**
 * create command
 * @generated from apis/overlays/artifacts.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";
import { resolveFileToken } from "#lib/input-validation.js";

const parameters = {
	flags: {
		repo: {
			kind: "parsed",
			brief: "The repo field",
			optional: true,
			parse: String,
		},
		scope: {
			kind: "parsed",
			brief: "The scope field",
			optional: true,
			choices: ["read", "write"],
			parse: String,
			coerce: (value: string) => resolveFileToken(value, "scope", "text"),
		},
		ttl: {
			kind: "parsed",
			brief: "The ttl field",
			optional: true,
			parse: Number,
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
		{
			placeholder: "namespace",
			brief: "Artifacts namespace name.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "create <namespace>",
	describe: "Create a repository token",
	usage:
		"$0 artifacts namespaces tokens create <namespace>\n\nCreates a scoped Git token for a repository.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;

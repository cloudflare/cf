/**
 * create command
 * @generated from apis/overlays/zero-trust.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";
import { resolveFileToken } from "#lib/input-validation.js";

const parameters = {
	flags: {
		"default-action": {
			kind: "parsed",
			brief: "Default action when no entry matches",
			optional: true,
			choices: ["ALLOW", "BLOCK"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "default-action", "text"),
		},
		entries: {
			kind: "parsed",
			brief:
				'Domain entries for this ACL. Each domain must appear at most once. Provide as a JSON array of objects, null, or @path/to/file.json. Shape: [{"action": "ALLOW" | "BLOCK", "domain": string}].',
			optional: true,
			parse: String,
		},
		name: {
			kind: "parsed",
			brief: "Name of the domain ACL",
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
	describe: "Create a new domain ACL",
	usage:
		"$0 zero-trust cws domain-acls create\n\nCreates a domain access control list with its default action and entries.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;

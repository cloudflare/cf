/**
 * update command
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
				'Replacement set of domain entries. Each domain must appear at most once. Provide as a JSON array of objects, null, or @path/to/file.json. Shape: [{"action": "ALLOW" | "BLOCK", "domain": string}].',
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
	operands: [
		{
			placeholder: "domain-acl-id",
			brief: "ID of the domain ACL to update",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "update <domain-acl-id>",
	describe: "Update a domain ACL and replace its entries",
	usage:
		"$0 zero-trust cws domain-acls update <domain-acl-id>\n\nReplaces the domain access control list's name, default action, and entries.",
	...parameters,
	loader: () => import("./update.handler.js"),
});

export default command;

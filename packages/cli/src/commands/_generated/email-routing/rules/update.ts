/**
 * update command
 * @generated from apis/overlays/email-routing.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";
import { resolveFileToken } from "#lib/input-validation.js";

const parameters = {
	flags: {
		actions: {
			kind: "parsed",
			brief:
				'List actions patterns. Provide as a JSON array of objects or @path/to/file.json. Shape: [{"type": "drop" | "forward" | "worker", "value"?: [string]}]. ? marks optional keys.',
			optional: true,
			parse: String,
		},
		enabled: { kind: "boolean", brief: "Routing rule status.", optional: true },
		matchers: {
			kind: "parsed",
			brief:
				'Matching patterns to forward to your actions. Provide as a JSON array of objects or @path/to/file.json. Shape: [{"type": "all" | "literal", "field"?: "to", "value"?: string}]. ? marks optional keys.',
			optional: true,
			parse: String,
		},
		name: {
			kind: "parsed",
			brief: "Routing rule name.",
			optional: true,
			parse: String,
		},
		"owner-worker-tag": {
			kind: "parsed",
			brief:
				"Public tag (script_tag) of the Worker that owns this rule. Required when\n`source` is `wrangler`.\n",
			optional: true,
			parse: String,
		},
		priority: {
			kind: "parsed",
			brief: "Priority of the routing rule.",
			optional: true,
			parse: Number,
		},
		source: {
			kind: "parsed",
			brief:
				"Who manages the rule. `api` covers dashboard, generic API, and Terraform;\n`wrangler` means the rule is managed by a Worker's wrangler.jsonc. Defaults\nto `api` when omitted on write.\n",
			optional: true,
			choices: ["api", "wrangler"],
			parse: String,
			coerce: (value: string) => resolveFileToken(value, "source", "text"),
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
			placeholder: "rule-identifier",
			brief: "Routing rule identifier.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "update <rule-identifier>",
	describe: "Update routing rule",
	usage:
		"$0 email-routing rules update <rule-identifier>\n\nUpdate actions and matches, or enable/disable specific routing rules. Forward actions require exactly one verified destination address.",
	...parameters,
	loader: () => import("./update.handler.js"),
});

export default command;

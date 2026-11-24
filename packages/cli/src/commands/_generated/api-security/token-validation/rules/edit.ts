/**
 * edit command
 * @generated from apis/overlays/api-security.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";
import { resolveFileToken } from "#lib/input-validation.js";

const parameters = {
	flags: {
		action: {
			kind: "parsed",
			brief:
				"Action to take on requests that match operations included in `selector` and fail `expression`.",
			optional: true,
			choices: ["log", "block"],
			parse: String,
			coerce: (value: string) => resolveFileToken(value, "action", "text"),
		},
		description: {
			kind: "parsed",
			brief:
				"A human-readable description that gives more details than `title`.",
			optional: true,
			parse: String,
		},
		enabled: {
			kind: "boolean",
			brief: "Toggle rule on or off.",
			optional: true,
		},
		expression: {
			kind: "parsed",
			brief:
				"Rule expression. Requests that fail to match this expression will be subject to `action`.\n\nFor details on expressions, see the [Cloudflare Docs](https://developers.cloudflare.com/api-shield/security/jwt-validation/).\n",
			optional: true,
			parse: String,
		},
		"selector-exclude": {
			kind: "parsed",
			brief:
				'Ignore operations that were otherwise included by `include`. Provide as a JSON array of objects, null, or @path/to/file.json. Shape: [{"operation_ids"?: [string]}]. ? marks optional keys.',
			optional: true,
			parse: String,
		},
		"selector-include": {
			kind: "parsed",
			brief:
				'Select all matching operations. Provide as a JSON array of objects, null, or @path/to/file.json. Shape: [{"host"?: [string]}]. ? marks optional keys.',
			optional: true,
			parse: String,
		},
		title: {
			kind: "parsed",
			brief: "A human-readable name for the rule.",
			optional: true,
			parse: String,
		},
		"position-index": {
			kind: "parsed",
			brief: "Move rule to this position",
			optional: true,
			parse: Number,
		},
		"position-before": {
			kind: "parsed",
			brief: "Move rule to before rule with this ID.",
			optional: true,
			parse: String,
		},
		"position-after": {
			kind: "parsed",
			brief: "Move rule to after rule with this ID.",
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
			placeholder: "rule-id",
			brief: "Token Validation Rule ID",
			parse: String,
		},
	],
	rules(rules) {
		rules.conflicts("position-index", ["position-before", "position-after"]);
		rules.conflicts("position-before", ["position-index", "position-after"]);
		rules.conflicts("position-after", ["position-index", "position-before"]);
	},
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "edit <rule-id>",
	describe: "Edit a token validation rule",
	usage:
		"$0 api-security token-validation rules edit <rule-id>\n\nUpdates only the supplied fields on a token validation rule.",
	...parameters,
	loader: () => import("./edit.handler.js"),
});

export default command;

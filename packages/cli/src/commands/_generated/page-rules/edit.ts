/**
 * edit command
 * @generated from apis/overlays/page-rules.ts
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
				'The set of actions to perform if the targets of this rule match the\nrequest. Actions can redirect to another URL or override settings, but\nnot both. Provide as a JSON array of objects or @path/to/file.json. Shape: [({"id"?: "always_use_https"} | {"id"?: "automatic_https_rewrites", "value"?: "on" | "off"} | {"id"?: "browser_cache_ttl", "value"?: number} | ...more)]. ? marks optional keys.',
			optional: true,
			parse: String,
		},
		priority: {
			kind: "parsed",
			brief:
				"The priority of the rule, used to define which Page Rule is processed\nover another. A higher number indicates a higher priority. For example,\nif you have a catch-all Page Rule (rule A: `/images/*`) but want a more\nspecific Page Rule to take precedence (rule B: `/images/special/*`),\nspecify a higher priority for rule B so it overrides rule A.\n",
			optional: true,
			parse: Number,
		},
		status: {
			kind: "parsed",
			brief: "The status of the Page Rule.",
			optional: true,
			choices: ["active", "disabled"],
			parse: String,
			coerce: (value: string) => resolveFileToken(value, "status", "text"),
		},
		targets: {
			kind: "parsed",
			brief:
				'The rule targets to evaluate on each request. Provide as a JSON array of objects or @path/to/file.json. Shape: [{"constraint"?: {...}, "target"?: "url"}]. ? marks optional keys.',
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
		{ placeholder: "pagerule-id", brief: "Identifier.", parse: String },
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "edit <pagerule-id>",
	describe: "Edit a Page Rule",
	usage:
		"$0 page-rules edit <pagerule-id>\n\nUpdates one or more fields of an existing Page Rule.",
	...parameters,
	loader: () => import("./edit.handler.js"),
});

export default command;

/**
 * plan command
 * @generated from apis/overlays/email-routing.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"catch-all-rules": {
			kind: "parsed",
			brief:
				'Desired catch-all Email Routing rules managed by the deploying Worker. Provide as a JSON array of objects or @path/to/file.json. Shape: [{"rule": {...}, "target": string}].',
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
		rules: {
			kind: "parsed",
			brief:
				'Desired normal Email Routing rules managed by the deploying Worker. Provide as a JSON array of objects or @path/to/file.json. Shape: [{"actions": [{...}], "matchers": [{...}], "enabled"?: true | false}]. ? marks optional keys.',
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
	command: "plan",
	describe: "Plan account routing rule changes",
	usage:
		"$0 email-routing rules plan\n\nComputes the Email Routing rule changes that would be needed to reconcile a Wrangler-managed desired ruleset. This endpoint is read-only and does not create, update, or delete rules.",
	...parameters,
	loader: () => import("./plan.handler.js"),
});

export default command;

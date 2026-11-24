/**
 * update command
 * @generated from apis/overlays/rulesets.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"ruleset-id": {
			kind: "parsed",
			brief: "The unique ID of the ruleset.",
			parse: String,
		},
		"validate-only": {
			kind: "boolean",
			brief:
				"Validates the request without persisting changes when set to `true`. Responses that normally return 200 return `result: null`; endpoints that normally return 204 continue to return 204.",
			optional: true,
		},
		"position-before": {
			kind: "parsed",
			brief:
				"The ID of another rule to place the rule before. An empty value causes the rule to be placed at the top.",
			optional: true,
			parse: String,
		},
		"position-after": {
			kind: "parsed",
			brief:
				"The ID of another rule to place the rule after. An empty value causes the rule to be placed at the bottom.",
			optional: true,
			parse: String,
		},
		"position-index": {
			kind: "parsed",
			brief:
				"An index at which to place the rule, where index 1 is the first rule.",
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
			placeholder: "rule-id",
			brief: "The unique ID of the rule.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "update <rule-id>",
	describe: "Update an account or zone ruleset rule",
	usage:
		"$0 rulesets rules update <rule-id>\n\nUpdates an existing rule in an account or zone ruleset.\n\nRuns against your account. Pass --zone to run against a zone instead. CLOUDFLARE_ZONE_ID is ignored.",
	...parameters,
	loader: () => import("./update.handler.js"),
});

export default command;

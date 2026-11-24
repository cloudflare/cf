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
		"validate-only": {
			kind: "boolean",
			brief:
				"Validates the request without persisting changes when set to `true`. Responses that normally return 200 return `result: null`; endpoints that normally return 204 continue to return 204.",
			optional: true,
		},
		description: {
			kind: "parsed",
			brief: "An informative description of the ruleset.",
			optional: true,
			parse: String,
		},
		name: {
			kind: "parsed",
			brief: "The human-readable name of the ruleset.",
			optional: true,
			parse: String,
		},
		rules: {
			kind: "parsed",
			brief:
				'The list of rules in the ruleset. Provide as a JSON array of objects or @path/to/file.json. Shape: [(({"action"?: string, "action_parameters"?: {...}, "description"?: string, "enabled"?: boolean, "exposed_credential_check"?: {...}, ...more} & {"action"?: "block", "action_parameters"?: {...}, "description"?: string}) | ...more)]. ? marks optional keys.',
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
		{ placeholder: "phase", brief: "The phase of the ruleset.", parse: String },
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "update <phase>",
	describe: "Update an account or zone entry point ruleset",
	usage:
		"$0 rulesets entrypoint update <phase>\n\nUpdates an account or zone entry point ruleset, creating a new version.\n\nRuns against your account. Pass --zone to run against a zone instead. CLOUDFLARE_ZONE_ID is ignored.",
	...parameters,
	loader: () => import("./update.handler.js"),
});

export default command;

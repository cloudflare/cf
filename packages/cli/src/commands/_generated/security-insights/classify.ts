/**
 * classify command
 * @generated from apis/overlays/security-insights.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";
import { resolveFileToken } from "#lib/input-validation.js";

const parameters = {
	flags: {
		classification: {
			kind: "parsed",
			brief:
				"User-defined classification for the insight. Can be 'false_positive', 'accept_risk', 'other', or null.",
			optional: true,
			choices: ["false_positive", "accept_risk", "other"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "classification", "text"),
		},
		rationale: {
			kind: "parsed",
			brief:
				"Rationale for the classification change. Required when classification is 'accept_risk' or 'other'.",
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
	operands: [{ placeholder: "issue-id", brief: "Issue ID", parse: String }],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "classify <issue-id>",
	describe: "Updates Security Center Insight Classification",
	usage:
		"$0 security-insights classify <issue-id>\n\nUpdates the user classification for a Security Center insight. Valid values are 'false_positive' or 'accept_risk'. To reset, set classification to null. Cannot change directly between classification values - must reset to null first.\n\nRuns against your account. Pass --zone to run against a zone instead. CLOUDFLARE_ZONE_ID is ignored.",
	...parameters,
	loader: () => import("./classify.handler.js"),
});

export default command;

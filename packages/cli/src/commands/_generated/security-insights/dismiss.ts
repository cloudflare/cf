/**
 * dismiss command
 * @generated from apis/overlays/security-insights.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		dismiss: { kind: "boolean", brief: "The dismiss field", optional: true },
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
	command: "dismiss <issue-id>",
	describe: "Archives Security Center Insight",
	usage:
		"$0 security-insights dismiss <issue-id>\n\nArchives a Security Center insight for an account or zone, removing it from the active insights list while preserving historical data.\n\nRuns against your account. Pass --zone to run against a zone instead. CLOUDFLARE_ZONE_ID is ignored.",
	...parameters,
	loader: () => import("./dismiss.handler.js"),
});

export default command;

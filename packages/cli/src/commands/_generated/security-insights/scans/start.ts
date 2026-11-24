/**
 * start command
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
		"issue-type": {
			kind: "parsed",
			brief: "The issue_type field",
			optional: true,
			choices: [
				"compliance_violation",
				"email_security",
				"exposed_infrastructure",
				"insecure_configuration",
				"weak_authentication",
				"configuration_suggestion",
			],
			parse: String,
			coerce: (value: string) => resolveFileToken(value, "issue-type", "text"),
		},
		"issue-class": {
			kind: "parsed",
			brief: "The issue_class field",
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
			brief:
				"Request body for starting an on-demand scan. Specify issue_type or issue_class to scope the scan, or provide an empty object to scan all issue types.",
			optional: true,
			parse: String,
		},
	},
	operands: [],
	rules(rules) {
		rules.conflicts("issue-type", ["issue-class"]);
		rules.conflicts("issue-class", ["issue-type"]);
	},
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "start",
	describe: "Start On-Demand account or zone Scan",
	usage:
		"$0 security-insights scans start\n\nInitiates an on-demand security scan for the entire account or zone, scanning all zones associated with the account or zone. Rate limited to 5 scans per account or zone per 24-hour window.\n\nRuns against your account. Pass --zone to run against a zone instead. CLOUDFLARE_ZONE_ID is ignored.",
	...parameters,
	loader: () => import("./start.handler.js"),
});

export default command;

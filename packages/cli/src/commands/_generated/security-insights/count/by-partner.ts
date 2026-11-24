/**
 * by-partner command
 * @generated from apis/overlays/security-insights.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		source: { kind: "enum", brief: "Source", values: ["riskrecon"] },
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "by-partner",
	describe: "Retrieves a Partner Security Center Insight Count",
	usage:
		"$0 security-insights count by-partner\n\nRetrieves the uncapped count of active, non-dismissed, unclassified RiskRecon insights for the account or zone.\n\nRuns against your account. Pass --zone to run against a zone instead. CLOUDFLARE_ZONE_ID is ignored.",
	...parameters,
	loader: () => import("./by-partner.handler.js"),
});

export default command;

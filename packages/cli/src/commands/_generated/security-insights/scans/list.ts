/**
 * list command
 * @generated from apis/overlays/security-insights.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
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
	command: "list",
	describe: "Get Recent account or zone Scans",
	usage:
		"$0 security-insights scans list\n\nReturns the most recent on-demand scans for the account or zone, up to a maximum of 5. Each scan includes its ID, start time, and current status. This includes both account or zone-wide and zone-scoped scans. Also returns quota information showing how many scans have been used and how many remain in the current 24-hour window.\n\nRuns against your account. Pass --zone to run against a zone instead. CLOUDFLARE_ZONE_ID is ignored.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;

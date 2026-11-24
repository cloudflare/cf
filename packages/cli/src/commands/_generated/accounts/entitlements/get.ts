/**
 * get command
 * @generated from apis/overlays/accounts.ts
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
	command: "get",
	describe: "Get account or zone Entitlements",
	usage:
		"$0 accounts entitlements get\n\nReturns the list of entitlements (features and their allocations) for a given account or zone. Each entitlement describes a product feature the account or zone is permitted to use and the allocation value (boolean, count, range, enum, or string) that governs its behaviour.\n\nRuns against your account. Pass --zone to run against a zone instead. CLOUDFLARE_ZONE_ID is ignored.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;

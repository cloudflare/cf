/**
 * list command
 * @generated from apis/overlays/billing.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"policy-id": {
			kind: "parsed",
			brief: "Identifies the spend policy.",
			parse: String,
		},
		limit: {
			kind: "parsed",
			brief:
				"Maximum number of audit entries to return. Defaults to 50. Values above 100 are capped at 100 rather than rejected.",
			optional: true,
			parse: Number,
		},
		period: {
			kind: "enum",
			brief:
				"Select current subscription billing-cycle history or history across all cycles.",
			values: ["current_billing_cycle", "all"],
			optional: true,
		},
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
	describe: "List Spend Policy Audit Entries",
	usage:
		"$0 billing spend-policies audit list\n\nReturns the policy's evaluation history, newest first. At most one threshold-crossing entry (`limit_reached`) is recorded per policy version and billing period, so a policy update can record a new entry without any change in balance. Disabled policies still return their history; deleted policies return `404`. There is no pagination: use `limit` to set how many entries come back. Defaults to `period=current_billing_cycle`, resolved from the product's canonical aggregates, not calendar months. Crossings match their recorded billing-period bounds, even if recorded late. Set `period=all` for history across cycles. Filtering happens before LIMIT. No current cycle returns an empty array; unavailable or disabled cycle resolution returns `503` with code `1013`, never an empty success.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;

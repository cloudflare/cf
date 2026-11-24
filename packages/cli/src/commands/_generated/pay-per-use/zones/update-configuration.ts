/**
 * update-configuration command
 * @generated from apis/overlays/pay-per-use.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		enabled: { kind: "boolean", brief: "The enabled field", optional: true },
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		body: {
			kind: "parsed",
			brief: "Pay-per-use zone configuration update",
			optional: true,
			parse: String,
		},
	},
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "update-configuration",
	describe: "Update pay-per-use zone configuration",
	usage:
		"$0 pay-per-use zones update-configuration\n\nEnables or disables an existing pay-per-use zone configuration. Omitting enabled leaves the zone unchanged. Enabling a disabled billable zone requires completed publisher Stripe onboarding, while non-billable zones do not; an already-enabled zone is not affected by later Stripe status changes. Disabling starts a disabled period immediately while existing accepted licenses remain active until the start of the next UTC month; re-enabling before expiry clears the schedule and restores those licenses.",
	...parameters,
	loader: () => import("./update-configuration.handler.js"),
});

export default command;

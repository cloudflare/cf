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
		"default-price-usd-microcents": {
			kind: "parsed",
			brief:
				"Default price in microcents. 1 USD = 100,000,000 microcents. Must be a multiple of 100,000 ($0.001) between $0.001 and $9,999.999.",
			optional: true,
			parse: Number,
		},
		enabled: { kind: "boolean", brief: "The enabled field", optional: true },
		name: {
			kind: "parsed",
			brief: "The name field",
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
			brief: "Pay-per-use operator configuration update",
			optional: true,
			parse: String,
		},
	},
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "update-configuration",
	describe: "Update pay-per-use operator configuration",
	usage:
		"$0 pay-per-use operator update-configuration\n\nUpdates one or more fields of an existing pay-per-use operator configuration. Re-enabling a disabled billable operator requires completed Stripe onboarding, while non-billable operators do not; an already-enabled operator is not affected by later Stripe status changes. A Cloudflare-verified operator's name and default price cannot be changed.",
	...parameters,
	loader: () => import("./update-configuration.handler.js"),
});

export default command;

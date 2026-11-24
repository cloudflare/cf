/**
 * create command
 * @generated from apis/overlays/pay-per-use.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"price-usd-microcents": {
			kind: "parsed",
			brief:
				"Offered price per use in USD microcents. Omit it or send null when no price is agreed yet.",
			optional: true,
			parse: Number,
		},
		"publisher-id": {
			kind: "parsed",
			brief: "Identifier of the publisher the offer is made to.",
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
			brief: "Pay-per-use agreement",
			optional: true,
			parse: String,
		},
	},
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "create",
	describe: "Propose a pay-per-use agreement",
	usage:
		"$0 pay-per-use agreements create\n\nSubmits the requesting buyer's offer to a publisher. A buyer has one open offer per publisher; a second returns 409. A missing or null price means no price is agreed yet. The account needs a pay-per-use operator configuration, but neither side needs to be enabled or Cloudflare verified.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;

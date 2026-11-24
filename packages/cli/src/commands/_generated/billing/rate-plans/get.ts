/**
 * get command
 * @generated from apis/overlays/billing.ts
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
	operands: [
		{
			placeholder: "public-key",
			brief: "The public key identifier for the rate plan.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <public-key>",
	describe: "Get Rate Plan by Public Key",
	usage:
		"$0 billing rate-plans get <public-key>\n\nGets a rate plan's details by its public key (e.g., 'teams_free', 'cf_pro_20_20'). This is a public catalog endpoint, so authentication is not enforced and credentials are accepted but not required.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;

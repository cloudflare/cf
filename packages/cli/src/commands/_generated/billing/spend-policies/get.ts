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
			placeholder: "policy-id",
			brief: "Identifies the spend policy.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <policy-id>",
	describe: "Get Spend Policy",
	usage:
		"$0 billing spend-policies get <policy-id>\n\nReturns one spend policy. The `ETag` response header holds the current `version`; send it as `If-Match` on a later update or delete.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;

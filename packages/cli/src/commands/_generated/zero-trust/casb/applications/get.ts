/**
 * get command
 * @generated from apis/overlays/zero-trust.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		environment: {
			kind: "enum",
			brief:
				"Environment to request (standard, fedramp). The result follows the account's FedRAMP entitlement: FedRAMP-enabled accounts always receive FedRAMP applications and other accounts receive standard applications. Any other non-empty value returns 400.",
			values: ["fedramp", "standard"],
			optional: true,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [
		{
			placeholder: "application-id",
			brief: "Application/vendor identifier.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <application-id>",
	describe: "Get application details",
	usage:
		"$0 zero-trust casb applications get <application-id>\n\nReturns full application details including auth methods, use cases, and permissions.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;

/**
 * list command
 * @generated from apis/overlays/zero-trust.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"application-id": {
			kind: "parsed",
			brief: "Application/vendor identifier.",
			parse: String,
		},
		environment: {
			kind: "enum",
			brief:
				"Environment to request (standard, fedramp). The result follows the account's FedRAMP entitlement: FedRAMP-enabled accounts always receive FedRAMP applications and other accounts receive standard applications. Any other non-empty value returns 400.",
			values: ["fedramp", "standard"],
			optional: true,
		},
		page: {
			kind: "parsed",
			brief: "A page number within the paginated result set.",
			optional: true,
			parse: Number,
		},
		"page-size": {
			kind: "parsed",
			brief: "Number of results to return per page.",
			optional: true,
			parse: Number,
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
	describe: "Get auth methods",
	usage:
		"$0 zero-trust casb applications auth-methods list\n\nReturns available auth methods for the specified vendor, including credential schema, instructions, and example payloads. Use this to understand what credentials are required before calling POST /v2/integrations.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;

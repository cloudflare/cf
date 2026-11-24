/**
 * create command
 * @generated from apis/overlays/ssl.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		csr: {
			kind: "parsed",
			brief: "The Certificate Signing Request (CSR). Must be newline-encoded.",
			optional: true,
			parse: String,
		},
		"validity-days": {
			kind: "parsed",
			brief:
				"The number of days the Client Certificate will be valid after the issued_on date.",
			optional: true,
			parse: Number,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		body: {
			kind: "parsed",
			brief: "Raw JSON request body (bypasses individual flags)",
			optional: true,
			parse: String,
		},
	},
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "create",
	describe: "Create Client Certificate",
	usage:
		"$0 ssl client-certificates create\n\nCreate a new API Shield mTLS Client Certificate.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;

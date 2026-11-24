/**
 * toggle-pdf-invoices command
 * @generated from apis/overlays/accounts.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		toggle: {
			kind: "boolean",
			brief: "Whether to enable or disable PDF invoice generation.",
			optional: true,
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
	command: "toggle-pdf-invoices",
	describe: "Toggle PDF Invoices",
	usage:
		"$0 accounts billing toggle-pdf-invoices\n\nToggles PDF invoice generation for an account.",
	...parameters,
	loader: () => import("./toggle-pdf-invoices.handler.js"),
});

export default command;

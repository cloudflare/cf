/**
 * create command
 * @generated from apis/overlays/brand-protection.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		brand: {
			kind: "parsed",
			brief: "The brand field",
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
	describe: "Analyze domains for brand impersonation",
	usage:
		"$0 brand-protection trial create\n\nUses AI to scan all domains in the lookback table and identify potential phishing or impersonation attempts against the given brand string.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;

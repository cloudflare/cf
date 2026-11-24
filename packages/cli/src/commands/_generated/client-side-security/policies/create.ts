/**
 * create command
 * @generated from apis/overlays/client-side-security.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";
import { resolveFileToken } from "#lib/input-validation.js";

const parameters = {
	flags: {
		action: {
			kind: "parsed",
			brief: "The action to take if the expression matches",
			optional: true,
			choices: ["allow", "log", "add_reporting_directives"],
			parse: String,
			coerce: (value: string) => resolveFileToken(value, "action", "text"),
		},
		description: {
			kind: "parsed",
			brief: "A description for the policy",
			optional: true,
			parse: String,
		},
		enabled: {
			kind: "boolean",
			brief: "Whether the policy is enabled",
			optional: true,
		},
		expression: {
			kind: "parsed",
			brief:
				"The expression which must match for the policy to be applied, using the Cloudflare Firewall rule expression syntax",
			optional: true,
			parse: String,
		},
		value: {
			kind: "parsed",
			brief: "The policy which will be applied",
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
	describe: "Create a content security rule",
	usage:
		"$0 client-side-security policies create\n\nCreates a rule that applies a client-side security action when its filter expression matches.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;

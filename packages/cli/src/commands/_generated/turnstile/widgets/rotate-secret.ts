/**
 * rotate-secret command
 * @generated from apis/overlays/turnstile.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"invalidate-immediately": {
			kind: "boolean",
			brief:
				"If `invalidate_immediately` is set to `false`, the previous secret will\nremain valid for two hours. Otherwise, the secret is immediately\ninvalidated, and requests using it will be rejected.\n",
			default: false,
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
	operands: [
		{
			placeholder: "sitekey",
			brief: "Unique identifier for a Turnstile widget.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "rotate-secret <sitekey>",
	describe: "Rotate Secret for a Turnstile Widget",
	usage:
		"$0 turnstile widgets rotate-secret <sitekey>\n\nGenerates a new secret key for this widget. If `invalidate_immediately` is set to `false`, the previous secret remains valid for 2 hours. Note that secrets cannot be rotated again during the grace period.",
	...parameters,
	loader: () => import("./rotate-secret.handler.js"),
});

export default command;

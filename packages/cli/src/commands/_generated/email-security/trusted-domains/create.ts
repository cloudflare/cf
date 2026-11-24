/**
 * create command
 * @generated from apis/overlays/email-security.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		comments: {
			kind: "parsed",
			brief: "The comments field",
			optional: true,
			parse: String,
		},
		"is-recent": {
			kind: "boolean",
			brief:
				"Select to prevent recently registered domains from triggering a Suspicious or Malicious disposition.",
			optional: true,
		},
		"is-regex": {
			kind: "boolean",
			brief:
				"Whether `pattern` is a regular expression instead of a literal domain.",
			optional: true,
		},
		"is-similarity": {
			kind: "boolean",
			brief:
				"Select for partner or other approved domains that have similar spelling to your connected domains. Prevents listed domains from triggering a Spoof disposition.",
			optional: true,
		},
		pattern: {
			kind: "parsed",
			brief: "The domain pattern to trust, e.g. `example.com`.",
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
			brief: "Create a trusted domain.",
			optional: true,
			parse: String,
		},
	},
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "create",
	describe: "Create trusted email domain",
	usage:
		"$0 email-security trusted-domains create\n\nCreates a new trusted domain pattern. Use for partner domains or approved senders that should bypass recent domain registration and similarity checks. Configure whether it prevents recent domain or spoof dispositions.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;

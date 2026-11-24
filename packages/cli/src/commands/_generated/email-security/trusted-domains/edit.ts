/**
 * edit command
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
			brief: "Update a trusted domain.",
			optional: true,
			parse: String,
		},
	},
	operands: [
		{
			placeholder: "trusted-domain-id",
			brief: "Trusted domain identifier.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "edit <trusted-domain-id>",
	describe: "Update a trusted email domain",
	usage:
		"$0 email-security trusted-domains edit <trusted-domain-id>\n\nUpdates an existing trusted domain pattern. Only provided fields will be modified. Changes take effect for new emails matching the pattern.",
	...parameters,
	loader: () => import("./edit.handler.js"),
});

export default command;

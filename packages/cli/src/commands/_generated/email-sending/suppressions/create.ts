/**
 * create command
 * @generated from apis/overlays/email-sending.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";
import { resolveFileToken } from "#lib/input-validation.js";

const parameters = {
	flags: {
		email: {
			kind: "parsed",
			brief: "The email address to suppress.",
			optional: true,
			parse: String,
		},
		"expires-at": {
			kind: "parsed",
			brief:
				"Expiration timestamp for the suppression. Omit or set to null for a permanent suppression that never expires.",
			optional: true,
			parse: String,
		},
		note: {
			kind: "parsed",
			brief:
				"Advisory note for this suppression. Not enforced or validated beyond length.",
			optional: true,
			parse: String,
		},
		"scope-type": {
			kind: "parsed",
			brief:
				"Variant descriptions:\n- `account`: Blocks the recipient for every sending domain of the account.\n- `sending_domain`: Blocks the recipient only for mail whose envelope MAIL FROM uses `value`.",
			optional: true,
			choices: ["account", "sending_domain"],
			parse: String,
			coerce: (value: string) => resolveFileToken(value, "scope-type", "text"),
		},
		"scope-value": {
			kind: "parsed",
			brief:
				"The sending domain to suppress for: the domain part of the envelope MAIL FROM. It is lowercased and trailing dots are removed. Internationalized domains must use the ASCII (punycode) form. Ownership is not checked; a domain the account does not send from never matches.",
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
	rules(rules) {
		rules.check((argv) => {
			const groupSet = ["scope-type", "scope-value"].some(
				(k) => argv[k] !== undefined
			);
			if (!argv.body && groupSet) {
				const missing = ["scope-type"].filter((k) => argv[k] === undefined);
				if (missing.length > 0) {
					throw new Error(
						`${missing.map((m) => "--" + m).join(", ")} ${missing.length === 1 ? "is" : "are"} required when any --scope-* flag is set`
					);
				}
			}
			return true;
		});
	},
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "create",
	describe: "Create account Email Sending suppression",
	usage:
		"$0 email-sending suppressions create\n\nCreates a suppression for every sending domain of the account (default) or for one sending domain (`scope.type = sending_domain`). Creating an existing active suppression returns its identifier.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;

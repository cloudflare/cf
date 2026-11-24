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
		enabled: {
			kind: "boolean",
			brief: "Whether the policy is active.",
			optional: true,
		},
		"expires-at": {
			kind: "parsed",
			brief:
				"Timestamp at which the policy expires. After this time, Email Security ignores the policy. The value must lie in the future. Send `null` to clear the expiration.",
			optional: true,
			parse: String,
		},
		name: {
			kind: "parsed",
			brief: "Human-readable name of the policy.",
			optional: true,
			parse: String,
		},
		notes: {
			kind: "parsed",
			brief: "Optional note describing the purpose of the policy.",
			optional: true,
			parse: String,
		},
		pattern: {
			kind: "parsed",
			brief: "Regular expression the policy matches against.",
			optional: true,
			parse: String,
		},
		targets: {
			kind: "parsed",
			brief: "Parts of the email the pattern is matched against.",
			variadic: true,
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
			brief: "Create a content policy.",
			optional: true,
			parse: String,
		},
	},
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "create",
	describe: "Create a content policy",
	usage:
		"$0 email-security content-policies create\n\nCreates a new content policy. Emails whose subject or body matches the pattern will be subject to the configured action.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;
